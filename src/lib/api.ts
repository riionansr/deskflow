import { Phrase, UserAccount } from '../types';

export async function fetchSync(): Promise<{ accounts: UserAccount[]; phrases: Phrase[] } | null> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    console.warn('Network sync failed', err);
    return null;
  }
}

export async function saveAccounts(accounts: UserAccount[]): Promise<boolean> {
  try {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accounts }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save accounts to backend', err);
    return false;
  }
}

export async function savePhrases(phrases: Phrase[]): Promise<boolean> {
  try {
    const res = await fetch('/api/phrases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrases }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save phrases to backend', err);
    return false;
  }
}

export async function importWithAI(fileBase64: string, fileName: string): Promise<any[] | null> {
  try {
    const res = await fetch('/api/ai-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64, fileName }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Falha ao processar com IA');
    }
    const data = await res.json();
    return data.phrases;
  } catch (err: any) {
    console.error('AI Import helper failed', err);
    throw err;
  }
}

export async function exportWithAI(phrases: any[], mode: 'plain' | 'ai_optimized'): Promise<string> {
  try {
    const res = await fetch('/api/ai-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrases, mode }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Falha ao processar exportação');
    }
    const data = await res.json();
    return data.content;
  } catch (err: any) {
    console.error('AI Export helper failed', err);
    throw err;
  }
}
