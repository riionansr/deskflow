import React, { useState } from 'react';
import { Copy, Check, Edit3, Trash2, Bookmark, ExternalLink, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { Phrase } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface PhraseCardProps {
  phrase: Phrase;
  onEdit?: (phrase: Phrase) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  isAdmin: boolean;
  searchQuery?: string;
  onTagClick?: (tag: string) => void;
}

export default function PhraseCard({ phrase, onEdit, onDelete, onTogglePin, isAdmin, searchQuery = '', onTagClick }: PhraseCardProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phrase.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'N2 / N3':
        return {
          btn: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          dot: 'bg-emerald-400',
          gradient: 'from-emerald-500/3 to-transparent'
        };
      case 'VPN':
        return {
          btn: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
          dot: 'bg-sky-400',
          gradient: 'from-sky-500/3 to-transparent'
        };
      case 'Senha & Reset':
        return {
          btn: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
          dot: 'bg-rose-400',
          gradient: 'from-rose-500/3 to-transparent'
        };
      case 'Acessos & Redes':
        return {
          btn: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          dot: 'bg-cyan-400',
          gradient: 'from-cyan-500/3 to-transparent'
        };
      case 'Impressoras':
        return {
          btn: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          dot: 'bg-amber-400',
          gradient: 'from-amber-500/3 to-transparent'
        };
      case 'Software':
        return {
          btn: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
          dot: 'bg-violet-400',
          gradient: 'from-violet-500/3 to-transparent'
        };
      case 'Terceiros':
        return {
          btn: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
          dot: 'bg-teal-400',
          gradient: 'from-teal-500/3 to-transparent'
        };
      case 'Tentativas & Pendente':
        return {
          btn: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
          dot: 'bg-orange-400',
          gradient: 'from-orange-500/3 to-transparent'
        };
      default:
        return {
          btn: 'bg-slate-500/10 text-slate-350 border-slate-500/20',
          dot: 'bg-slate-400',
          gradient: 'from-slate-500/3 to-transparent'
        };
    }
  };

  const colors = getCategoryColor(phrase.category || 'Outros');

  // Text match highlighting for title: highlights whole tokens/phrases at word boundaries
  const renderHighlightedText = (text: string = '', query: string = '') => {
    if (!text) return '';
    const trimmed = query.trim();
    if (!trimmed) return text;
    try {
      // Extract search tokens, removing query prefixes like #, tag:, cat:
      const rawTokens = trimmed
        .split(/\s+/)
        .map(t => t.replace(/^(?:#|tag:|cat:|categoria:|t:|c:)/i, '').trim())
        .filter(t => t.length > 0);

      if (rawTokens.length === 0) return text;

      // Group exact phrase and individual tokens, ordered by length descending
      const termsToMatch = [trimmed, ...rawTokens]
        .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .sort((a, b) => b.length - a.length);

      const uniqueTerms = Array.from(new Set(termsToMatch));
      // Use word-start boundary regex so prefixes (like 'sau' in 'Saudacao') highlight, while preventing matches inside words (e.g. 'entra' in 'Central')
      const regex = new RegExp(`(\\b(?:${uniqueTerms.join('|')}))`, 'gi');
      const parts = text.split(regex);

      return (
        <span>
          {parts.map((part, i) => {
            const isMatch = uniqueTerms.some(term => {
              const cleanTerm = term.replace(/\\/g, '');
              return part.toLowerCase() === cleanTerm.toLowerCase();
            });
            return isMatch ? (
              <mark key={i} className="bg-amber-500/30 text-amber-200 border border-amber-500/20 font-medium rounded-xs px-0.5">
                {part}
              </mark>
            ) : (
              part
            );
          })}
        </span>
      );
    } catch {
      return text;
    }
  };

  const safeContent = phrase.content || '';
  const isLongContent = safeContent.length > 250;
  const shouldTruncate = isLongContent && !isExpanded;
  const displayContent = shouldTruncate 
    ? safeContent.substring(0, 240) + '...'
    : safeContent;
  const safeTags = Array.isArray(phrase.tags) ? phrase.tags : [];

  // Render a tiny visual preview of markdown formatting instead of complex rendering inside cards
  return (
    <div className={`group relative flex flex-col glass glass-hover rounded-2xl ${copied ? 'border-emerald-500/40' : phrase.pinned ? 'border-rose-500/30' : 'border-white/10'} shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.gradient}`}>
      
      {/* Top Section: Header */}
      <div className="flex items-start justify-between p-5 pb-3 gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${colors.btn}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {phrase.category}
            </span>
            <span className="inline-flex items-center bg-white/5 border border-white/10 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono" title="Ordem de exibição na lista">
              Posição #{phrase.orderIndex || 1}
            </span>
            {phrase.pinned && (
              <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-sans font-bold shadow-xs shadow-rose-950/20 animate-pulse">
                <Pin className="w-3 h-3 fill-rose-500 text-rose-400" />
                <span>FIXADO</span>
              </span>
            )}
            {searchQuery && safeTags.some(t => typeof t === 'string' && t.toLowerCase().includes(searchQuery.toLowerCase())) && (
              <span className="inline-flex items-center bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.1 select-none rounded font-mono font-medium">
                Atalho Ativo
              </span>
            )}
          </div>
          
          <h3 className="font-display font-semibold text-slate-100 text-base leading-tight group-hover:text-sky-400 transition-colors">
            {renderHighlightedText(phrase.title, searchQuery)}
          </h3>
        </div>

        {/* Copy Controls Top Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(phrase)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/20 transition border border-dashed border-white/10 cursor-pointer"
              title="Editar Frase"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!showConfirmDelete) {
                  setShowConfirmDelete(true);
                } else {
                  onDelete(phrase.id);
                  setShowConfirmDelete(false);
                }
              }}
              onMouseLeave={() => setShowConfirmDelete(false)}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                showConfirmDelete
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-650 shadow-md shadow-red-500/20 px-3 text-xs font-bold'
                  : 'text-rose-400 hover:text-rose-100 hover:bg-rose-500/10 hover:border-rose-500/30 border-dashed border-white/10'
              }`}
              title={showConfirmDelete ? 'Clique novamente para confirmar a exclusão' : 'Excluir Frase'}
            >
              <div className="flex items-center gap-1">
                <Trash2 className={`w-4 h-4 ${showConfirmDelete ? 'animate-bounce' : ''}`} />
                {showConfirmDelete && <span className="text-[10px] uppercase font-bold">Confirmar?</span>}
              </div>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePin) {
                onTogglePin(phrase.id);
              }
            }}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              phrase.pinned 
                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' 
                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 border-dashed border-white/10'
            }`}
            title={phrase.pinned ? 'Desafixar do topo' : 'Fixar no topo'}
          >
            <Pin className={`w-4 h-4 ${phrase.pinned ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center justify-center p-2.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-300 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm shadow-emerald-500/10'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-slate-950 shadow-sm'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline sm:ml-1.5">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline sm:ml-1.5 font-bold">COPIAR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div 
        onClick={() => isLongContent && setIsExpanded(!isExpanded)}
        className={`px-5 pt-1 pb-4 flex-1 font-mono text-xs text-slate-305 cursor-pointer select-text`}
      >
        <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 hover:bg-slate-950/50 transition-colors">
          <MarkdownRenderer content={displayContent} />
          
          {isLongContent && (
            <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] font-sans font-semibold text-sky-400 hover:text-sky-300 transition-colors pt-1.5 border-t border-white/5">
              {isExpanded ? (
                <>
                  Ver menos <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Ver texto completo <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: Tags */}
      {safeTags.length > 0 && (
        <div className="px-5 pb-4 pt-1 border-t border-white/5 flex flex-wrap gap-1.5 items-center mt-auto">
          {safeTags.map((tag) => {
            const tagStr = typeof tag === 'string' ? tag.toLowerCase().trim() : '';
            const searchTokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
            const isMatched = !!tagStr && searchTokens.some(token => {
              const cleanToken = token.replace(/^(?:#|tag:|t:)/, '').trim().toLowerCase();
              if (!cleanToken) return false;
              if (cleanToken.length <= 3) {
                return tagStr === cleanToken || tagStr.startsWith(cleanToken) || tagStr.endsWith(cleanToken);
              }
              return tagStr.startsWith(cleanToken) || tagStr.includes(cleanToken);
            });

            return (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) {
                    onTagClick(tag);
                  }
                }}
                className={`text-[11px] font-mono select-none px-2 py-0.5 rounded-md transition cursor-pointer ${
                  isMatched
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold shadow-xs'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
