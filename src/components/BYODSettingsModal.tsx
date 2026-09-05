import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Github,
  Key,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Save,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  HardDrive,
  FolderPlus,
  Trash2,
  FileSignature,
  Plus,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Phrase } from '../types';
import {
  GitHubConfig,
  loadGitHubConfig,
  saveGitHubConfig,
  downloadBackupJSON,
  resetLocalPhrasesToDefault,
  clearAllLocalCategories,
  loadCategories,
  saveCategories,
  loadCustomSignature,
  saveCustomSignature,
  DEFAULT_SIGNATURE
} from '../lib/storage';
import { pushPhrasesToGitHub, pullPhrasesFromGitHub } from '../lib/githubSync';
import { 
  initGoogleDriveAuth, 
  loginWithGoogle, 
  logoutGoogle, 
  savePhrasesToGoogleDrive, 
  loadPhrasesFromGoogleDrive 
} from '../lib/googleDriveSync';
import { User } from 'firebase/auth';

interface BYODSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrases: Phrase[];
  categories: string[];
  onPhrasesUpdated: (newPhrases: Phrase[], notifyMessage?: string) => void;
  onCategoriesUpdated: (newCategories: string[], notifyMessage?: string) => void;
}

export default function BYODSettingsModal({
  isOpen,
  onClose,
  phrases,
  categories,
  onPhrasesUpdated,
  onCategoriesUpdated
}: BYODSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'storage' | 'gdrive' | 'categories' | 'signature' | 'github'>('gdrive');

  // Google Drive Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [gdriveLoading, setGdriveLoading] = useState<boolean>(false);
  const [gdriveMsg, setGdriveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Categories State
  const [catList, setCatList] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState('');

  // Signature State
  const [sigText, setSigText] = useState('');
  const [sigSavedMsg, setSigSavedMsg] = useState(false);

  // GitHub State
  const [ghConfig, setGhConfig] = useState<GitHubConfig>({
    token: '',
    repo: '',
    path: 'deskflow-phrases.json',
    branch: 'main',
    autoSyncOnSave: false
  });
  const [ghSyncing, setGhSyncing] = useState<boolean>(false);
  const [ghMessage, setGhMessage] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null);

  // Storage Stats
  const storageSizeKb = Math.round((JSON.stringify(phrases).length * 2) / 1024);

  useEffect(() => {
    if (isOpen) {
      setGhConfig(loadGitHubConfig());
      setCatList(loadCategories());
      setSigText(loadCustomSignature());
      setGhMessage(null);
      setGdriveMsg(null);
      setSigSavedMsg(false);

      const unsubscribe = initGoogleDriveAuth((user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Google Drive Actions
  const handleGoogleLogin = async () => {
    setGdriveMsg(null);
    setGdriveLoading(true);
    try {
      const res = await loginWithGoogle();
      setGoogleUser(res.user);
      setGoogleAccessToken(res.accessToken);
      setGdriveMsg({ type: 'success', text: `Conectado como ${res.user.displayName || res.user.email}!` });
    } catch (err: any) {
      setGdriveMsg({ type: 'error', text: err.message || 'Falha ao fazer login com o Google.' });
    } finally {
      setGdriveLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
    setGdriveMsg({ type: 'success', text: 'Sessão do Google encerrada.' });
  };

  const handleSaveToDrive = async () => {
    if (!googleAccessToken) {
      setGdriveMsg({ type: 'error', text: 'Por favor, faça login com o Google primeiro.' });
      return;
    }
    setGdriveMsg(null);
    setGdriveLoading(true);
    try {
      const result = await savePhrasesToGoogleDrive(googleAccessToken, phrases);
      setGdriveMsg({ type: 'success', text: result.message });
    } catch (err: any) {
      setGdriveMsg({ type: 'error', text: err.message || 'Erro ao salvar no Google Drive.' });
    } finally {
      setGdriveLoading(false);
    }
  };

  const handleLoadFromDrive = async () => {
    if (!googleAccessToken) {
      setGdriveMsg({ type: 'error', text: 'Por favor, faça login com o Google primeiro.' });
      return;
    }
    setGdriveMsg(null);
    setGdriveLoading(true);
    try {
      const result = await loadPhrasesFromGoogleDrive(googleAccessToken);
      onPhrasesUpdated(result.phrases, result.message);
      setGdriveMsg({ type: 'success', text: result.message });
    } catch (err: any) {
      setGdriveMsg({ type: 'error', text: err.message || 'Erro ao carregar do Google Drive.' });
    } finally {
      setGdriveLoading(false);
    }
  };

  // Category Actions
  const handleAddCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newCatInput.trim();
    if (!clean) return;

    if (catList.some(c => c.toLowerCase() === clean.toLowerCase())) {
      alert('Esta categoria já existe!');
      return;
    }

    const updated = [...catList, clean];
    setCatList(updated);
    saveCategories(updated);
    onCategoriesUpdated(updated, `Categoria "${clean}" adicionada!`);
    setNewCatInput('');
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const phrasesInCat = phrases.filter(p => p.category === catToDelete).length;
    const confirmMsg = phrasesInCat > 0
      ? `Existem ${phrasesInCat} fraseologia(s) associada(s) à categoria "${catToDelete}". Se você removê-la, a categoria será desvinculada dessas frases. Confirmar?`
      : `Deseja remover a categoria "${catToDelete}"?`;

    if (confirm(confirmMsg)) {
      const updatedCategories = catList.filter(c => c !== catToDelete);
      setCatList(updatedCategories);
      saveCategories(updatedCategories);
      onCategoriesUpdated(updatedCategories, `Categoria "${catToDelete}" removida.`);

      // Update phrases using this category to empty
      if (phrasesInCat > 0) {
        const updatedPhrases = phrases.map(p => {
          if (p.category === catToDelete) {
            return { ...p, category: '' };
          }
          return p;
        });
        onPhrasesUpdated(updatedPhrases);
      }
    }
  };

  const handleClearAllCategories = () => {
    if (catList.length === 0) return;
    if (confirm('Deseja zerar todas as categorias cadastradas? Elas serão removidas do filtro e do catálogo.')) {
      clearAllLocalCategories();
      setCatList([]);
      onCategoriesUpdated([], 'Todas as categorias foram zeradas!');
    }
  };

  // Signature Actions
  const handleSaveSignature = () => {
    saveCustomSignature(sigText);
    setSigSavedMsg(true);
    setTimeout(() => setSigSavedMsg(false), 3000);
  };

  const handleResetSignature = () => {
    if (confirm('Deseja zerar a assinatura?')) {
      setSigText('');
      saveCustomSignature('');
      setSigSavedMsg(true);
      setTimeout(() => setSigSavedMsg(false), 3000);
    }
  };

  // GitHub Actions
  const handleSaveGhConfig = () => {
    saveGitHubConfig(ghConfig);
    setGhMessage({ type: 'success', text: 'Configurações do GitHub salvas localmente!' });
  };

  const handlePushToGitHub = async () => {
    setGhMessage(null);
    setGhSyncing(true);
    try {
      saveGitHubConfig(ghConfig);
      const res = await pushPhrasesToGitHub(ghConfig, phrases);
      setGhMessage({
        type: 'success',
        text: res.message,
        url: res.commitUrl
      });
    } catch (err: any) {
      setGhMessage({ type: 'error', text: err.message || 'Erro ao sincronizar com GitHub' });
    } finally {
      setGhSyncing(false);
    }
  };

  const handlePullFromGitHub = async () => {
    setGhMessage(null);
    setGhSyncing(true);
    try {
      saveGitHubConfig(ghConfig);
      const res = await pullPhrasesFromGitHub(ghConfig);
      onPhrasesUpdated(res.phrases, res.message);
      setGhMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setGhMessage({ type: 'error', text: err.message || 'Erro ao puxar do GitHub' });
    } finally {
      setGhSyncing(false);
    }
  };

  // Restore JSON Backup File
  const handleFileUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          alert('Arquivo JSON inválido. Deve conter uma lista de fraseologias.');
          return;
        }
        const restored: Phrase[] = parsed.map((item: any, idx: number) => ({
          id: item.id || `restored-${Date.now()}-${idx}`,
          title: item.title || 'Sem título',
          subtitle: item.subtitle || '',
          content: item.content || '',
          category: item.category || 'Outros',
          tags: Array.isArray(item.tags) ? item.tags : [],
          updatedAt: item.updatedAt || new Date().toISOString(),
          orderIndex: item.orderIndex ?? (idx + 1),
          pinned: !!item.pinned
        }));
        onPhrasesUpdated(restored, `Restauradas ${restored.length} fraseologias do backup JSON!`);
        alert(`Backup restaurado com sucesso! (${restored.length} fraseologias)`);
      } catch (err) {
        alert('Erro ao ler arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (confirm('Tem certeza que deseja zerar todas as fraseologias e categorias? Todas as frases e categorias locais serão apagadas para você iniciar do zero ou importar um novo arquivo.')) {
      const emptyList = resetLocalPhrasesToDefault();
      clearAllLocalCategories();
      setCatList([]);
      onCategoriesUpdated([], 'Categorias zeradas!');
      onPhrasesUpdated(emptyList, 'Repertório e categorias zerados com sucesso! Crie suas frases ou importe um backup.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl glass-card rounded-2xl overflow-hidden border border-sky-500/20 shadow-2 shadow-sky-500/10 my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
                Configurações &amp; Dados
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Armazenamento, categorias, assinatura e sincronizações em nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Dropdown Navigator (sm:hidden) */}
        <div className="sm:hidden p-3 bg-slate-900/80 border-b border-white/10 shrink-0">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Selecione a Seção:
          </label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full bg-slate-950 border border-sky-500/30 rounded-xl px-3 py-2 text-xs font-semibold text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <option value="gdrive">☁️ Google Drive Sync</option>
            <option value="storage">💾 Dados Locais</option>
            <option value="categories">📁 Categorias ({catList.length})</option>
            <option value="signature">✍️ Assinatura</option>
            <option value="github">🐙 GitHub Sync</option>
          </select>
        </div>

        {/* Desktop / Tablet Tab Selection (hidden sm:flex with flex-wrap) */}
        <div className="hidden sm:flex flex-wrap border-b border-white/10 bg-slate-900/50 p-2 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('gdrive')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
              activeTab === 'gdrive'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Google Drive</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
              activeTab === 'storage'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dados Locais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
              activeTab === 'categories'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Categorias ({catList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signature')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
              activeTab === 'signature'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Assinatura</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
              activeTab === 'github'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Sync</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB: GOOGLE DRIVE SYNC */}
          {activeTab === 'gdrive' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-sky-500/20 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold font-display">
                  <Cloud className="w-4 h-4" />
                  <span>Sincronização em Nuvem com Google Drive (Sem Backend)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Faça login com sua conta do Google para salvar e restaurar suas frases automaticamente no seu <strong>Google Drive</strong>.
                  Os dados ficam num arquivo privado <code className="text-sky-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">deskflow-phrases.json</code>.
                  Ao logar em qualquer computador com sua conta, suas fraseologias estarão lá!
                </p>
              </div>

              {gdriveMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    gdriveMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {gdriveMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{gdriveMsg.text}</span>
                </div>
              )}

              {/* User Google Card */}
              {googleUser ? (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Avatar"
                        className="w-11 h-11 rounded-full border-2 border-sky-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-sm">
                        {googleUser.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {googleUser.displayName || 'Usuário Google'}
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans">
                          Conectado
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">{googleUser.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogout}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl transition border border-rose-500/20 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-white/10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">
                      Conecte sua conta do Google
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Sem senhas para lembrar. Basta logar com o Google para ter sincronização entre computadores.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={gdriveLoading}
                    className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold py-2.5 px-5 rounded-xl transition cursor-pointer shadow-lg shadow-white/5 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{gdriveLoading ? 'Conectando...' : 'Entrar com o Google'}</span>
                  </button>
                </div>
              )}

              {/* Sync Controls */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ações de Sincronização Google Drive
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSaveToDrive}
                    disabled={gdriveLoading || !googleUser}
                    className="flex items-center justify-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold py-3 px-4 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <CloudUpload className={`w-4 h-4 ${gdriveLoading ? 'animate-bounce' : ''}`} />
                    <span>Salvar Frases no Google Drive</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadFromDrive}
                    disabled={gdriveLoading || !googleUser}
                    className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-3 px-4 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <CloudDownload className={`w-4 h-4 ${gdriveLoading ? 'animate-bounce' : ''}`} />
                    <span>Carregar do Google Drive</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LOCAL STORAGE & BACKUP */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-100 font-display">
                      {phrases.length} Frases
                    </div>
                    <div className="text-xs text-slate-400">Armazenadas no navegador</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-100 font-display">
                      ~{storageSizeKb} KB
                    </div>
                    <div className="text-xs text-slate-400">Tamanho no LocalStorage</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  Como funciona o modelo BYOD (Bring Your Own Data)?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O DeskFlow Community é 100% focado em privacidade e independência. Todos os seus dados ficam salvos de forma persistente diretamente no <strong>LocalStorage do seu próprio navegador</strong>.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ações de Backup e Restauração
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => downloadBackupJSON(phrases)}
                    className="flex items-center justify-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-350 border border-sky-500/30 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Backup Completo (.JSON)</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Restaurar Backup (.JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUploadBackup}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResetToDefault}
                    className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-2 px-3 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Zerar catálogo local (apagar todas as frases)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <FolderPlus className="w-4 h-4" />
                  <span>Gerenciador de Categorias</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Crie novas categorias customizadas para sua equipe ou remova categorias que você não utiliza.
                </p>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Nome da nova categoria (ex: Redes & Wi-Fi)..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!newCatInput.trim()}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Adicionar</span>
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Categorias Ativas ({catList.length})
                  </h4>
                  {catList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllCategories}
                      className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Zerar todas as categorias</span>
                    </button>
                  )}
                </div>

                {catList.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
                    <FolderPlus className="w-7 h-7 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">
                      Nenhuma categoria cadastrada. O catálogo de categorias está zerado.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Adicione uma nova categoria acima ou digite uma diretamente ao criar ou importar fraseologias.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {catList.map((cat) => {
                      const count = phrases.filter(p => p.category === cat).length;

                      return (
                        <div
                          key={cat}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-slate-200 truncate">{cat}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-400 shrink-0">
                              {count} frase(s)
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                            title={`Remover categoria "${cat}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM SIGNATURE */}
          {activeTab === 'signature' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <FileSignature className="w-4 h-4" />
                  <span>Assinatura e Rodapé Customizado</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Defina o texto que será anexado automaticamente ao clicar no botão de assinatura durante a edição de fraseologias.
                </p>
              </div>

              {sigSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Assinatura salva com sucesso!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto da Assinatura / Rodapé
                </label>
                <textarea
                  rows={6}
                  value={sigText}
                  onChange={(e) => setSigText(e.target.value)}
                  placeholder="configure sua assinatura"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono leading-relaxed resize-y"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleResetSignature}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer underline"
                >
                  Zerar assinatura
                </button>

                <button
                  onClick={handleSaveSignature}
                  className="flex items-center gap-1.5 bg-sky-500 text-slate-950 hover:bg-sky-400 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Assinatura</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GITHUB SYNC */}
          {activeTab === 'github' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <Github className="w-4 h-4" />
                  <span>Sincronização Direta com Repositório GitHub</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Você pode vincular sua biblioteca a um repositório seu no GitHub (público ou privado).
                  Gere um <strong>Personal Access Token (PAT)</strong> no GitHub com permissão de conteúdo (`repo` ou `contents:write`).
                </p>
                <a
                  href="https://github.com/settings/tokens/new?description=DeskFlow%20BYOD%20Sync&scopes=repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline pt-1 font-semibold"
                >
                  <span>Gerar novo Token no GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {ghMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    ghMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {ghMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div>{ghMessage.text}</div>
                    {ghMessage.url && (
                      <a
                        href={ghMessage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-350 hover:underline text-[11px] block mt-1 font-mono"
                      >
                        Ver Commit no GitHub &rarr;
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    value={ghConfig.token}
                    onChange={(e) => setGhConfig({ ...ghConfig, token: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Repositório (usuario/repositorio)
                    </label>
                    <input
                      type="text"
                      value={ghConfig.repo}
                      onChange={(e) => setGhConfig({ ...ghConfig, repo: e.target.value })}
                      placeholder="seu-usuario/meu-repo-frases"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Caminho do Arquivo
                    </label>
                    <input
                      type="text"
                      value={ghConfig.path}
                      onChange={(e) => setGhConfig({ ...ghConfig, path: e.target.value })}
                      placeholder="deskflow-phrases.json"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={!!ghConfig.autoSyncOnSave}
                    onChange={(e) => setGhConfig({ ...ghConfig, autoSyncOnSave: e.target.checked })}
                    className="rounded border-white/20 bg-slate-900 text-sky-500 focus:ring-sky-500/20"
                  />
                  <label htmlFor="autoSync" className="text-xs text-slate-300 cursor-pointer">
                    Sincronizar automaticamente no GitHub ao salvar ou editar frases locais
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap gap-2 justify-between items-center border-t border-white/10">
                <button
                  onClick={handleSaveGhConfig}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl transition cursor-pointer border border-white/10"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Configuração</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePullFromGitHub}
                    disabled={ghSyncing || !ghConfig.repo}
                    className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-350 border border-sky-500/30 text-xs font-bold py-2 px-3.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <ArrowDownCircle className={`w-3.5 h-3.5 ${ghSyncing ? 'animate-spin' : ''}`} />
                    <span>Puxar do GitHub (Pull)</span>
                  </button>

                  <button
                    onClick={handlePushToGitHub}
                    disabled={ghSyncing || !ghConfig.token || !ghConfig.repo}
                    className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 text-xs font-bold py-2 px-3.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <ArrowUpCircle className={`w-3.5 h-3.5 ${ghSyncing ? 'animate-spin' : ''}`} />
                    <span>Enviar para GitHub (Push)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
