import { Phrase } from '../types';
import { initialPhrases } from '../data/defaultPhrases';

const PHRASES_STORAGE_KEY = 'deskflow_phrases_v1';
const GITHUB_CONFIG_KEY = 'deskflow_github_config_v1';
const GEMINI_KEY = 'deskflow_gemini_api_key_v1';
const CATEGORIES_STORAGE_KEY = 'deskflow_categories_v1';
const SIGNATURE_STORAGE_KEY = 'deskflow_signature_v1';

export const DEFAULT_CATEGORIES = [
  'N2 / N3',
  'VPN',
  'Senha & Reset',
  'Acessos & Redes',
  'Impressoras',
  'Software',
  'Terceiros',
  'Tentativas & Pendente',
  'Outros'
];

export const DEFAULT_SIGNATURE = `\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI\nPortal de Atendimento e Chamados`;

/**
 * Load categories list from LocalStorage.
 */
export function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!parsed.includes('Outros')) {
          parsed.push('Outros');
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load categories:', err);
  }
  return [...DEFAULT_CATEGORIES];
}

/**
 * Save categories list to LocalStorage.
 */
export function saveCategories(categories: string[]): boolean {
  try {
    const clean = Array.from(new Set(categories.map(c => c.trim()).filter(Boolean)));
    if (!clean.includes('Outros')) {
      clean.push('Outros');
    }
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(clean));
    return true;
  } catch (err) {
    console.error('Failed to save categories:', err);
    return false;
  }
}

/**
 * Load custom signature text from LocalStorage.
 */
export function loadCustomSignature(): string {
  try {
    const raw = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (raw !== null) {
      return raw;
    }
  } catch (err) {
    console.warn('Failed to load signature:', err);
  }
  return DEFAULT_SIGNATURE;
}

/**
 * Save custom signature text to LocalStorage.
 */
export function saveCustomSignature(sig: string): boolean {
  try {
    localStorage.setItem(SIGNATURE_STORAGE_KEY, sig);
    return true;
  } catch (err) {
    console.error('Failed to save signature:', err);
    return false;
  }
}

export interface GitHubConfig {
  token: string;
  repo: string; // e.g. 'username/repo'
  path: string; // e.g. 'deskflow-phrases.json'
  branch?: string; // e.g. 'main'
  autoSyncOnSave?: boolean;
}

/**
 * Load phrases from browser LocalStorage.
 * Falls back to defaultPhrases if empty.
 */
export function loadLocalPhrases(): Phrase[] {
  try {
    const raw = localStorage.getItem(PHRASES_STORAGE_KEY);
    if (!raw) {
      const defaults = initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
      saveLocalPhrases(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a: Phrase, b: Phrase) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
    return initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
  } catch (err) {
    console.warn('Failed to load local phrases from LocalStorage:', err);
    return initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
  }
}

/**
 * Save phrases array to browser LocalStorage.
 */
export function saveLocalPhrases(phrases: Phrase[]): boolean {
  try {
    localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrases));
    return true;
  } catch (err) {
    console.error('Failed to save phrases to LocalStorage:', err);
    return false;
  }
}

/**
 * Load GitHub BYOD Sync config
 */
export function loadGitHubConfig(): GitHubConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load GitHub config:', err);
  }
  return {
    token: '',
    repo: '',
    path: 'deskflow-phrases.json',
    branch: 'main',
    autoSyncOnSave: false,
  };
}

/**
 * Save GitHub BYOD Sync config
 */
export function saveGitHubConfig(config: GitHubConfig): boolean {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save GitHub config:', err);
    return false;
  }
}

/**
 * Load user BYO Gemini API Key
 */
export function loadGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save user BYO Gemini API Key
 */
export function saveGeminiKey(key: string): boolean {
  try {
    localStorage.setItem(GEMINI_KEY, key.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset local storage back to initial defaults
 */
export function resetLocalPhrasesToDefault(): Phrase[] {
  const defaults = initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
  saveLocalPhrases(defaults);
  return defaults;
}

/**
 * Export full local state backup as JSON blob download
 */
export function downloadBackupJSON(phrases: Phrase[]): void {
  const dataStr = JSON.stringify(phrases, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `deskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
