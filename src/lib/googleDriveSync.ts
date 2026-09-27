import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { Phrase } from '../types';

const effectiveFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(effectiveFirebaseConfig) : getApp();
export const auth = getAuth(app);

export function initGoogleDriveAuth(
  onUserChanged: (user: User | null, token: string | null) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        onUserChanged(user, cachedAccessToken);
      } else {
        onUserChanged(user, null);
      }
    } else {
      cachedAccessToken = null;
      onUserChanged(null, null);
    }
  });
}

export async function loginWithGoogle(): Promise<{ user: User; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;

    if (!token) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Erro de login com o Google:', error);
    throw error;
  }
}

export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

const FILE_NAME = 'deskflow-phrases.json';

/**
 * Searches for deskflow-phrases.json in Google Drive root
 */
async function findDriveFile(accessToken: string): Promise<{ id: string } | null> {
  const query = encodeURIComponent(`name = '${FILE_NAME}' and trashed = false`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar arquivo no Google Drive: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return { id: data.files[0].id };
  }
  return null;
}

/**
 * Uploads (creates or updates) deskflow-phrases.json on Google Drive
 */
export async function savePhrasesToGoogleDrive(
  accessToken: string, 
  phrases: Phrase[]
): Promise<{ success: boolean; fileId: string; message: string }> {
  const content = JSON.stringify(phrases, null, 2);
  const existingFile = await findDriveFile(accessToken);

  if (existingFile) {
    // Update existing file
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const res = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: content
    });

    if (!res.ok) {
      throw new Error(`Falha ao atualizar arquivo no Google Drive (${res.status})`);
    }

    return {
      success: true,
      fileId: existingFile.id,
      message: 'Fraseologias salvas e atualizadas com sucesso no seu Google Drive!'
    };
  } else {
    // Create new file via multipart upload
    const metadata = {
      name: FILE_NAME,
      mimeType: 'application/json'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      throw new Error(`Falha ao criar novo arquivo no Google Drive (${res.status})`);
    }

    const created = await res.json();
    return {
      success: true,
      fileId: created.id,
      message: 'Arquivo "deskflow-phrases.json" criado com sucesso no seu Google Drive!'
    };
  }
}

/**
 * Downloads deskflow-phrases.json from Google Drive
 */
export async function loadPhrasesFromGoogleDrive(
  accessToken: string
): Promise<{ phrases: Phrase[]; message: string }> {
  const file = await findDriveFile(accessToken);
  if (!file) {
    throw new Error('Nenhum arquivo "deskflow-phrases.json" foi encontrado no seu Google Drive.');
  }

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  const res = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Erro ao baixar arquivo do Google Drive (${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('O conteúdo do arquivo no Google Drive não é uma lista válida de fraseologias.');
  }

  return {
    phrases: data,
    message: `${data.length} fraseologia(s) recuperadas do seu Google Drive!`
  };
}
