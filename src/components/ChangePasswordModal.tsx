import React, { useState } from 'react';
import { KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';
import { hashPassword } from '../lib/crypto';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  onPasswordChanged: (updatedUser: UserAccount, updatedAccounts: UserAccount[]) => void;
}

export default function ChangePasswordModal({ isOpen, onClose, currentUser, accounts, onPasswordChanged }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 4) {
      setError('A nova senha deve possuir no mínimo 4 caracteres.');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate current password
      const hashedCurrent = await hashPassword(currentPassword);
      if (currentUser.passwordHash !== hashedCurrent) {
        setError('A senha atual está incorreta.');
        setIsSubmitting(false);
        return;
      }

      const hashedNew = await hashPassword(newPassword);

      const updatedAccounts = accounts.map(acc => {
        if (acc.username === currentUser.username) {
          return {
            ...acc,
            passwordHash: hashedNew
          };
        }
        return acc;
      });

      const updatedUser = { ...currentUser, passwordHash: hashedNew };
      onPasswordChanged(updatedUser, updatedAccounts);
      setSuccess('Sua senha foi alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
    } catch (err) {
      setError('Erro ao processar alteração de senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div 
        className="relative w-full max-w-sm glass-premium rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-sky-500 w-full" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <KeyRound className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">Alterar Sua Senha</h3>
              <p className="text-[11px] text-slate-400">Técnico: {currentUser.displayName}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/10 mb-4 animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="font-medium leading-tight">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/10 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="font-medium leading-tight">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                Senha Atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white text-xs font-medium focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white text-xs font-medium focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-digite a nova senha"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white text-xs font-medium focus:outline-hidden font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-sky-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-sky-400 transition cursor-pointer flex justify-center items-center shadow-lg"
            >
              {isSubmitting ? 'Criptografando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
