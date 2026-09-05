import { Phrase } from '../types';
import { initialPhrases, LEGACY_DEFAULT_PHRASE_IDS } from '../data/defaultPhrases';

const PHRASES_STORAGE_KEY = 'deskflow_phrases_v1';
const GITHUB_CONFIG_KEY = 'deskflow_github_config_v1';
const CATEGORIES_STORAGE_KEY = 'deskflow_categories_v1';
const SIGNATURE_STORAGE_KEY = 'deskflow_signature_v1';
const BYOD_MIGRATION_KEY = 'deskflow_byod_zerado_v1';
const CATEGORIES_MIGRATION_KEY = 'deskflow_byod_zerado_categories_v1';
const SIGNATURE_MIGRATION_KEY = 'deskflow_byod_zerado_signature_v2';

// No modelo Community BYOD, o catálogo de categorias inicia zerado (vazio).
export const DEFAULT_CATEGORIES: string[] = [];

// No modelo Community BYOD, a assinatura inicia zerada (vazia).
export const DEFAULT_SIGNATURE = '';

/**
 * Load categories list from LocalStorage.
 * In Community BYOD mode, starts empty (zerado).
 */
export function loadCategories(): string[] {
  try {
    // Migration: clear old default categories from localStorage if present
    const migrated = localStorage.getItem(CATEGORIES_MIGRATION_KEY);
    if (!migrated) {
      localStorage.setItem(CATEGORIES_MIGRATION_KEY, 'true');
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(parsed.map((c: any) => typeof c === 'string' ? c.trim() : '').filter(Boolean)));
      }
    }
    return [];
  } catch (err) {
    console.warn('Failed to load categories:', err);
    return [];
  }
}

/**
 * Save categories list to LocalStorage.
 */
export function saveCategories(categories: string[]): boolean {
  try {
    const clean = Array.from(new Set(categories.map(c => c.trim()).filter(Boolean)));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(clean));
    return true;
  } catch (err) {
    console.error('Failed to save categories:', err);
    return false;
  }
}

/**
 * Clear all categories from LocalStorage (zerar categorias).
 */
export function clearAllLocalCategories(): string[] {
  saveCategories([]);
  return [];
}

/**
 * Load custom signature text from LocalStorage.
 * In Community BYOD mode, starts zerada (vazia).
 */
export function loadCustomSignature(): string {
  try {
    // Migration: clear old default signature text from localStorage if present
    const migrated = localStorage.getItem(SIGNATURE_MIGRATION_KEY);
    if (!migrated) {
      localStorage.setItem(SIGNATURE_MIGRATION_KEY, 'true');
      localStorage.setItem(SIGNATURE_STORAGE_KEY, '');
      return '';
    }

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
 * In Community BYOD mode, the catalog starts empty (zerado).
 * Cleans up any old legacy pre-loaded phrases if still in browser storage.
 */
export function loadLocalPhrases(): Phrase[] {
  try {
    const legacySet = new Set(LEGACY_DEFAULT_PHRASE_IDS);

    // One-time migration: clear old legacy hardcoded default phrases from localStorage
    const migrated = localStorage.getItem(BYOD_MIGRATION_KEY);
    if (!migrated) {
      localStorage.setItem(BYOD_MIGRATION_KEY, 'true');
      const raw = localStorage.getItem(PHRASES_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Keep only phrases custom-created by the user, remove legacy template phrases
            const customOnly = parsed.filter((p: any) => p && p.id && !legacySet.has(p.id));
            saveLocalPhrases(customOnly);
            return customOnly;
          }
        } catch {
          // ignore parse error
        }
      }
      saveLocalPhrases([]);
      return [];
    }

    const raw = localStorage.getItem(PHRASES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any lingering legacy IDs just in case
      const cleaned = parsed.filter((p: any) => p && p.id && !legacySet.has(p.id));
      return cleaned.sort((a: Phrase, b: Phrase) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
    return [];
  } catch (err) {
    console.warn('Failed to load local phrases from LocalStorage:', err);
    return [];
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
 * Reset / Clear all local phrases back to empty (Zerado)
 */
export function clearAllLocalPhrases(): Phrase[] {
  saveLocalPhrases([]);
  return [];
}

/**
 * Reset local storage back to empty catalog (zerado)
 */
export function resetLocalPhrasesToDefault(): Phrase[] {
  return clearAllLocalPhrases();
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
