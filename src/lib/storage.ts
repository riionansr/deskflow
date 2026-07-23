import { Phrase } from '../types';
import { initialPhrases } from '../data/defaultPhrases';

const PHRASES_STORAGE_KEY = 'deskflow_phrases_v1';
const GITHUB_CONFIG_KEY = 'deskflow_github_config_v1';
const GEMINI_KEY = 'deskflow_gemini_api_key_v1';

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
