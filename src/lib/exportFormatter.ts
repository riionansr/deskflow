import { Phrase } from '../types';

/**
 * Formats phrases into structured text or JSON for export without needing a backend server.
 */
export function generateExportContent(phrases: Phrase[], mode: 'plain' | 'formatted' | 'json'): string {
  if (mode === 'json') {
    return JSON.stringify(phrases, null, 2);
  }

  const separator = '\n--------------------------------------------------\n\n';

  const blocks = phrases.map((phrase) => {
    const lines: string[] = [];

    lines.push(`=== TÍTULO: ${phrase.title} ===`);
    if (phrase.subtitle) {
      lines.push(`Subtítulo: ${phrase.subtitle}`);
    }
    lines.push(`Categoria: ${phrase.category}`);
    if (phrase.tags && phrase.tags.length > 0) {
      lines.push(`Tags: ${phrase.tags.join(', ')}`);
    }
    lines.push('');
    lines.push(phrase.content);

    return lines.join('\n');
  });

  return blocks.join(separator);
}
