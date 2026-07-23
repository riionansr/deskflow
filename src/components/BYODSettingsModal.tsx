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
  HelpCircle,
  HardDrive
} from 'lucide-react';
import { Phrase } from '../types';
import {
  GitHubConfig,
  loadGitHubConfig,
  saveGitHubConfig,
  loadGeminiKey,
  saveGeminiKey,
  downloadBackupJSON,
  resetLocalPhrasesToDefault
} from '../lib/storage';
import { pushPhrasesToGitHub, pullPhrasesFromGitHub } from '../lib/githubSync';

interface BYODSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrases: Phrase[];
  onPhrasesUpdated: (newPhrases: Phrase[], notifyMessage?: string) => void;
}

export default function BYODSettingsModal({
  isOpen,
  onClose,
  phrases,
  onPhrasesUpdated
}: BYODSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'storage' | 'github' | 'gemini'>('storage');

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

  // Gemini Key State
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [geminiSavedMsg, setGeminiSavedMsg] = useState<boolean>(false);

  // Storage Stats
  const storageSizeKb = Math.round((JSON.stringify(phrases).length * 2) / 1024);

  useEffect(() => {
    if (isOpen) {
      setGhConfig(loadGitHubConfig());
      setGeminiKey(loadGeminiKey());
      setGhMessage(null);
      setGeminiSavedMsg(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  // Gemini Key Actions
  const handleSaveGeminiKey = () => {
    saveGeminiKey(geminiKey);
    setGeminiSavedMsg(true);
    setTimeout(() => setGeminiSavedMsg(false), 3000);
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
    if (confirm('Tem certeza que deseja restaurar as fraseologias padrão? Todas as suas frases locais não salvas serão substituídas.')) {
      const defaults = resetLocalPhrasesToDefault();
      onPhrasesUpdated(defaults, 'Fraseologias restauradas para o catálogo padrão!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl glass-card rounded-2xl overflow-hidden border border-sky-500/20 shadow-2 shadow-sky-500/10 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-white/10 flex justify-between items-center bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-display">
                Armazenamento & Sync BYOD
              </h3>
              <p className="text-xs text-slate-400">
                Gira seus dados locais, faça backups ou conecte com o GitHub sem depender de servidor
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

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-slate-900/30 px-4 pt-2 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
              activeTab === 'storage'
                ? 'bg-slate-800 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dados Locais</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
              activeTab === 'github'
                ? 'bg-slate-800 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Sync (BYO Token)</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
              activeTab === 'gemini'
                ? 'bg-slate-800 text-sky-400 border-sky-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Gemini Key (Opcional)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
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
                  O DeskFlow Community é 100% focado em privacidade e independência. Todos os seus dados ficam salvos de forma persistente diretamente no <strong>LocalStorage do seu próprio navegador</strong>. Não há necessidade de cadastrar usuários, senhas ou contratar bancos de dados pagos.
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
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restaurar catálogo inicial padrão</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB SYNC */}
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

          {/* TAB 3: GEMINI KEY */}
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Key className="w-4 h-4" />
                  <span>Bring Your Own Key (BYOK) - Gemini AI</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Caso hospede o sistema como um site estático (Vercel / GitHub Pages) sem servidor Node, você pode inserir sua chave pública ou gratuita da API do Gemini para habilitar a extração inteligente de fraseologias via IA.
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:underline pt-1 font-semibold"
                >
                  <span>Obter chave gratuita no Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {geminiSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chave do Gemini salva com sucesso no LocalStorage!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chave de API do Gemini (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveGeminiKey}
                  className="flex items-center gap-1.5 bg-purple-500 text-slate-950 hover:bg-purple-400 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Chave Gemini</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
