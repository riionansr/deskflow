import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  ExternalLink,
  ChevronRight,
  Info,
  SlidersHorizontal,
  BookmarkCheck,
  LifeBuoy,
  LogOut,
  X,
  PlusCircle,
  Copy,
  Terminal,
  FileSpreadsheet,
  Users,
  KeyRound,
  Trash2,
  User,
  ShieldAlert,
  Sparkles,
  Settings,
  Database,
  Hash,
  Clock,
  Download
} from 'lucide-react';
import { Phrase, CategoryType, CATEGORIES, UserAccount } from './types';
import { initialPhrases } from './data/defaultPhrases';
import PhraseCard from './components/PhraseCard';
import AdminLoginModal from './components/AdminLoginModal';
import PhraseEditorModal from './components/PhraseEditorModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import AIImportModal from './components/AIImportModal';
import AIExportModal from './components/AIExportModal';
import { hashPassword } from './lib/crypto';
import { fetchSync, saveAccounts, savePhrases } from './lib/api';

export default function App() {
  // Global State
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Todos');
  
  // Modals & Authorization
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
  
  // Users state for Superadmin
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [showConfirmDeleteUser, setShowConfirmDeleteUser] = useState<string | null>(null);
  const [showConfirmResetUser, setShowConfirmResetUser] = useState<string | null>(null);

  // Status effects
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Helper to centralize setting and saving accounts server-side
  const updateAndSaveAccounts = async (updatedAccounts: UserAccount[]) => {
    setAccounts(updatedAccounts);
    return await saveAccounts(updatedAccounts);
  };

  // Load initial data from Server-side synced Database
  useEffect(() => {
    const initializeData = async () => {
      let activeAccounts: UserAccount[] = [];
      let activeGlobalPhrases: Phrase[] = [];

      // Fetch the latest copy from our synchronized Express backend database
      const syncResult = await fetchSync();

      const hashedAdminPass = await hashPassword('admin@Sabesp2009');
      const superAdminAccount: UserAccount = {
        username: 'admin',
        displayName: 'Supervisor TI (Superadmin)',
        passwordHash: hashedAdminPass,
        phrases: [],
        createdAt: new Date().toISOString()
      };

      if (syncResult) {
        let { accounts: fetchedAccounts, phrases: fetchedPhrases } = syncResult;
        
        if (!fetchedAccounts) {
          fetchedAccounts = [];
        }

        // Ensure admin account exists with the correct information
        const adminIdx = fetchedAccounts.findIndex(acc => acc.username === 'admin');
        let needToSaveAccounts = false;
        if (adminIdx > -1) {
          if (fetchedAccounts[adminIdx].passwordHash !== hashedAdminPass || fetchedAccounts[adminIdx].displayName !== 'Supervisor TI (Superadmin)') {
            fetchedAccounts[adminIdx].passwordHash = hashedAdminPass;
            fetchedAccounts[adminIdx].displayName = 'Supervisor TI (Superadmin)';
            needToSaveAccounts = true;
          }
        } else {
          fetchedAccounts.push(superAdminAccount);
          needToSaveAccounts = true;
        }

        if (needToSaveAccounts) {
          await saveAccounts(fetchedAccounts);
        }

        activeAccounts = fetchedAccounts;
        setAccounts(fetchedAccounts);

        if (fetchedPhrases && fetchedPhrases.length > 0) {
          activeGlobalPhrases = fetchedPhrases;
        } else {
          // Send default phrase data to server if server is clean
          const defaults = initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
          await savePhrases(defaults);
          activeGlobalPhrases = defaults;
        }
      } else {
        // Core baseline fallback
        activeGlobalPhrases = initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
        activeAccounts = [superAdminAccount];
        setAccounts(activeAccounts);
      }

      // Restore session with sessionStorage (purely session-based, no localStorage)
      const activeUsername = sessionStorage.getItem('sabesp_active_tech_username');
      if (activeUsername) {
        const foundAcc = activeAccounts.find(acc => acc.username === activeUsername);
        if (foundAcc) {
          setCurrentUser(foundAcc);
          setIsAdmin(true);
          setPhrases(foundAcc.phrases.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
          return;
        }
      }

      // Guest mode load
      setPhrases(activeGlobalPhrases.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    };

    initializeData();
  }, []);

  const notify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  // Operations
  const handleSavePhrase = async (
    savedPhrase: Phrase,
    orderAction: 'keep' | 'first' | 'last' | 'position',
    targetPosition?: number
  ) => {
    // Exclude current phrase to allow clean re-sequencing
    const otherPhrases = phrases.filter(p => p.id !== savedPhrase.id);
    otherPhrases.sort((a, b) => a.orderIndex - b.orderIndex);

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
      // Keep existing index or append
      const exists = phrases.some(p => p.id === savedPhrase.id);
      if (exists) {
        updatedList = phrases.map(p => p.id === savedPhrase.id ? savedPhrase : p);
      } else {
        updatedList = [...phrases, savedPhrase];
      }
    }

    // Always re-assign sequential orderIndexes from 1 to N to keep numbers pristine & sorted
    const finalOrderedList = updatedList.map((p, idx) => ({
      ...p,
      orderIndex: idx + 1
    }));

    if (currentUser) {
      try {
        const updatedAccounts = accounts.map(acc => {
          if (acc.username === currentUser.username) {
            return {
              ...acc,
              phrases: finalOrderedList
            };
          }
          return acc;
        });

        await updateAndSaveAccounts(updatedAccounts);
        
        const updatedUser = { ...currentUser, phrases: finalOrderedList };
        setCurrentUser(updatedUser);
        setPhrases(finalOrderedList);
        notify('Fraseologia salva e reordenada!');
      } catch (err) {
        console.error('Failed saving technician custom phrase.', err);
      }
    } else {
      // Guest-Mode standard save
      setPhrases(finalOrderedList);
      savePhrases(finalOrderedList);
      notify('Fraseologia salva e reordenada!');
    }
  };

  const handleDeletePhrase = async (id: string) => {
    const updatedList = phrases.filter(p => p.id !== id);
    const finalOrderedList = updatedList.map((p, idx) => ({
      ...p,
      orderIndex: idx + 1
    }));

    if (currentUser) {
      try {
        const updatedAccounts = accounts.map(acc => {
          if (acc.username === currentUser.username) {
            return {
              ...acc,
              phrases: finalOrderedList
            };
          }
          return acc;
        });
        await updateAndSaveAccounts(updatedAccounts);
        
        const updatedUser = { ...currentUser, phrases: finalOrderedList };
        setCurrentUser(updatedUser);
        setPhrases(finalOrderedList);
        notify('Fraseologia excluída!');
      } catch (err) {
        console.error(err);
      }
    } else {
      setPhrases(finalOrderedList);
      savePhrases(finalOrderedList);
      notify('Fraseologia excluída!');
    }
  };

  const handleTogglePin = async (id: string) => {
    const updatedPhrases = phrases.map(p => {
      if (p.id === id) {
        return { ...p, pinned: !p.pinned };
      }
      return p;
    });

    if (currentUser) {
      try {
        const updatedAccounts = accounts.map(acc => {
          if (acc.username === currentUser.username) {
            return {
              ...acc,
              phrases: updatedPhrases
            };
          }
          return acc;
        });

        await updateAndSaveAccounts(updatedAccounts);

        const updatedUser = { ...currentUser, phrases: updatedPhrases };
        setCurrentUser(updatedUser);
        setPhrases(updatedPhrases);
        
        const target = phrases.find(p => p.id === id);
        const isNowPinned = target ? !target.pinned : false;
        notify(isNowPinned ? 'Fraseologia fixada no topo!' : 'Fraseologia desafixada.');
      } catch (err) {
        console.error('Failed saving technician custom phrase pin.', err);
      }
    } else {
      setPhrases(updatedPhrases);
      savePhrases(updatedPhrases);
      const target = phrases.find(p => p.id === id);
      const isNowPinned = target ? !target.pinned : false;
      notify(isNowPinned ? 'Fraseologia fixada no topo!' : 'Fraseologia desafixada.');
    }
  };

  const handleImportComplete = async (newPhrasesRaw: any[], shouldClearPrevious: boolean) => {
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

    if (currentUser) {
      try {
        const updatedAccounts = accounts.map(acc => {
          if (acc.username === currentUser.username) {
            return {
              ...acc,
              phrases: finalPhrasesList
            };
          }
          return acc;
        });

        await updateAndSaveAccounts(updatedAccounts);

        const updatedUser = { ...currentUser, phrases: finalPhrasesList };
        setCurrentUser(updatedUser);
        setPhrases(finalPhrasesList);
        notify(`${preparedPhrases.length} fraseologias importadas com sucesso!`);
      } catch (err) {
        console.error('Failed to save imported phrases to technician portfolio', err);
        notify('Erro ao salvar as fraseologias importadas.');
      }
    } else {
      setPhrases(finalPhrasesList);
      savePhrases(finalPhrasesList);
      notify(`${preparedPhrases.length} fraseologias importadas!`);
    }
  };

  const handleRestoreDefaults = async () => {
    if (confirm('Atenção: Isso retornará as fraseologias ao estado inicial padrão, descartando suas edições personalizadas de texto e posição.')) {
      const seededDefault = initialPhrases.map((phrase, idx) => ({
        ...phrase,
        orderIndex: idx + 1
      }));

      if (currentUser) {
        try {
          const updatedAccounts = accounts.map(acc => {
            if (acc.username === currentUser.username) {
              return {
                ...acc,
                phrases: seededDefault
              };
            }
            return acc;
          });
          await updateAndSaveAccounts(updatedAccounts);

          const updatedUser = { ...currentUser, phrases: seededDefault };
          setCurrentUser(updatedUser);
          setPhrases(seededDefault);
          notify('Catálogo inicial restaurado para o seu perfil!');
        } catch (e) {
          console.error(e);
        }
      } else {
        setPhrases(seededDefault);
        savePhrases(seededDefault);
        notify('Fraseologias iniciais restauradas.');
      }
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    notify('Preparando o arquivo compactado...');
    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) {
        throw new Error('Falha ao baixar o arquivo compactado.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portal-de-fraseologia.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      notify('Arquivo ZIP baixado com sucesso!');
    } catch (error) {
      console.error('Download ZIP error:', error);
      notify('Erro ao baixar o código-fonte compactado. Se persistir, recarregue a página.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
    setIsAdmin(true);
    const sorted = account.phrases.sort((a, b) => a.orderIndex - b.orderIndex);
    setPhrases(sorted);
    sessionStorage.setItem('sabesp_active_tech_username', account.username);
    notify(`Bem-vindo, ${account.displayName}! Catálogo pessoal carregado.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('sabesp_active_tech_username');
    
    // Load public read-only default catalog 
    const seededDefault = initialPhrases.map((phrase, idx) => ({ ...phrase, orderIndex: idx + 1 }));
    setPhrases(seededDefault.sort((a, b) => a.orderIndex - b.orderIndex));
    
    // Force a full clean reload of the page to refresh state across browsers/tabs
    window.location.reload();
  };

  const handleResetUserPassword = async (username: string) => {
    try {
      const accountsList = [...accounts];
      const userIdx = accountsList.findIndex(acc => acc.username === username);
      if (userIdx > -1) {
        const hashedDefaultPass = await hashPassword('sabesp123');
        accountsList[userIdx].passwordHash = hashedDefaultPass;
        await updateAndSaveAccounts(accountsList);
        notify(`Senha de ${accountsList[userIdx].displayName} resetada para 'sabesp123' com sucesso!`);
      }
    } catch (err) {
      console.error(err);
      notify('Falha ao resetar senha.');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === 'admin') {
      notify('Não é possível remover a conta superadmin.');
      return;
    }
    try {
      const filtered = accounts.filter(acc => acc.username !== username);
      await updateAndSaveAccounts(filtered);
      notify('Perfil do técnico e fraseologias desvinculadas com sucesso!');
      setShowConfirmDeleteUser(null);
    } catch (err) {
      console.error(err);
      notify('Erro ao remover técnico.');
    }
  };

  const openEditModal = (phrase: Phrase) => {
    setEditingPhrase(phrase);
    setIsEditorOpen(true);
  };

  const openCreateModal = () => {
    setEditingPhrase(null);
    setIsEditorOpen(true);
  };

  // Hot Tags search lists
  const hotTags = ['365', 'vpn', 'senha', 'terceiro', 'impressora', 'n2', 'link', 'termo', 'remoto'];

  // Handle Search & Filter logic
  const filteredPhrases = phrases.filter(p => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const matchesTitle = p.title.toLowerCase().includes(normalizedQuery);
    const matchesContent = p.content.toLowerCase().includes(normalizedQuery);
    const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));
    const matchesCatValue = p.category.toLowerCase().includes(normalizedQuery);

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

  // Calculate general statistics for Superadmin and Supervisor TI
  const registeredTechsCount = accounts.filter(acc => acc.username !== 'admin').length;
  const totalPhrasesCountAcrossAllUsers = accounts.reduce((sum, acc) => sum + (acc.phrases || []).length, 0);
  const latestRegisteredUser = accounts
    .filter(acc => acc.username !== 'admin')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white antialiased pb-20 bg-slate-950">
      
      {/* Dynamic Pop-up Toast Notifications */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 glass px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-up text-sm font-medium bg-slate-950/90 text-white">
          <BookmarkCheck className="w-4.5 h-4.5 text-emerald-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Confirmation of User Deletion Dialog Overlay */}
      {showConfirmDeleteUser && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-premium rounded-2xl w-full max-w-sm overflow-hidden border border-red-500/20 shadow-2xl animate-scale-up p-6">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <ShieldAlert className="w-8 h-8" />
              <h3 className="text-lg font-display font-semibold">Excluir Técnico Permanetemente?</h3>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed mb-6">
              Você tem certeza que deseja remover o técnico <strong className="text-white font-mono">@{showConfirmDeleteUser}</strong> do portal? Todas as fraseologias salvas e o histórico desse portfólio serão desvinculados permanentemente. Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDeleteUser(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(showConfirmDeleteUser)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs text-white font-bold transition cursor-pointer shadow-lg shadow-red-950/30"
              >
                Excluir Cadastro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation of User Password Reset Dialog Overlay */}
      {showConfirmResetUser && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-premium rounded-2xl w-full max-w-sm overflow-hidden border border-sky-500/20 shadow-2xl animate-scale-up p-6">
            <div className="flex items-center gap-3 text-sky-400 mb-4">
              <KeyRound className="w-8 h-8" />
              <h3 className="text-lg font-display font-semibold">Resetar Senha do Técnico</h3>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed mb-6">
              Deseja resetar a credencial do técnico <strong className="text-white">@{showConfirmResetUser}</strong>? A senha de acesso desse profissional será resetada para o padrão do portal: <strong className="text-sky-450 font-mono bg-white/5 py-0.5 px-1.5 rounded border border-white/10">sabesp123</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmResetUser(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleResetUserPassword(showConfirmResetUser);
                  setShowConfirmResetUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-lg"
              >
                Confirmar Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Premium Banner / Brand Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40 shadow-md backdrop-blur-md bg-slate-950/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-4">
            
            {/* Logo/Brand Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-slate-950 font-display font-black text-sm shadow-md shadow-sky-500/20 shrink-0">
                S!
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-display font-bold text-slate-100 leading-none tracking-tight flex items-center gap-1.5">
                  DeskFlow
                  <span className="bg-sky-500/15 text-sky-350 border border-sky-400/20 text-[9px] uppercase tracking-wider font-semibold py-0.5 px-2 rounded-full hidden sm:inline-block">
                    SABESP IT
                  </span>
                </h1>
              </div>
            </div>

            {/* Top Toolbar Quick Indicators */}
            <div className="flex items-center gap-1.5 shrink-0">
              {currentUser?.username === 'admin' ? (
                <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-400 text-xs font-semibold py-1 px-2.5 rounded-lg border border-sky-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-450 shrink-0 animate-pulse" />
                  <span className="hidden sm:inline">Modo Supervisor</span>
                  <span className="sm:hidden">Sup</span>
                </div>
              ) : isAdmin && currentUser ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold py-1 px-2.5 rounded-lg border border-emerald-500/20 max-w-[170px]">
                  <User className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate hidden sm:inline">{currentUser.displayName}</span>
                </div>
              ) : null}

              {isAdmin && currentUser?.username !== 'admin' && (
                <>
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="flex items-center gap-1.5 bg-white/5 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold py-1.5 px-2 rounded-xl sm:px-3 hover:bg-white/10 transition cursor-pointer"
                    title="Alterar sua senha de acesso"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="hidden md:inline">Alterar Senha</span>
                  </button>

                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-600 border border-indigo-550/20 text-white font-bold text-xs py-1.5 px-2.5 rounded-xl sm:px-3 transition active:scale-95 cursor-pointer shadow-md shadow-indigo-950/20"
                    title="Importar múltiplos textos via IA ou Offline (.txt)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                    <span className="hidden md:inline">Importar</span>
                  </button>

                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-teal-650 to-emerald-650 hover:from-teal-600 hover:to-emerald-650 border border-emerald-550/20 text-white font-bold text-xs py-1.5 px-2.5 rounded-xl sm:px-3 transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/20"
                    title="Exportar toda a biblioteca de de textos"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-300" />
                    <span className="hidden md:inline">Exportar</span>
                  </button>

                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-1 bg-sky-500 text-slate-950 font-bold text-xs py-1.5 px-2.5 rounded-xl sm:px-3 hover:bg-sky-400 transition active:scale-95 cursor-pointer shadow-sky-500/20 shadow-md"
                    title="Criar nova fraseologia"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="hidden sm:inline">Nova Frase</span>
                  </button>
                </>
              )}

              {isAdmin && currentUser?.username !== 'admin' && (
                <button
                  onClick={handleRestoreDefaults}
                  className="p-1.5 bg-white/5 text-slate-350 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer border border-white/10"
                  title="Restaurar fraseologias originais"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}



              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-rose-500/10 text-rose-400 hover:text-rose-350 border border-rose-500/20 text-xs font-bold py-1.5 px-2.5 rounded-xl sm:px-3 hover:bg-rose-500/20 transition cursor-pointer"
                  title="Encerrar sessão e recarregar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              ) : (
                <>
                  <a 
                    href="https://sabesp.service-now.com/esc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-medium hover:bg-white/5 py-1.5 px-2.5 rounded-xl transition border border-transparent hover:border-white/5"
                  >
                    <span>ServiceNow SABESP</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="flex items-center gap-1 bg-white/5 text-white border border-white/10 hover:bg-white/10 text-xs font-semibold py-1.5 px-2.5 rounded-xl sm:px-3 transition active:scale-95 cursor-pointer"
                  >
                    <Lock className="w-3 h-3 text-sky-400" />
                    <span className="hidden sm:inline">Acesso Restrito</span>
                    <span className="sm:hidden">Acesso</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </header>
      {/* Main Single Column Workspace Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-grow w-full">
        <div className="space-y-6">

          {currentUser?.username === 'admin' ? (
            /* THE SUPERINTENDENT USERBOARD DASHBOARD VIEW */
            <div className="space-y-6">
              
              {/* Dashboard Overall Headline with live supervisor action feedback */}
              <div className="glass rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-slate-900/30 to-slate-950/50 relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sky-400 mb-1">
                      <Sparkles className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Painel Administrativo - Supervisor Geral</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-100">Controle Operacional de Técnicos</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Gerencie acessos de técnicos contratados da SABESP IT, acompanhe estatísticas gerais de fraseologia cadastrada e administre senhas com segurança.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0">
                    <Database className="w-4 h-4 shrink-0" />
                    <span>Banco Local Saudável</span>
                  </div>
                </div>

                {/* General Infos Stat grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  
                  {/* Stat Card 1: Registered Tech Users */}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 relative group hover:border-slate-850 transition">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Técnicos Cadastrados</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-display font-extrabold text-white">{registeredTechsCount}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Contas ativas</span>
                    </div>
                    <Users className="absolute bottom-4 right-4 w-10 h-10 text-white/3 group-hover:scale-105 transition" />
                  </div>

                  {/* Stat Card 2: Combined Portfolio Phrases */}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 relative group hover:border-slate-850 transition">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fraseologias Registradas</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-display font-extrabold text-white">{totalPhrasesCountAcrossAllUsers}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Total de textos</span>
                    </div>
                    <FileSpreadsheet className="absolute bottom-4 right-4 w-10 h-10 text-white/3 group-hover:scale-105 transition" />
                  </div>

                  {/* Stat Card 3: Recent Technician joined */}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 relative group hover:border-slate-850 transition">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Último Cadastrado</p>
                    <div className="mt-2.5">
                      <span className="text-sm font-semibold text-sky-400 block truncate max-w-xs">{latestRegisteredUser ? latestRegisteredUser.displayName : 'Nenhum técnico'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {latestRegisteredUser ? `Criado em: ${new Date(latestRegisteredUser.createdAt).toLocaleDateString('pt-BR')}` : 'Aguardando cadastros'}
                      </span>
                    </div>
                    <Clock className="absolute bottom-4 right-4 w-10 h-10 text-white/3" />
                  </div>

                </div>
              </div>

              {/* THE TECHNICAL USERBOARD DIRECTORY */}
              <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-slate-900/10">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/10">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Técnicos Registrados na Plataforma</h3>
                    <p className="text-[11px] text-slate-400">Administração geral de perfis e acessos</p>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {accounts.filter(acc => acc.username !== 'admin').length > 0 ? (
                    accounts.filter(acc => acc.username !== 'admin').map((tech) => (
                      <div key={tech.username} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/1 flex-wrap">
                        
                        {/* Technician Identity block */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-350 text-sm font-bold font-display leading-none">
                            {tech.displayName.substring(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 text-sm leading-tight">{tech.displayName}</span>
                              <span className="text-[10px] font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                @{tech.username}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-405 mt-1">
                              Registrado em: <span className="font-mono text-slate-400">{new Date(tech.createdAt).toLocaleDateString('pt-BR')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Quick Portfolio Stats */}
                        <div className="flex items-center gap-6 shrink-0 font-sans text-xs">
                          <div className="text-left sm:text-center">
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block leading-none">Portfólio</span>
                            <span className="text-sm font-bold text-sky-400 leading-snug font-mono mt-1 block">
                              {tech.phrases.length} fraseologias
                            </span>
                          </div>
                        </div>

                        {/* Reset & Delete Controls Section */}
                        <div className="flex items-center gap-2 sm:self-center">
                          
                          {/* Reset Password target */}
                          <button
                            onClick={() => setShowConfirmResetUser(tech.username)}
                            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-500/10 text-sky-400 hover:text-white hover:bg-sky-500/20 text-xs font-semibold border border-sky-500/10 transition cursor-pointer"
                            title="Resetar senha para padrão"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Resetar Senha</span>
                          </button>

                          {/* Deletion control (cannot delete admin) */}
                          <button
                            onClick={() => setShowConfirmDeleteUser(tech.username)}
                            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/10 transition cursor-pointer"
                            title="Remover Portfólio permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Deletar</span>
                          </button>

                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <Users className="w-8 h-8 text-slate-500 mx-auto mb-2.5 stroke-1" />
                      <p className="text-xs text-slate-400">Nenhum técnico cadastrado no sistema ainda.</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                        As contas dos técnicos de TI cadastradas aparecerão aqui. O supervisor de TI poderá resetar suas senhas ou excluir portfólios se necessário.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* THE TRADITIONAL PHRASE SEARCH & SEPARATE DETAILS WORKSPACE */
            <div className="space-y-4">
              
              {/* Continuous Sticky Search Widget Container */}
              <div className="glass rounded-xl p-3 sm:p-4 shadow-lg mb-4 border border-white/10 bg-slate-950/95 sticky top-14 z-30 backdrop-blur-md">

                <div className="relative flex items-center w-full">
                  <div className="absolute left-3.5 text-slate-400">
                    <Search className="w-4 h-4 text-sky-400" />
                  </div>
                  
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquise por '365', 'VPN', 'Impressora', 'Senha'..."
                    className="w-full pl-10 pr-9 py-2.5 glass-input rounded-xl text-white text-xs sm:text-sm font-sans font-medium placeholder:text-slate-500 shadow-xs focus:outline-hidden select-text"
                    autoFocus
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick-match term suggestions */}
                <div className="flex flex-wrap gap-1.5 items-center justify-center mt-2.5 p-0.5 w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Atalhos de busca:
                  </span>
                  {hotTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition cursor-pointer border ${
                        searchQuery.toLowerCase() === tag.toLowerCase()
                          ? 'bg-sky-500 text-slate-950 border-sky-500 font-bold shadow-xs'
                          : 'bg-white/5 text-slate-305 hover:bg-white/10 border-white/5'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

              </div>

              {/* Canned Phrases Content Grid layout */}
              {filteredPhrases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPhrases.map((phrase) => (
                    <PhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      onEdit={openEditModal}
                      onDelete={handleDeletePhrase}
                      onTogglePin={handleTogglePin}
                      isAdmin={isAdmin}
                      searchQuery={searchQuery}
                      onTagClick={(tag) => setSearchQuery(tag)}
                    />
                  ))}
                </div>
              ) : (
                /* Zero State feedback view */
                <div className="glass rounded-2xl p-10 text-center max-w-lg mx-auto shadow-xl my-6 border border-white/5 bg-slate-900/10">
                  <LifeBuoy className="w-10 h-10 text-sky-400 mx-auto mb-3 stroke-1 animate-pulse" />
                  <h3 className="text-base font-display font-semibold text-slate-100">Nenhuma fraseologia encontrada</h3>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Não encontramos resultados correspondentes a <strong className="text-slate-200 font-mono">"{searchQuery}"</strong>. Tente buscar um termo diferente ou use os atalhos.
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition cursor-pointer border border-white/10"
                    >
                      Limpar Filtros
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-sky-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-sky-400 transition cursor-pointer shadow-md shadow-sky-500/10"
                      >
                        Criar Nova Fraseologia
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Fixed Admin Floating Action Button for prompt responses */}
      {isAdmin && currentUser?.username !== 'admin' && (
        <div className="fixed bottom-6 left-6 z-30">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3.5 bg-sky-500 text-slate-950 rounded-2xl shadow-2xl shadow-sky-500/20 hover:bg-sky-400 transition active:scale-95 cursor-pointer font-extrabold text-sm border border-sky-400/20"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            <span>Criar Fraseologia</span>
          </button>
        </div>
      )}

      {/* Admin Login Modal overlay */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLogin}
        accounts={accounts}
        onAccountsChange={updateAndSaveAccounts}
      />

      {/* Add / Edit Phrase Editor Modal */}
      <PhraseEditorModal
        phrase={editingPhrase}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePhrase}
        onDelete={handleDeletePhrase}
        totalPhrasesCount={phrases.length}
      />

      {/* Change password modal popup */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        accounts={accounts}
        onPasswordChanged={async (updatedUser, updatedAccounts) => {
          setCurrentUser(updatedUser);
          await updateAndSaveAccounts(updatedAccounts);
          notify('Senha alterada com sucesso!');
        }}
      />
      
      {/* AI Canned Phrases Lote Importer Modal */}
      <AIImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* AI Export Modal */}
      <AIExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        phrases={phrases}
      />
      
    </div>
  );
}
