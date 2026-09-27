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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let authInstance: any = null;

export function getFirebaseAuth(): any {
  if (authInstance) return authInstance;
  if (!effectiveFirebaseConfig.apiKey) {
    return null;
  }
  try {
    const app = getApps().length === 0 ? initializeApp(effectiveFirebaseConfig) : getApp();
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('Firebase init error:', err);
    return null;
  }
}

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

const TOKEN_KEY = 'deskflow_gdrive_token';
const TOKEN_TIME_KEY = 'deskflow_gdrive_token_time';

export function getSavedGoogleToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const timeStr = localStorage.getItem(TOKEN_TIME_KEY) || sessionStorage.getItem(TOKEN_TIME_KEY);
  if (!token) return null;
  if (timeStr) {
    const elapsed = Date.now() - parseInt(timeStr, 10);
    // Token expires after ~55 minutes
    if (elapsed > 55 * 60 * 1000) {
      clearGoogleToken();
      return null;
    }
  }
  return token;
}

export function saveGoogleToken(token: string) {
  if (typeof window === 'undefined') return;
  const now = Date.now().toString();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TIME_KEY, now);
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_TIME_KEY, now);
}

export function clearGoogleToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TIME_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_TIME_KEY);
}

let cachedAccessToken: string | null = getSavedGoogleToken();

export function getCachedToken(): string | null {
  return cachedAccessToken || getSavedGoogleToken();
}

export function initGoogleDriveAuth(
  onUserChanged: (user: User | null, token: string | null) => void
) {
  const auth = getFirebaseAuth();
  if (!auth) {
    onUserChanged(null, null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = getSavedGoogleToken();
      cachedAccessToken = token;
      onUserChanged(user, token);
    } else {
      cachedAccessToken = null;
      clearGoogleToken();
      onUserChanged(null, null);
    }
  });
}

export async function loginWithGoogle(): Promise<{ user: User; accessToken: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Configurações do Firebase ausentes no ambiente. Configure as variáveis VITE_FIREBASE_* na Vercel.');
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;

    if (!token) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = token;
    saveGoogleToken(token);
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Erro de login com o Google:', error);
    throw error;
  }
}

export async function logoutGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
  clearGoogleToken();
}

const FILE_NAME = 'deskflow-phrases.json';

async function parseGoogleError(response: Response, defaultMessage: string): Promise<string> {
  try {
    const errorJson = await response.json();
    if (errorJson?.error?.message) {
      const msg = errorJson.error.message;
      if (msg.includes('has not been used in project') || msg.includes('disabled') || msg.includes('Google Drive API')) {
        const projectQuery = effectiveFirebaseConfig.projectId ? `?project=${effectiveFirebaseConfig.projectId}` : '';
        return `A API do Google Drive está desativada no seu projeto Google Cloud. Acesse https://console.cloud.google.com/apis/library/drive.googleapis.com${projectQuery} e clique em 'Ativar'.`;
      }
      return `${msg} (HTTP ${response.status})`;
    }
  } catch (_) {
    // ignore json parsing errors
  }
  return `${defaultMessage} (HTTP ${response.status}${response.statusText ? `: ${response.statusText}` : ''})`;
}

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
    const errorMessage = await parseGoogleError(response, 'Erro ao consultar o Google Drive');
    throw new Error(errorMessage);
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
      const errorMsg = await parseGoogleError(res, 'Falha ao atualizar arquivo no Google Drive');
      throw new Error(errorMsg);
    }

    return {
      success: true,
      fileId: existingFile.id,
      message: 'Fraseologias salvas e atualizadas com sucesso no seu Google Drive!'
    };
  } else {
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
      const errorMsg = await parseGoogleError(res, 'Falha ao criar novo arquivo no Google Drive');
      throw new Error(errorMsg);
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
    const errorMsg = await parseGoogleError(res, 'Erro ao baixar arquivo do Google Drive');
    throw new Error(errorMsg);
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

/**
 * Automatically syncs with Google Drive upon login:
 * If deskflow-phrases.json exists on Drive, downloads it.
 * If it doesn't exist, uploads the current local phrases.
 */
export async function autoSyncWithGoogleDrive(
  accessToken: string,
  localPhrases: Phrase[]
): Promise<{ phrases: Phrase[]; action: 'loaded' | 'uploaded' | 'none'; message: string }> {
  const existingFile = await findDriveFile(accessToken);
  if (existingFile) {
    const driveData = await loadPhrasesFromGoogleDrive(accessToken);
    return {
      phrases: driveData.phrases,
      action: 'loaded',
      message: `${driveData.phrases.length} fraseologia(s) carregadas da sua nuvem Google Drive!`
    };
  } else if (localPhrases.length > 0) {
    const uploadRes = await savePhrasesToGoogleDrive(accessToken, localPhrases);
    return {
      phrases: localPhrases,
      action: 'uploaded',
      message: uploadRes.message
    };
  }
  return {
    phrases: localPhrases,
    action: 'none',
    message: 'Nenhum dado para sincronizar.'
  };
}
