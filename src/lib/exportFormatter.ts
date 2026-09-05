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

    const title = phrase.title || 'Sem título';
    const content = phrase.content || '';
    const category = phrase.category || 'Outros';
    const tags = Array.isArray(phrase.tags) ? phrase.tags : [];

    lines.push(`titulo: ${title}`);
    lines.push('corpo:');
    lines.push(content);
    
    const catTag = `#${category.replace(/\s+/g, '')}`;
    const otherTags = tags
      .filter(t => typeof t === 'string' && t.toLowerCase() !== category.toLowerCase())
      .map(t => `#${t.replace(/\s+/g, '')}`);
    
    lines.push([catTag, ...otherTags].join(' '));

    return lines.join('\n');
  });

  return blocks.join(separator);
}

