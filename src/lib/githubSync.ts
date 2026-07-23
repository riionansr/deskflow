import { Phrase } from '../types';
import { GitHubConfig } from './storage';

// Helper for UTF-8 Base64 encoding in browser
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper for UTF-8 Base64 decoding in browser
function base64ToUtf8(base64Str: string): string {
  // Remove potential whitespace/newlines from GitHub API base64 response
  const cleaned = base64Str.replace(/\n/g, '').replace(/\r/g, '');
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Pushes the phrases array to a GitHub repository file using the user's PAT token.
 */
export async function pushPhrasesToGitHub(
  config: GitHubConfig,
  phrases: Phrase[],
  commitMessage: string = 'Update phraseology list via DeskFlow Community BYOD'
): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  if (!config.token.trim()) {
    throw new Error('Token de acesso pessoal do GitHub (PAT) não informado.');
  }
  if (!config.repo.trim() || !config.repo.includes('/')) {
    throw new Error('Formato de repositório inválido. Use o formato: usuario/nome-do-repositorio');
  }

  const [owner, repoName] = config.repo.trim().split('/');
  const path = (config.path || 'deskflow-phrases.json').replace(/^\//, '');
  const branch = config.branch || 'main';

  const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${config.token.trim()}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    // Step 1: Check if file already exists to obtain its current sha
    let existingSha: string | undefined = undefined;
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });
    
    if (getRes.ok) {
      const existingData = await getRes.json();
      existingSha = existingData.sha;
    } else if (getRes.status !== 404 && getRes.status !== 400) {
      if (getRes.status === 401) {
        throw new Error('Token do GitHub inválido ou expirado (401 Unauthorized).');
      }
      if (getRes.status === 403) {
        throw new Error('Sem permissão de gravação no repositório com este Token (403 Forbidden). Verifique escopo "repo" ou "contents:write".');
      }
    }

    // Step 2: Prepare JSON content & Base64 payload
    const jsonContent = JSON.stringify(phrases, null, 2);
    const contentBase64 = utf8ToBase64(jsonContent);

    const body: any = {
      message: commitMessage,
      content: contentBase64,
      branch,
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    // Step 3: PUT request to GitHub API
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      throw new Error(errJson.message || `Erro do GitHub (${putRes.status}).`);
    }

    const resData = await putRes.json();
    return {
      success: true,
      message: 'Fraseologias sincronizadas com sucesso no GitHub!',
      commitUrl: resData.commit?.html_url,
    };
  } catch (err: any) {
    console.error('GitHub Push Error:', err);
    throw new Error(err.message || 'Falha ao conectar à API do GitHub.');
  }
}

/**
 * Pulls phrases array from a GitHub repository file using the user's PAT token or public raw URL.
 */
export async function pullPhrasesFromGitHub(
  config: GitHubConfig
): Promise<{ success: boolean; phrases: Phrase[]; message: string }> {
  if (!config.repo.trim() || !config.repo.includes('/')) {
    throw new Error('Formato de repositório inválido. Use o formato: usuario/nome-do-repositorio');
  }

  const [owner, repoName] = config.repo.trim().split('/');
  const path = (config.path || 'deskflow-phrases.json').replace(/^\//, '');
  const branch = config.branch || 'main';

  const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branch}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (config.token.trim()) {
    headers.Authorization = `Bearer ${config.token.trim()}`;
  }

  try {
    const res = await fetch(apiUrl, { headers });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Arquivo "${path}" não encontrado no repositório "${config.repo}" (branch ${branch}).`);
      }
      if (res.status === 401) {
        throw new Error('Token do GitHub inválido ou sem permissão para este repositório.');
      }
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Erro do GitHub (${res.status}).`);
    }

    const data = await res.json();
    if (!data.content) {
      throw new Error('O arquivo retornado do GitHub está vazio ou em formato inesperado.');
    }

    const decodedText = base64ToUtf8(data.content);
    const parsed = JSON.parse(decodedText);

    if (!Array.isArray(parsed)) {
      throw new Error('O arquivo no GitHub não contém uma lista válida (JSON Array) de fraseologias.');
    }

    // Basic structure validation
    const validPhrases: Phrase[] = parsed.map((item: any, idx: number) => ({
      id: item.id || `gh-${Date.now()}-${idx}`,
      title: item.title || 'Sem título',
      subtitle: item.subtitle || '',
      content: item.content || '',
      category: item.category || 'Outros',
      tags: Array.isArray(item.tags) ? item.tags : [],
      updatedAt: item.updatedAt || new Date().toISOString(),
      orderIndex: item.orderIndex ?? (idx + 1),
      pinned: !!item.pinned,
    }));

    return {
      success: true,
      phrases: validPhrases,
      message: `Baixadas ${validPhrases.length} fraseologias do GitHub com sucesso!`,
    };
  } catch (err: any) {
    console.error('GitHub Pull Error:', err);
    throw new Error(err.message || 'Falha ao baixar do GitHub.');
  }
}
