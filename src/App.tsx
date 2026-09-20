import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  ExternalLink,
  BookmarkCheck,
  Hash,
  Download,
  Upload,
  HardDrive,
  Layers,
  BookOpen,
  ArrowUp
} from 'lucide-react';
import { Phrase, CategoryType, CATEGORIES } from './types';
import PhraseCard from './components/PhraseCard';
import PhraseEditorModal from './components/PhraseEditorModal';
import AIImportModal from './components/AIImportModal';
import AIExportModal from './components/AIExportModal';
import BYODSettingsModal from './components/BYODSettingsModal';
import { OperationalManualModal } from './components/OperationalManualModal';
import { 
  loadLocalPhrases, 
  saveLocalPhrases, 
  loadGitHubConfig,
  loadCategories,
  saveCategories
} from './lib/storage';
import { pushPhrasesToGitHub } from './lib/githubSync';
import { savePhrases } from './lib/api';

export default function App() {
  // Global State
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBYODSettingsOpen, setIsBYODSettingsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
  const [settingsTab, setSettingsTab] = useState<'storage' | 'categories' | 'signature' | 'github'>('storage');
  
  // Status effects
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // References
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect scroll to show or hide the back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Focus search bar for rapid typing once at the top
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 350);
  };

  // Load initial data from LocalStorage
  useEffect(() => {
    const loaded = loadLocalPhrases();
    setPhrases(loaded);
    setCategories(loadCategories());
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'Todos' && !categories.includes(selectedCategory)) {
      setSelectedCategory('Todos');
    }
  }, [categories, selectedCategory]);

  const notify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  // Helper to persist phrases and trigger auto-sync if configured
  const persistAndSync = (newList: Phrase[], notifyMsg?: string) => {
    setPhrases(newList);
    saveLocalPhrases(newList);
    // Optional backend sync fallback
    savePhrases(newList).catch(() => {});

    if (notifyMsg) {
      notify(notifyMsg);
    }

    // Auto-sync to GitHub if configured
    const ghConfig = loadGitHubConfig();
    if (ghConfig.autoSyncOnSave && ghConfig.token && ghConfig.repo) {
      pushPhrasesToGitHub(ghConfig, newList)
        .then(() => notify('Sincronizado com GitHub automaticamente!'))
        .catch((err) => console.warn('Auto-sync GitHub error:', err));
    }
  };

  // Operations
  const handleSavePhrase = (
    savedPhrase: Phrase,
    orderAction: 'keep' | 'first' | 'last' | 'position',
    targetPosition?: number
  ) => {
    const otherPhrases = phrases.filter(p => p.id !== savedPhrase.id);
    otherPhrases.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    let updatedList: Phrase[] = [];
    if (orderAction === 'first') {
      updatedList = [savedPhrase, ...otherPhrases];
    } else if (orderAction === 'last') {
      updatedList = [...otherPhrases, savedPhrase];
    } else if (orderAction === 'position' && targetPosition !== undefined) {
      const insertIndex = Math.max(0, Math.min(targetPosition - 1, otherPhrases.length));
      const temp = [...otherPhrases];
      temp.splice(insertIndex, 0, savedPhrase);
      updatedList = temp;
    } else {
      const exists = phrases.some(p => p.id === savedPhrase.id);
      if (exists) {
        updatedList = phrases.map(p => p.id === savedPhrase.id ? savedPhrase : p);
      } else {
        updatedList = [...phrases, savedPhrase];
      }
    }

    const finalOrderedList = updatedList.map((p, idx) => ({
      ...p,
      orderIndex: idx + 1
    }));

    // Auto-registrar categoria se for nova
    const catName = savedPhrase.category?.trim();
    if (catName && !categories.includes(catName)) {
      const updatedCats = [...categories, catName];
      setCategories(updatedCats);
      saveCategories(updatedCats);
    }

    persistAndSync(finalOrderedList, 'Fraseologia salva!');
  };

  const handleDeletePhrase = (id: string) => {
    const updatedList = phrases.filter(p => p.id !== id);
    const finalOrderedList = updatedList.map((p, idx) => ({
      ...p,
      orderIndex: idx + 1
    }));

    persistAndSync(finalOrderedList, 'Fraseologia excluída!');
  };

  const handleTogglePin = (id: string) => {
    const updatedPhrases = phrases.map(p => {
      if (p.id === id) {
        return { ...p, pinned: !p.pinned };
      }
      return p;
    });

    const target = phrases.find(p => p.id === id);
    const isNowPinned = target ? !target.pinned : false;

    persistAndSync(updatedPhrases, isNowPinned ? 'Fraseologia fixada no topo!' : 'Fraseologia desafixada.');
  };

  const handleImportComplete = (newPhrasesRaw: any[], shouldClearPrevious: boolean) => {
    const startIdx = shouldClearPrevious ? 0 : phrases.length;
    const preparedPhrases: Phrase[] = newPhrasesRaw.map((p, idx) => ({
      ...p,
      id: Math.random().toString(36).substring(2, 11),
      orderIndex: startIdx + idx + 1,
      updatedAt: new Date().toISOString()
    }));

    const finalPhrasesList = shouldClearPrevious 
      ? preparedPhrases 
      : [...phrases, ...preparedPhrases];

    // Registrar novas categorias importadas
    const importedCats = preparedPhrases.map(p => p.category?.trim()).filter(Boolean);
    const existingCats = shouldClearPrevious ? [] : categories;
    const combinedCats = Array.from(new Set([...existingCats, ...importedCats]));
    if (combinedCats.length !== categories.length || shouldClearPrevious) {
      setCategories(combinedCats);
      saveCategories(combinedCats);
    }

    persistAndSync(finalPhrasesList, `${preparedPhrases.length} fraseologias importadas!`);
  };

  const openEditModal = (phrase: Phrase) => {
    setEditingPhrase(phrase);
    setIsEditorOpen(true);
  };

  const openCreateModal = () => {
    setEditingPhrase(null);
    setIsEditorOpen(true);
  };

  // Dynamic Hot Tags search list based on active phrases
  const hotTags = useMemo(() => {
    const counts: { [key: string]: number } = {};
    phrases.forEach(p => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      tags.forEach(t => {
        if (typeof t === 'string') {
          const clean = t.trim().toLowerCase();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [phrases]);

  // Helpers for robust search and token-matching
  const normalizeForSearch = (str: string = ''): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Word-start boundary matching:
  // Requires the word to start with the term at a word boundary (e.g. (?:^|[^a-z0-9])term).
  // This allows prefixes to match as the user types (e.g. "sau" matches "Saudacao", "loja" matches "Lojas", "sen" matches "Senha"),
  // while PREVENTING false positives in the middle of words (e.g. "entra" never matches "Central", "id" never matches "devido" or "validacao").
  const matchesWordBoundary = (normalizedText: string, normalizedTerm: string): boolean => {
    if (!normalizedText || !normalizedTerm) return false;
    const escaped = escapeRegex(normalizedTerm);
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}`, 'i');
    return regex.test(normalizedText);
  };

  const matchesTagItem = (tag: string, normalizedTerm: string): boolean => {
    if (!tag || !normalizedTerm) return false;
    const cleanTag = normalizeForSearch(tag).replace(/^#/, '');
    const cleanTerm = normalizedTerm.replace(/^#/, '');
    if (!cleanTag || !cleanTerm) return false;

    if (cleanTag.startsWith(cleanTerm) || cleanTag.endsWith(cleanTerm)) {
      return true;
    }
    if (cleanTerm.length >= 3 && cleanTag.includes(cleanTerm)) {
      return true;
    }
    return false;
  };

  // Handle Search & Filter logic with word boundary matching and relevance scoring
  const filteredPhrases = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const cleanRawQuery = normalizeForSearch(rawQuery);

    if (!rawQuery) {
      return phrases
        .filter(p => {
          const phraseCategory = p.category || 'Outros';
          return selectedCategory === 'Todos' || phraseCategory.toLowerCase() === selectedCategory.toLowerCase();
        })
        .sort((a, b) => {
          const aPinned = !!a.pinned;
          const bPinned = !!b.pinned;
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          return (a.orderIndex || 0) - (b.orderIndex || 0);
        });
    }

    const tokens = rawQuery.split(/\s+/).filter(Boolean);
    const scoredPhrases: { phrase: Phrase; score: number }[] = [];

    for (const p of phrases) {
      const phraseCategory = p.category || 'Outros';
      if (selectedCategory !== 'Todos' && phraseCategory.toLowerCase() !== selectedCategory.toLowerCase()) {
        continue;
      }

      const normTitle = normalizeForSearch(p.title || '');
      const normContent = normalizeForSearch(p.content || '');
      const normCategory = normalizeForSearch(phraseCategory);
      const tagsList = (Array.isArray(p.tags) ? p.tags : []).filter((t): t is string => typeof t === 'string');

      let phraseScore = 0;

      // 1. Exact full-query phrase match bonus
      if (tokens.length > 1) {
        if (normTitle.includes(cleanRawQuery)) {
          phraseScore += 1000;
        }
        if (normContent.includes(cleanRawQuery)) {
          phraseScore += 500;
        }
        const joinedQuery = cleanRawQuery.replace(/\s+/g, '');
        if (tagsList.some(t => matchesTagItem(t, joinedQuery))) {
          phraseScore += 600;
        }
      }

      // 2. Evaluate all individual tokens with conjunct AND logic
      let allTokensMatch = true;

      for (const token of tokens) {
        const normToken = normalizeForSearch(token);
        if (!normToken) continue;

        // A. Explicit Category Prefix: "categoria:xxx", "cat:xxx" or "c:xxx"
        if (normToken.startsWith('categoria:') || normToken.startsWith('cat:') || normToken.startsWith('c:')) {
          const catVal = normToken.replace(/^(categoria:|cat:|c:)/, '').trim();
          if (catVal && !matchesWordBoundary(normCategory, catVal) && !normCategory.includes(catVal)) {
            allTokensMatch = false;
            break;
          }
          phraseScore += 200;
          continue;
        }

        // B. Explicit Tag Prefix: "tag:xxx" or "t:xxx"
        if (normToken.startsWith('tag:') || normToken.startsWith('t:')) {
          const tagVal = normToken.replace(/^(tag:|t:)/, '').trim();
          if (tagVal && !tagsList.some(t => matchesTagItem(t, tagVal))) {
            allTokensMatch = false;
            break;
          }
          phraseScore += 200;
          continue;
        }

        // C. Hashtag: "#xxx" (e.g. #loja, #wpp, #saudacao)
        if (normToken.startsWith('#')) {
          const hashVal = normToken.slice(1).trim();
          const matchTag = tagsList.some(t => matchesTagItem(t, hashVal));
          const matchCat = matchesWordBoundary(normCategory, hashVal);
          const matchTitle = matchesWordBoundary(normTitle, hashVal);
          if (!matchTag && !matchCat && !matchTitle) {
            allTokensMatch = false;
            break;
          }
          phraseScore += matchTag ? 300 : (matchTitle ? 250 : 150);
          continue;
        }

        // D. Standard search term
        let tokenMatched = false;

        // Title match
        if (matchesWordBoundary(normTitle, normToken)) {
          tokenMatched = true;
          phraseScore += 300;
          if (normTitle === normToken) phraseScore += 200;
        }

        // Tag match
        if (tagsList.some(t => matchesTagItem(t, normToken))) {
          tokenMatched = true;
          phraseScore += 250;
        }

        // Content match
        if (matchesWordBoundary(normContent, normToken)) {
          tokenMatched = true;
          phraseScore += 100;
        }

        // Category match
        if (matchesWordBoundary(normCategory, normToken)) {
          tokenMatched = true;
          phraseScore += 80;
        }

        if (!tokenMatched) {
          allTokensMatch = false;
          break;
        }
      }

      if (allTokensMatch) {
        // Pinned bonus for ranking among matching phrases
        if (p.pinned) {
          phraseScore += 150;
        }
        scoredPhrases.push({ phrase: p, score: phraseScore });
      }
    }

    // Sort by relevance score first; if equal or similar, pinned comes first
    return scoredPhrases
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;

        const aPinned = !!a.phrase.pinned;
        const bPinned = !!b.phrase.pinned;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        return (a.phrase.orderIndex || 0) - (b.phrase.orderIndex || 0);
      })
      .map(item => item.phrase);
  }, [phrases, selectedCategory, searchQuery]);

  const getCategoryCount = (cat: CategoryType) => {
    if (cat === 'Todos') return phrases.length;
    return phrases.filter(p => p.category === cat).length;
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white antialiased pb-20 bg-slate-950">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center gap-2.5 glass px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-up text-sm font-medium bg-slate-950/90 text-white">
          <BookmarkCheck className="w-4.5 h-4.5 text-emerald-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40 shadow-md backdrop-blur-md bg-slate-950/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-4">
            
            {/* Logo/Brand Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <h1 className="font-extrabold tracking-wider text-slate-100 font-display uppercase text-sm sm:text-base leading-none">
                  DESKFLOW
                </h1>
                <span className="bg-sky-500/15 text-sky-350 border border-sky-400/20 text-[9px] uppercase tracking-wider font-semibold py-0.5 px-2 rounded-full hidden sm:inline-block">
                  Community BYOD
                </span>
              </div>
            </div>

            {/* Top Toolbar Quick Indicators */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsManualOpen(true)}
                className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold py-1.5 px-2.5 rounded-xl sm:px-3 transition cursor-pointer"
                title="Manual Operacional do Usuário"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="hidden md:inline">Manual</span>
              </button>

              <button
                onClick={() => setIsBYODSettingsOpen(true)}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold py-1.5 px-2.5 rounded-xl sm:px-3 transition cursor-pointer"
                title="Configurações de Armazenamento Local e Sincronização GitHub"
              >
                <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="hidden md:inline">Armazenamento &amp; Sync</span>
              </button>

              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-sky-650 to-indigo-650 hover:from-sky-600 hover:to-indigo-600 border border-sky-500/20 text-white font-bold text-xs py-1.5 px-2.5 rounded-xl sm:px-3 transition active:scale-95 cursor-pointer shadow-md shadow-sky-950/20"
                title="Importar catálogo de fraseologias (.txt ou .json)"
              >
                <Upload className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Importar</span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-650 to-emerald-650 hover:from-teal-600 hover:to-emerald-650 border border-emerald-550/20 text-white font-bold text-xs py-1.5 px-2.5 rounded-xl sm:px-3 transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/20"
                title="Exportar biblioteca de mensagens"
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-1 bg-sky-500 text-slate-950 font-bold text-xs py-1.5 px-2.5 rounded-xl sm:px-3 hover:bg-sky-400 transition active:scale-95 cursor-pointer shadow-sky-500/20 shadow-md"
                title="Criar nova fraseologia"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Nova Frase</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Single Column Workspace Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20 flex-grow w-full">
        <div className="space-y-6">

          {/* Primary Interactive Search Control Box */}
          <div className="glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl space-y-4 bg-slate-900/60">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por termo, #tag, #categoria ou sintaxe (ex: #mfa reset, categoria:unilims pendente)..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-12 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Quick Hot-Tags Filter Bar */}
            {hotTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Hash className="w-3 h-3 text-sky-400" />
                  Tags frequentes:
                </span>
                {hotTags.map((tag) => {
                  const tagLower = tag.toLowerCase();
                  const isCurrentTagActive = searchQuery.toLowerCase().split(/\s+/).some(tok => tok === `#${tagLower}` || tok === tagLower);

                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (isCurrentTagActive) {
                          // If already active, remove it
                          const remaining = searchQuery
                            .split(/\s+/)
                            .filter(tok => tok.toLowerCase() !== `#${tagLower}` && tok.toLowerCase() !== tagLower)
                            .join(' ');
                          setSearchQuery(remaining);
                        } else {
                          // Append or set hashtag
                          setSearchQuery(prev => {
                            const trimmed = prev.trim();
                            return trimmed ? `${trimmed} #${tag}` : `#${tag}`;
                          });
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                        isCurrentTagActive
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                          : 'bg-white/5 text-slate-350 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                      title={isCurrentTagActive ? `Remover tag #${tag} da busca` : `Filtrar por #${tag}`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Horizontal Category Selectors Slider */}
            {categories.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {['Todos', ...categories].map((cat) => {
                    const count = getCategoryCount(cat as any);
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-bold'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Phrase Cards Collection */}
          {phrases.length === 0 ? (
            <div className="glass rounded-2xl p-8 sm:p-12 text-center border border-sky-500/20 space-y-6 my-6 bg-slate-900/40 relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400 shadow-lg shadow-sky-500/5">
                <Layers className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-display">
                  Seu Repertório de Fraseologias está Zerado
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  No modelo <strong>Community BYOD</strong>, o DeskFlow não vem com frases pré-carregadas. Você tem total liberdade para montar seu próprio acervo de atendimento do zero ou importar um catálogo compartilhado por colegas.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-sky-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Criar Primeira Frase</span>
                </button>

                <button
                  onClick={() => setIsImportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-sky-950/30 active:scale-95 border border-sky-400/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar Arquivo (.txt / .json)</span>
                </button>

                <button
                  onClick={() => setIsManualOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Manual do Usuário</span>
                </button>
              </div>
            </div>
          ) : filteredPhrases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredPhrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  onEdit={() => openEditModal(phrase)}
                  onDelete={() => handleDeletePhrase(phrase.id)}
                  onTogglePin={() => handleTogglePin(phrase.id)}
                  isAdmin={true}
                  searchQuery={searchQuery}
                  onTagClick={(tag) => {
                    const tagLower = tag.toLowerCase();
                    setSearchQuery(prev => {
                      const tokens = prev.trim().split(/\s+/).filter(Boolean);
                      const hasTag = tokens.some(t => t.toLowerCase() === `#${tagLower}` || t.toLowerCase() === tagLower);
                      if (hasTag) {
                        return tokens.filter(t => t.toLowerCase() !== `#${tagLower}` && t.toLowerCase() !== tagLower).join(' ');
                      }
                      return prev.trim() ? `${prev.trim()} #${tag}` : `#${tag}`;
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center border border-white/5 space-y-4 my-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-400 border border-white/10">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-200 font-display">
                  Nenhuma fraseologia encontrada
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Não encontramos nenhuma fraseologia com os termos ou categoria informados. Experimente buscar por outros termos ou crie uma nova frase.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition cursor-pointer border border-white/10"
                  >
                    Limpar Pesquisa
                  </button>
                )}
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
                >
                  Criar Nova Frase
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 border-t border-white/10 bg-slate-950/80 text-xs text-slate-400 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left Brand Info */}
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-wider text-slate-100 font-display uppercase text-sm">
              DESKFLOW
            </span>
            <span className="text-indigo-400 font-bold">•</span>
            <span className="font-mono text-[11px] tracking-widest text-indigo-400 uppercase font-bold">
              A RAR PROJECT
            </span>
          </div>

          {/* Right Status Pill & Credits */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-5">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-[11px] font-mono text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                VERSÃO ATUAL: <strong className="text-sky-300 font-bold">v1.0.0</strong>
              </span>
            </div>

            <div className="text-slate-400 font-sans text-xs">
              Designed &amp; developed by{' '}
              <a
                href="https://github.com/riionansr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white visited:text-white hover:text-indigo-400 focus:text-indigo-400 font-bold no-underline transition-colors duration-300 ease-in-out cursor-pointer"
              >
                Renan Ramos
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <PhraseEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePhrase}
        phrase={editingPhrase}
        totalPhrasesCount={phrases.length}
        categories={categories}
        onOpenSettings={(tab) => {
          if (tab) setSettingsTab(tab);
          setIsBYODSettingsOpen(true);
        }}
      />

      <AIImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <AIExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        phrases={phrases}
      />

      <BYODSettingsModal
        isOpen={isBYODSettingsOpen}
        onClose={() => setIsBYODSettingsOpen(false)}
        phrases={phrases}
        categories={categories}
        onPhrasesUpdated={(newPhrases, msg) => persistAndSync(newPhrases, msg)}
        onCategoriesUpdated={(newCategories, msg) => {
          setCategories(newCategories);
          if (msg) notify(msg);
        }}
      />

      <OperationalManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />

      {/* Floating Scroll-to-Top Action Button */}
      <button
        type="button"
        id="btn-scroll-to-top"
        onClick={scrollToTop}
        title="Voltar ao topo e pesquisar"
        aria-label="Voltar ao topo e pesquisar"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-sky-400/40 shadow-xl backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-95 ${
          showScrollTop 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4 text-sky-400 transition-transform duration-200 group-hover:-translate-y-0.5" />
        <span className="text-xs font-semibold tracking-wide pr-1 hidden sm:inline-block text-slate-300 group-hover:text-white">
          Subir
        </span>
      </button>

    </div>
  );
}
