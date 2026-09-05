import React, { useState, useEffect, useMemo } from 'react';
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
  BookOpen
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

  // Handle Search & Filter logic
  const filteredPhrases = phrases.filter(p => {
    const phraseCategory = p.category || 'Outros';
    if (selectedCategory !== 'Todos' && phraseCategory !== selectedCategory) {
      return false;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const matchesTitle = (p.title || '').toLowerCase().includes(normalizedQuery);
    const matchesContent = (p.content || '').toLowerCase().includes(normalizedQuery);
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const matchesTags = tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(normalizedQuery));
    const matchesCatValue = phraseCategory.toLowerCase().includes(normalizedQuery);

    return matchesTitle || matchesContent || matchesTags || matchesCatValue;
  }).sort((a, b) => {
    const aPinned = !!a.pinned;
    const bPinned = !!b.pinned;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  const getCategoryCount = (cat: CategoryType) => {
    if (cat === 'Todos') return phrases.length;
    return phrases.filter(p => p.category === cat).length;
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white antialiased pb-20 bg-slate-950">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 glass px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-up text-sm font-medium bg-slate-950/90 text-white">
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
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar fraseologia por título, categoria, palavra-chave ou hashtag (ex: #VPN, #365)..."
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
                {hotTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                      searchQuery.toLowerCase() === tag.toLowerCase()
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-350 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
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
                  onTagClick={(tag) => setSearchQuery(tag)}
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

    </div>
  );
}
