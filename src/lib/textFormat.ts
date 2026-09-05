import { Phrase } from '../types';

export const STANDARD_FORMAT_EXAMPLE = `titulo: Suporte de Acesso e Reset VPN
corpo:
Olá! Para redefinir seu acesso à VPN, siga o procedimento:
1. Abra o FortiClient / GlobalProtect
2. Insira suas credenciais de rede
3. Caso a senha esteja expirada, redefina pelo Portal de Autoatendimento.
assinatura:
Atenciosamente,
Central de Suporte de TI
#VPN #senha #redes #n2

---

titulo: Solicitação de Troca de Impressora
corpo:
Informamos que a solicitação de troca do toner/impressora foi registrada no sistema.
Acompanhe o chamado pelo portal.
#Impressoras #suporte #equipamento`;

function normalizeCategoryName(raw: string): string {
  const clean = raw.trim();
  const lower = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (lower === "n2n3" || lower === "n2" || lower === "n3") return "N2 / N3";
  if (lower === "tentativaspendente" || lower === "tentativas") return "Tentativas & Pendente";
  if (lower === "senhareset" || lower === "senha") return "Senha & Reset";
  if (lower === "acessosredes" || lower === "acessos") return "Acessos & Redes";
  if (lower === "impressoras" || lower === "impressora") return "Impressoras";
  if (lower === "software") return "Software";
  if (lower === "terceiros" || lower === "terceiro") return "Terceiros";
  if (lower === "vpn") return "VPN";
  if (lower === "outros") return "Outros";
  return clean;
}

/**
 * Parses a plain text block containing phrases in the standardized format,
 * markdown exports, or DeskFlow corporate plain text exports:
 * 
 * Título: <Título da Frase>
 * Categoria: <Categoria>
 * <Corpo do texto / Procedimento...>
 * #Tag1 #Tag2 ...
 * --------------------------------------------------
 */
export function parseStandardText(rawText: string): Partial<Phrase>[] {
  const result: Partial<Phrase>[] = [];
  if (!rawText || !rawText.trim()) return result;

  // Split into candidate phrase blocks by 3 or more dashes, equals, or underscores
  const rawBlocks = rawText
    .split(/(?:\r?\n)\s*[-=_]{3,}\s*(?:\r?\n|$)/)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  for (const rawBlock of rawBlocks) {
    // Skip banner headers like "CENTRAL DE SERVIÇOS SABESP..." that don't have title or tags
    if (!rawBlock.match(/(?:t[íi]tulo|title)\s*:/i) && !rawBlock.includes("#")) {
      continue;
    }

    // If a block contains multiple "Título:" occurrences without dashed lines, sub-split them
    const titleSplits = rawBlock
      .split(/(?=(?:\r?\n|^)\s*(?:===+\s*)?(?:\*\*|\*)?(?:t[íi]tulo|title)\s*:)/i)
      .filter(s => s.trim().length > 0);

    for (const subBlock of titleSplits) {
      const parsed = parseSingleBlock(subBlock);
      if (parsed) {
        result.push(parsed);
      }
    }
  }

  return result;
}

