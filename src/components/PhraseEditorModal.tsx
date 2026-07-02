import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Eye, Edit2, Bold, Italic, Link, List, FileSignature, Trash2, RotateCcw, Plus, AlertCircle, FileText } from 'lucide-react';
import { Phrase, CATEGORIES } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface PhraseEditorModalProps {
  phrase: Phrase | null; // Null means creating a new one
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    phrase: Phrase,
    orderAction: 'keep' | 'first' | 'last' | 'position',
    targetPosition?: number
  ) => void;
  onDelete?: (id: string) => void;
  totalPhrasesCount: number;
}

export default function PhraseEditorModal({ phrase, isOpen, onClose, onSave, onDelete, totalPhrasesCount }: PhraseEditorModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('N2 / N3');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [orderAction, setOrderAction] = useState<'keep' | 'first' | 'last' | 'position'>('keep');
  const [targetPosition, setTargetPosition] = useState<number>(1);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (phrase) {
      setTitle(phrase.title);
      setCategory(phrase.category);
      setContent(phrase.content);
      setTagsInput(phrase.tags.join(', '));
      setOrderAction('keep');
      setTargetPosition(phrase.orderIndex || 1);
    } else {
      setTitle('');
      setCategory('N2 / N3');
      setContent('');
      setTagsInput('');
      setOrderAction('last');
      setTargetPosition(totalPhrasesCount + 1);
    }
    setError('');
    setActiveTab('edit');
    setShowConfirmDelete(false);
  }, [phrase, isOpen, totalPhrasesCount]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da fraseologia.');
      return;
    }
    if (!content.trim()) {
      setError('Por favor, preencha o conteúdo da fraseologia.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const savedPhrase: Phrase = {
      id: phrase?.id || `phrase_${Date.now()}`,
      title: title.trim(),
      category: category,
      content: content.trim(),
      tags: tagsArray,
      updatedAt: new Date().toISOString(),
      orderIndex: phrase?.orderIndex || (totalPhrasesCount + 1)
    };

    onSave(savedPhrase, orderAction, orderAction === 'position' ? targetPosition : undefined);
    onClose();
  };

  const handleDelete = () => {
    if (phrase && onDelete) {
      if (!showConfirmDelete) {
        setShowConfirmDelete(true);
      } else {
        onDelete(phrase.id);
        onClose();
        setShowConfirmDelete(false);
      }
    }
  };

  // Helper function to insert markdown at selection
  const insertMarkdown = (syntaxBefore: string, syntaxAfter: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = syntaxBefore + (selectedText || '') + syntaxAfter;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setContent(newContent);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxBefore.length,
        start + syntaxBefore.length + selectedText.length
      );
    }, 50);
  };

  // Predefined formatting shortcuts
  const formatBold = () => insertMarkdown('**', '**');
  const formatItalic = () => insertMarkdown('*', '*');
  const formatList = () => insertMarkdown('\n* ', '');
  const formatLink = () => insertMarkdown('[SABESP ServiceNow](', ')');
  
  const insertStandardFooter = () => {
    const footerText = `\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc`;
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + footerText);
      return;
    }

    const start = textarea.selectionStart;
    const text = textarea.value;
    const newContent = text.substring(0, start) + footerText + text.substring(start);
    setContent(newContent);
    setTimeout(() => textarea.focus(), 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div 
        className="relative w-full max-w-3xl glass-premium rounded-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header decoration */}
        <div className="h-1.5 bg-sky-500 w-full shrink-0" />

        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-450 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
          aria-label="Minimizar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form Container */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-150">
                  {phrase ? 'Editar Fraseologia' : 'Cadastrar Fraseologia'}
                </h2>
                <p className="text-xs text-slate-400">Guarde respostas rápidas padronizadas para o ServiceNow</p>
              </div>
            </div>
          </div>

          {/* Form Fields Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/15 text-red-400 rounded-xl text-xs border border-red-500/20 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Row 1: Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wilder mb-1.5 font-sans">
                  Título do Card <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reset de Senha - Microsoft 365"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm font-sans focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wilder mb-1.5 font-sans">
                  Categoria de Atendimento
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm font-sans focus:outline-hidden font-medium bg-slate-900 cursor-pointer"
                >
                  {CATEGORIES.filter(cat => cat !== 'Todos').map(cat => (
                    <option key={cat} value={cat} className="bg-slate-950 text-white">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Field + Rich Text Toolbar */}
            <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
              
              {/* Tabs and Formatting Toolbar */}
              <div className="bg-slate-950/40 px-4 py-2 border-b border-white/5 flex items-center justify-between flex-wrap gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      activeTab === 'edit'
                        ? 'bg-white/10 text-sky-450 border-white/10 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      activeTab === 'preview'
                        ? 'bg-white/10 text-sky-450 border-white/10 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visualizar Formatado ({content ? 'Pronto' : 'Vazio'})
                  </button>
                </div>

                {activeTab === 'edit' && (
                  <div className="flex items-center gap-1 py-0.5 border-l border-white/10 pl-2 ml-1">
                    <button
                      type="button"
                      onClick={formatBold}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
                      title="Negrito (**)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={formatItalic}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
                      title="Itálico (*)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={formatList}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
                      title="Lista de Tópico"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={formatLink}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
                      title="Link customizado"
                    >
                      <Link className="w-4 h-4 text-sky-400" />
                    </button>
                    <button
                      type="button"
                      onClick={insertStandardFooter}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-md transition font-semibold font-sans select-none border border-sky-500/20 cursor-pointer"
                      title="Anexar rodapé padrão Sabesp com canais, telefone, chatbot e ServiceNow link."
                    >
                      <FileSignature className="w-3.5 h-3.5 shrink-0" />
                      Assinatura SABESP
                    </button>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex-1 bg-slate-950/20">
                {activeTab === 'edit' ? (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreva a instrução ou fraseología para o tech copiar... (Dica: Use markdown para bullets e links)"
                    className="w-full min-h-[220px] p-4 text-white font-mono text-xs focus:ring-0 focus:outline-hidden transition-all bg-slate-950/40 border-0 resize-y select-text"
                    required
                  />
                ) : (
                  <div className="p-5 min-h-[220px] bg-slate-950/20 select-text">
                    {content ? (
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner max-h-[350px] overflow-y-auto">
                        <MarkdownRenderer content={content} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <AlertCircle className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-xs">Digite no Editor para ver a pré-visualização.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Tags Input */}
            <div>
              <label className="block text-xs font-bold text-slate-350 uppercase tracking-wilder mb-1.5 font-sans">
                Tags de Busca <span className="text-slate-400 font-normal">(separadas por vírgula)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex e-mail, senha, 365, reset, microsoft, terceiros"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm font-mono focus:outline-hidden placeholder:text-slate-500"
              />
              <p className="text-[10px] text-slate-400 font-sans mt-1.5">
                Coloque palavras que os técnicos pesquisam com frequência para localizar rapidamente.
              </p>
            </div>

            {/* Seção de Ordenação e Posição */}
            <div className="p-4 rounded-xl bg-slate-950/45 border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <span>↕</span> Ordenação & Posição na Tela
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {phrase && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderAction('keep');
                      setTargetPosition(phrase.orderIndex || 1);
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                      orderAction === 'keep'
                        ? 'bg-sky-500 text-slate-930 border-sky-500'
                        : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    Manter (#{phrase.orderIndex || 1})
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setOrderAction('first');
                    setTargetPosition(1);
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                    orderAction === 'first'
                      ? 'bg-sky-500 text-slate-930 border-sky-500'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  Colocar no Início (1º)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderAction('last');
                    setTargetPosition(phrase ? totalPhrasesCount : totalPhrasesCount + 1);
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                    orderAction === 'last'
                      ? 'bg-sky-500 text-slate-930 border-sky-500'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  Colocar no Fim ({phrase ? totalPhrasesCount : totalPhrasesCount + 1}º)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderAction('position');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                    orderAction === 'position'
                      ? 'bg-sky-500 text-slate-930 border-sky-500'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  Posição Específica
                </button>
              </div>

              {orderAction === 'position' && (
                <div className="flex items-center gap-3 bg-white/3 p-3 rounded-lg border border-white/5 animate-fade-in">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Defina a posição numérica desejada:
                    </label>
                    <p className="text-[10px] text-slate-500">
                      As outras fraseologias serão empurradas automaticamente de acordo com o índice selecionado.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={phrase ? totalPhrasesCount : totalPhrasesCount + 1}
                      value={targetPosition}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setTargetPosition(Math.max(1, Math.min(phrase ? totalPhrasesCount : totalPhrasesCount + 1, val)));
                        }
                      }}
                      className="w-16 px-2.5 py-1.5 rounded-lg glass-input text-white text-xs font-mono font-bold text-center focus:outline-hidden"
                    />
                    <span className="text-xs text-slate-400 font-semibold">de {phrase ? totalPhrasesCount : totalPhrasesCount + 1}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="bg-slate-950/40 p-4 border-t border-white/5 flex items-center justify-between shrink-0">
            <div>
              {phrase && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  onMouseLeave={() => setShowConfirmDelete(false)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer border ${
                    showConfirmDelete
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 active:scale-95'
                      : 'text-rose-450 hover:text-rose-355 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
                  }`}
                  title={showConfirmDelete ? 'Clique novamente para confirmar a exclusão definitiva' : 'Excluir Fraseologia'}
                >
                  <Trash2 className={`w-4 h-4 ${showConfirmDelete ? 'animate-bounce' : ''}`} />
                  {showConfirmDelete ? 'TENHO CERTEZA, EXCLUIR!' : 'EXCLUIR PERMANENTE'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-350 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer border border-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-sky-400 transition active:scale-95 cursor-pointer shadow-sky-500/10"
              >
                <Save className="w-4 h-4 stroke-[3]" />
                SALVAR FRASEOLOGIA
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
