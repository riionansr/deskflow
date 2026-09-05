import React, { useState, useEffect } from 'react';
import { Shield, X, AlertCircle, UserPlus, LogIn, CheckCircle2, KeyRound } from 'lucide-react';
import { UserAccount, Phrase } from '../types';
import { hashPassword } from '../lib/crypto';
import { saveAccounts } from '../lib/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: UserAccount) => void;
  accounts: UserAccount[];
  onAccountsChange: (updatedAccounts: UserAccount[]) => Promise<any>;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess, accounts, onAccountsChange }: AdminLoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset messages when closing/switching tabs 
    setError('');
    setSuccess('');
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const user = loginUsername.trim().toLowerCase();
    if (!user || !loginPassword) {
      setError('Por favor, digite o usuário e a senha.');
      setIsSubmitting(false);
      return;
    }

    try {
      const found = accounts.find(acc => acc.username === user);
      
      if (!found) {
        setError('Técnico não localizado. Digite credenciais válidas ou crie uma nova conta.');
        setIsSubmitting(false);
        return;
      }

      const hashedInput = await hashPassword(loginPassword);
      if (found.passwordHash === hashedInput) {
        onLoginSuccess(found);
        setLoginUsername('');
        setLoginPassword('');
        onClose();
      } else {
        setError('Senha incorreta. Verifique e tente novamente.');
      }
    } catch (err) {
      setError('Erro ao validar acesso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const user = registerUsername.trim().toLowerCase().replace(/\s+/g, '');
    const display = registerDisplayName.trim();

    if (!user) {
      setError('Nome de usuário inválido.');
      setIsSubmitting(false);
      return;
    }
    if (user.length < 3) {
      setError('O login do usuário deve conter no mínimo 3 caracteres.');
      setIsSubmitting(false);
      return;
    }
    if (!display) {
      setError('Por favor, informe seu nome de exibição.');
      setIsSubmitting(false);
      return;
    }
    if (registerPassword.length < 4) {
      setError('A senha deve conter pelo menos 4 caracteres para segurança.');
      setIsSubmitting(false);
      return;
    }

    try {
      const exists = accounts.some(acc => acc.username === user);

      if (exists) {
        setError(`O login "${user}" já está cadastrado por outro técnico.`);
        setIsSubmitting(false);
        return;
      }

      const passHash = await hashPassword(registerPassword);
      // Inicia a conta do novo técnico com repertório zerado (Modo Livre BYOD)
      const userPhrases: Phrase[] = [];

      const newAccount: UserAccount = {
        username: user,
        displayName: display,
        passwordHash: passHash,
        phrases: userPhrases,
        createdAt: new Date().toISOString()
      };

      const updated = [...accounts, newAccount];
      await onAccountsChange(updated);

      setSuccess(`Técnico registrado com sucesso! Faça login abaixo.`);
      // Reset register fields
      setRegisterUsername('');
      setRegisterDisplayName('');
      setRegisterPassword('');
      // Swap tab to login with values prefilled
      setLoginUsername(user);
      setActiveTab('login');
    } catch {
      setError('Erro ao processar cadastro do técnico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md glass-premium rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration bar */}
        <div className="h-1.5 bg-gradient-to-r from-sky-500 to-sky-600 w-full" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-slate-100 leading-tight">Área do Técnico IT</h2>
              <p className="text-xs text-slate-400">Gerencie sua própria ordem e portfolio de textos</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Acessar Painel
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Criar Conta
            </button>
          </div>

          {success && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 text-emerald-450 text-xs border border-emerald-500/20 mb-4 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 text-red-410 text-xs border border-red-500/20 mb-4 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Login do Técnico
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="EX: sani, mariana, admin"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden font-medium font-sans"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Sua Senha
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-sky-500 text-slate-950 rounded-xl font-bold hover:bg-sky-400 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer flex justify-center items-center shadow-lg shadow-sky-500/10"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-955 rounded-full animate-spin" />
                ) : (
                  'Confirmar Entrada'
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Login Desejado <span className="text-sky-400 font-normal">(Letras e números)</span>
                </label>
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Ex: sani"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden font-mono font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Nome do Técnico <span className="text-slate-400 font-normal">(Para a assinatura)</span>
                </label>
                <input
                  type="text"
                  value={registerDisplayName}
                  onChange={(e) => setRegisterDisplayName(e.target.value)}
                  placeholder="Ex: Sani (Chat MS Teams)"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden font-sans font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Nova Senha <span className="text-slate-400 font-normal">(Salva de forma segura)</span>
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 font-sans">
                <KeyRound className="w-3.5 h-3.5 text-sky-450 shrink-0" />
                <span>Nossa tecnologia de criptografia local criptografa sua senha com hash SHA-256 antes do salvamento local.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-sky-500 text-slate-950 rounded-xl font-bold hover:bg-sky-400 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex justify-center items-center shadow-lg shadow-sky-500/10"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-955 rounded-full animate-spin" />
                ) : (
                  'Registrar Novo Perfil de TI'
                )}
              </button>
            </form>
          )}


        </div>
      </div>
    </div>
  );
}
