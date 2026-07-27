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

/**
 * Parses a plain text block containing phrases in the standardized format:
 * 
 * titulo: <Título da Frase>
 * corpo: <Texto do corpo da fraseologia...>
 * assinatura: <Assinatura/Rodapé opcional>
 * #Categoria #tag1 #tag2 ...
 * 
 * Note: All hashtags are treated as tags, and the FIRST hashtag is assigned as the Category.
 */
export function parseStandardText(rawText: string): Partial<Phrase>[] {
  const result: Partial<Phrase>[] = [];
  if (!rawText || !rawText.trim()) return result;

  // Split into candidate phrase blocks either by "---" or by "titulo:"
  const rawBlocks = rawText.split(/\n\s*---\s*\n/).filter(b => b.trim().length > 0);

  for (const rawBlock of rawBlocks) {
    // If a block contains multiple "titulo:" occurrences without "---", sub-split them
    const titleSplits = rawBlock.split(/(?=\btitulo\s*:|\btitle\s*:)/i).filter(s => s.trim().length > 0);

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
  const lines = blockText.split('\n');
  
  let title = '';
  let category = 'Outros';
  let tags: string[] = [];
  
  let currentSection: 'none' | 'corpo' | 'assinatura' = 'none';
  const corpoLines: string[] = [];
  const assinaturaLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Check title line
    const titleMatch = trimmed.match(/^(?:titulo|title)\s*:\s*(.*)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
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
    if (trimmed.startsWith('#') || (trimmed.includes('#') && /^(\s*#[a-zA-Z0-9_\-áàâãéèêíóôõúçÁÀÂÃÉÈÊÍÓÔÕÚÇ]+)+$/.test(trimmed))) {
      const hashtagMatches = trimmed.match(/#[a-zA-Z0-9_\-áàâãéèêíóôõúçÁÀÂÃÉÈÊÍÓÔÕÚÇ]+/g);
      if (hashtagMatches && hashtagMatches.length > 0) {
        const extractedTags = hashtagMatches.map(t => t.replace('#', '').trim());
        
        // The first hashtag is treated as Category
        if (extractedTags.length > 0) {
          category = extractedTags[0];
        }

        // All hashtags are added to tags
        tags = Array.from(new Set([...tags, ...extractedTags]));
        continue;
      }
    }

    // Collect content according to active section
    if (currentSection === 'corpo') {
      corpoLines.push(line);
    } else if (currentSection === 'assinatura') {
      assinaturaLines.push(line);
    } else if (!title && trimmed) {
      // If no title key was used, line 1 can be title
      title = trimmed;
      currentSection = 'corpo';
    } else if (currentSection === 'none' && trimmed) {
      // Default to corpo content
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

  return {
    title: title || 'Fraseologia Sem Título',
    content: fullContent || 'Sem conteúdo',
    category: category || 'Outros',
    tags: tags.length > 0 ? tags : [category.toLowerCase()],
    subtitle: tags.length > 0 ? `#${tags.join(' #')}` : ''
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
