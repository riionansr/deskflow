import { Phrase } from '../types';
import { formatPhrasesToStandardText } from './textFormat';

/**
 * Formats phrases into structured text or JSON for export without needing a backend server.
 */
export function generateExportContent(phrases: Phrase[], mode: 'plain' | 'formatted' | 'standard' | 'json'): string {
  if (mode === 'json') {
    return JSON.stringify(phrases, null, 2);
  }

  if (mode === 'standard' || mode === 'formatted' || mode === 'plain') {
    return formatPhrasesToStandardText(phrases);
  }

  const separator = '\n\n--------------------------------------------------\n\n';

  const blocks = phrases.map((phrase) => {
    const lines: string[] = [];

    lines.push(`titulo: ${phrase.title}`);
    lines.push('corpo:');
    lines.push(phrase.content);
    
    const catTag = phrase.category ? `#${phrase.category.replace(/\s+/g, '')}` : '#Outros';
    const otherTags = (phrase.tags || [])
      .filter(t => t.toLowerCase() !== (phrase.category || '').toLowerCase())
      .map(t => `#${t.replace(/\s+/g, '')}`);
    
    lines.push([catTag, ...otherTags].join(' '));

    return lines.join('\n');
  });

  return blocks.join(separator);
}