function parseSingleBlock(blockText: string): Partial<Phrase> | null {
  const lines = blockText.split(/\r?\n/);
  
  let title = '';
  let category = '';
  let subtitle = '';
  const explicitTags: string[] = [];
  const hashTags: string[] = [];
  
  let currentSection: 'none' | 'corpo' | 'assinatura' = 'none';
  const corpoLines: string[] = [];
  const assinaturaLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentSection === 'corpo' || (currentSection === 'none' && corpoLines.length > 0)) {
        corpoLines.push('');
      } else if (currentSection === 'assinatura') {
        assinaturaLines.push('');
      }
      continue;
    }

    // Check title line (e.g., Título: ..., titulo: ..., title: ..., === Título: ... ===)
    const titleMatch = trimmed.match(/^(?:===+\s*)?(?:#{1,4}\s*)?(?:\*\*|\*)?(?:t[íi]tulo|title)\s*:\s*(.*?)(?:\s*===+)?(?:\*\*|\*)?$/i);
    if (titleMatch && !title) {
      title = titleMatch[1].trim();
      continue;
    }

    // Check category line (e.g., Categoria: N2 / N3, Category: VPN)
    const catMatch = trimmed.match(/^(?:#{1,4}\s*)?(?:\*\*|\*)?(?:categoria|category)\s*:\s*(.*?)(?:\*\*|\*)?$/i);
    if (catMatch) {
      category = catMatch[1].trim();
      continue;
    }

    // Check subtitle line (e.g., Subtítulo: ...)
    const subMatch = trimmed.match(/^(?:#{1,4}\s*)?(?:\*\*|\*)?(?:subt[íi]tulo|subtitulo|subtitle)\s*:\s*(.*?)(?:\*\*|\*)?$/i);
    if (subMatch) {
      subtitle = subMatch[1].trim();
      continue;
    }

    // Check explicit tags line (e.g., Tags: tag1, tag2)
    const tagsMatch = trimmed.match(/^(?:#{1,4}\s*)?(?:\*\*|\*)?(?:tags|marcadores)\s*:\s*(.*?)(?:\*\*|\*)?$/i);
    if (tagsMatch) {
      const splitTags = tagsMatch[1].split(/[,;]+/).map(t => t.trim().replace(/^#/, '')).filter(Boolean);
      explicitTags.push(...splitTags);
      continue;
    }

    // Check corpo section header
    if (/^(?:corpo|body|conteudo|content)\s*:\s*(.*)$/i.test(trimmed)) {
      currentSection = 'corpo';
      const inlineValue = trimmed.replace(/^(?:corpo|body|conteudo|content)\s*:\s*/i, '').trim();
      if (inlineValue) {
        corpoLines.push(inlineValue);
      }
      continue;
    }

    // Check assinatura section header
    if (/^(?:assinatura|signature|rodape)\s*:\s*(.*)$/i.test(trimmed)) {
      currentSection = 'assinatura';
      const inlineValue = trimmed.replace(/^(?:assinatura|signature|rodape)\s*:\s*/i, '').trim();
      if (inlineValue) {
        assinaturaLines.push(inlineValue);
      }
      continue;
    }

    // Check hashtags line (e.g., #VPN #senha #n2)
    if (trimmed.startsWith('#') || (trimmed.includes('#') && /^(\s*#[a-zA-Z0-9_\-áàâãéèêíóôõúçÁÀÂÃÉÈÊÍÓÔÕÚÇ@.]+)+$/.test(trimmed))) {
      const hashtagMatches = trimmed.match(/#[a-zA-Z0-9_\-áàâãéèêíóôõúçÁÀÂÃÉÈÊÍÓÔÕÚÇ@.]+/g);
      if (hashtagMatches && hashtagMatches.length > 0) {
        hashTags.push(...hashtagMatches.map(t => t.replace(/^#/, '').trim()));
        continue;
      }
    }

    // Collect content according to active section
    if (currentSection === 'corpo') {
      corpoLines.push(line);
    } else if (currentSection === 'assinatura') {
      assinaturaLines.push(line);
    } else if (!title && trimmed) {
      title = trimmed;
      currentSection = 'corpo';
    } else {
      currentSection = 'corpo';
      corpoLines.push(line);
    }
  }

  // Combine corpo and optional signature
  let fullContent = corpoLines.join('\n').trim();
  const signature = assinaturaLines.join('\n').trim();

  if (signature) {
    if (fullContent) {
      fullContent += '\n\n' + signature;
    } else {
      fullContent = signature;
    }
  }

  if (!title && !fullContent) {
    return null;
  }

  // Determine final category
  let finalCategory = category.trim();
  if (!finalCategory && hashTags.length > 0) {
    finalCategory = normalizeCategoryName(hashTags[0]);
  }
  if (!finalCategory) {
    finalCategory = 'Geral';
  }

  // Combine and clean tags
  const rawTags = [...explicitTags, ...hashTags];
  const normCat = finalCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanedTags = rawTags.filter(t => {
    const normT = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normT !== normCat;
  });

  const finalTags = Array.from(new Set(cleanedTags.length > 0 ? cleanedTags : rawTags));

  return {
    title: title || 'Fraseologia Sem Título',
    content: fullContent || 'Sem conteúdo',
    category: finalCategory,
    tags: finalTags.length > 0 ? finalTags : [finalCategory.toLowerCase()],
    subtitle: subtitle || (finalTags.length > 0 ? `#${finalTags.slice(0, 4).join(' #')}` : '')
  };
}

/**
 * Formats phrases list into standard human-readable text.
 */
export function formatPhrasesToStandardText(phrases: Phrase[]): string {
  return phrases.map((p) => {
    const catTag = p.category ? `#${p.category.replace(/\s+/g, '')}` : '#Outros';
    const otherTags = p.tags
      .filter(t => t.toLowerCase() !== p.category.toLowerCase())
      .map(t => `#${t.replace(/\s+/g, '')}`);
    
    const allHashtags = [catTag, ...otherTags].join(' ');

    return `titulo: ${p.title}
corpo:
${p.content}
${allHashtags}`;
  }).join('\n\n---\n\n');
}
