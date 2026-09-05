import React, { useState, useRef } from "react";
import { 
  X, 
  FileText, 
  Upload, 
  Clipboard, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Info,
  HelpCircle,
  Copy,
  Layers,
  ArrowRight,
  Check
} from "lucide-react";
import { Phrase } from "../types";
import { parseStandardText, STANDARD_FORMAT_EXAMPLE } from "../lib/textFormat";

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newPhrases: Omit<Phrase, 'id' | 'updatedAt'>[], shouldClearCurrent: boolean) => void;
}

// Highly robust offline parsing routine for DeskFlow exported text files, JSON arrays, and Standard Format
function parseDirectText(text: string): any[] {
  const trimmedText = text.trim();

  // Try JSON parsing first
  if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmedText);
      const arr = Array.isArray(parsed) ? parsed : (parsed.phrases || [parsed]);
      if (Array.isArray(arr) && arr.length > 0) {
        const jsonResults = arr.map(item => ({
          title: item.title || item.nome || 'Sem título',
          subtitle: item.subtitle || item.subtitulo || undefined,
          category: item.category || item.categoria || 'Geral',
          content: item.content || item.texto || item.frase || '',
          tags: Array.isArray(item.tags) ? item.tags : []
        })).filter(p => p.content.trim().length > 0);

        if (jsonResults.length > 0) return jsonResults;
      }
    } catch {
      // Proceed to standard text parsing
    }
  }

  // Use parseStandardText
  const standardResults = parseStandardText(text);
  if (standardResults && standardResults.length > 0) {
    return standardResults.map(p => ({
      title: p.title || 'Sem título',
      subtitle: p.subtitle,
      category: p.category || 'Geral',
      content: p.content || '',
      tags: p.tags || []
    }));
  }

  return [];
}

export default function AIImportModal({ isOpen, onClose, onImportComplete }: AIImportModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorWord, setErrorWord] = useState<string | null>(null);
  
  // Interactive preview state
  const [importedPreview, setImportedPreview] = useState<any[] | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});
  const [clearCurrent, setClearCurrent] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorWord("O arquivo excede o limite de tamanho de 5MB. Selecione um arquivo menor.");
        return;
      }
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      if (ext === ".txt" || ext === ".json" || ext === ".md") {
        setFile(selectedFile);
        setErrorWord(null);
      } else {
        setErrorWord("Tipo de arquivo inválido. Por favor, envie arquivos de texto (.txt, .json ou .md).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorWord("O arquivo excede o limite de tamanho de 5MB. Selecione um arquivo menor.");
        return;
      }
      setFile(selectedFile);
      setErrorWord(null);
    }
  };

  const handleStartImport = async () => {
    setErrorWord(null);
    setIsProcessing(true);

    try {
      let rawText = "";

      if (activeTab === "upload") {
        if (!file) {
          setErrorWord("Por favor, selecione um arquivo primeiro.");
          setIsProcessing(false);
          return;
        }
        
        rawText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Erro ao ler o arquivo selecionado."));
          reader.readAsText(file, "UTF-8");
        });
      } else {
        if (!pastedText.trim()) {
          setErrorWord("A área de texto está vazia. Por favor, cole suas fraseologias antes de prosseguir.");
          setIsProcessing(false);
          return;
        }
        rawText = pastedText;
      }

      const extracted = parseDirectText(rawText);

      if (extracted && extracted.length > 0) {
        setImportedPreview(extracted);
        const selectionInitial: Record<number, boolean> = {};
        extracted.forEach((_, idx) => {
          selectionInitial[idx] = true;
        });
        setSelectedIndices(selectionInitial);
      } else {
        setErrorWord("Não identificamos fraseologias válidas no texto ou arquivo fornecido. Certifique-se de que cada bloco contenha título ou hashtags (#tag) separados por linhas tracejadas (--- ou --------).");
      }
    } catch (err: any) {
      console.error("Erro durante o processamento do arquivo:", err);
      setErrorWord("Erro ao processar o conteúdo: " + (err?.message || "formato não reconhecido."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetModal = () => {
    setImportedPreview(null);
    setSelectedIndices({});
    setFile(null);
    setPastedText("");
    setErrorWord(null);
  };

  const handleFinishImport = () => {
    if (!importedPreview) return;

    const phrasesToImport = importedPreview
      .filter((_, idx) => !!selectedIndices[idx])
      .map((item) => ({
        title: (item.title || "Sem título").trim(),
        subtitle: item.subtitle?.trim() || undefined,
        category: (item.category || "Geral").trim(),
        content: (item.content || "").trim(),
        tags: Array.isArray(item.tags) ? item.tags : []
      }));

    if (phrasesToImport.length === 0) {
      setErrorWord("Selecione ao menos uma fraseologia para importar.");
      return;
    }

    onImportComplete(phrasesToImport, clearCurrent);
    handleResetModal();
    onClose();
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleSelectAll = () => {
    if (!importedPreview) return;
    const allSelected = importedPreview.every((_, idx) => selectedIndices[idx]);
    const next: Record<number, boolean> = {};
    importedPreview.forEach((_, idx) => {
      next[idx] = !allSelected;
    });
    setSelectedIndices(next);
  };

  const handlePreviewDelete = (idxToDelete: number) => {
    if (!importedPreview) return;
    const filtered = importedPreview.filter((_, idx) => idx !== idxToDelete);
    setImportedPreview(filtered.length > 0 ? filtered : null);
    
    const updatedSel: Record<number, boolean> = {};
    filtered.forEach((_, idx) => {
      updatedSel[idx] = true;
    });
    setSelectedIndices(updatedSel);
  };

  const handlePreviewEditChange = (idx: number, field: string, value: string) => {
    if (!importedPreview) return;
    const updated = [...importedPreview];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };
    setImportedPreview(updated);
  };

  const handleCopyExample = () => {
    navigator.clipboard.writeText(STANDARD_FORMAT_EXAMPLE);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  const selectedCount = Object.values(selectedIndices).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl glass-premium rounded-2xl overflow-hidden border border-sky-500/20 shadow-2xl shadow-sky-500/10 animate-scale-up my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="import-modal-wrapper"
      >
        <div className="h-1 bg-gradient-to-r from-sky-500 to-teal-500 w-full shrink-0" />

        {/* Header Block */}
        <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">Importar Fraseologias</h3>
              <p className="text-[11px] text-slate-400">Importação direta e segura de arquivos corporativos de texto (.txt) ou JSON</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            id="close-import-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body Scrollable Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4" id="import-modal-body">
          {errorWord && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/20 animate-shake" id="import-error-banner">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorWord}</div>
            </div>
          )}

          {/* STEP 1: UPLOAD / PASTE CONFIGURATION */}
          {!importedPreview && (
            <div className="space-y-4" id="import-setup-step">
              
              {/* Informative Banner */}
              <div className="flex items-start gap-3 p-3.5 bg-sky-500/10 rounded-xl border border-sky-500/20 text-xs text-slate-300 font-sans">
                <Info className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-sky-300">Leitura Instantânea e 100% Offline:</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    O DeskFlow reconhece automaticamente blocos com <strong>Título</strong>, <strong>Categoria</strong>, <strong>Corpo do texto</strong> e hashtags (ex: <code className="text-emerald-300 font-mono">#VPN #Senha #N2</code>) separados por linhas tracejadas (<code className="text-sky-300 font-mono">---</code> ou <code className="text-sky-300 font-mono">----------</code>).
                  </p>
                </div>
              </div>

              {/* Toggle Tabs */}
              <div className="flex border-b border-white/5" id="tabs-container">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "upload"
                      ? "border-sky-400 text-sky-300 bg-sky-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar Arquivo (.txt / .json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "paste"
                      ? "border-sky-400 text-sky-300 bg-sky-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Colar Texto Diretamente</span>
                </button>
              </div>

              {/* TAB CONTENT: UPLOAD */}
              {activeTab === "upload" ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center gap-3 min-h-[170px] cursor-pointer ${
                    dragOver
                      ? "border-sky-400 bg-sky-500/10 text-white"
                      : "border-white/10 hover:border-sky-500/30 bg-slate-950/40 text-slate-400"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  id="drag-drop-area"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.json,.md"
                    className="hidden"
                  />
                  <FileText className={`w-10 h-10 ${file ? "text-sky-400 animate-pulse" : "text-slate-500"}`} />
                  {file ? (
                    <div id="selected-file-details">
                      <p className="text-xs font-bold text-slate-200">{file.name}</p>
                      <p className="text-[10px] text-sky-400 mt-1 font-mono">
                        {(file.size / 1024).toFixed(1)} KB — Pronto para processar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Arraste e solte o arquivo aqui, ou <span className="text-sky-400 underline">clique para selecionar</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 font-sans">
                        Formatos suportados: arquivos de texto (.txt), JSON (.json) e Markdown (.md)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5" id="direct-paste-container">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      Cole abaixo o texto com suas fraseologias:
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyExample}
                      className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copiedExample ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedExample ? "Copiado!" : "Copiar modelo de exemplo"}</span>
                    </button>
                  </div>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Cole aqui o texto do seu catálogo...
Exemplo:
--------------------------------------------------
Título: Reset de Senha de Rede
Categoria: Senha & Reset
Prezado colaborador, sua senha foi redefinida com sucesso.
#Senha #Reset #N2
--------------------------------------------------"
                    className="w-full min-h-[170px] p-4 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-sky-500/50 leading-relaxed resize-y select-text"
                    id="clipboard-textarea"
                  />
                </div>
              )}

              {/* Format Example Collapsible Box */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                    Padrão de Delimitação Reconhecido
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPastedText(STANDARD_FORMAT_EXAMPLE);
                      setActiveTab("paste");
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer bg-sky-500/10 px-2 py-1 rounded-md border border-sky-500/20"
                  >
                    <span>Carregar exemplo no editor</span>
                  </button>
                </div>
                <pre className="text-[10px] text-slate-350 font-mono bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto leading-relaxed border border-white/5 max-h-28">
                  {STANDARD_FORMAT_EXAMPLE}
                </pre>
              </div>

              {/* Appending vs Clearing Choice */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5" id="append-mode-setting">
                <input
                  type="checkbox"
                  id="should-clear-previous-checkbox"
                  checked={clearCurrent}
                  onChange={(e) => setClearCurrent(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-white/20 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="should-clear-previous-checkbox" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  Substituir catálogo atual (apagar frases anteriores antes de importar)
                </label>
              </div>

              {/* Process Trigger Button */}
              <button
                type="button"
                onClick={handleStartImport}
                disabled={isProcessing || (activeTab === "upload" ? !file : !pastedText.trim())}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-sky-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                id="start-parsing-btn"
              >
                <span>{isProcessing ? "Lendo e Processando Arquivo..." : "Processar e Visualizar Fraseologias"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: DYNAMIC PREVIEW & CONFIRMATION */}
          {importedPreview && (
            <div className="space-y-4" id="import-preview-step">
              <div className="flex justify-between items-center bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">
                    <strong className="text-emerald-400 font-mono">{importedPreview.length}</strong> fraseologias identificadas no arquivo!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="text-[10px] text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  Carregar Outro Arquivo
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Revise e ajuste os títulos ou categorias antes de confirmar:</span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[11px] text-sky-400 hover:underline font-semibold cursor-pointer"
                >
                  {importedPreview.every((_, idx) => selectedIndices[idx]) ? "Desmarcar Todas" : "Selecionar Todas"}
                </button>
              </div>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1" id="preview-cards-scroller">
                {importedPreview.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border transition ${
                      selectedIndices[idx] 
                        ? "bg-slate-900/50 border-sky-500/20" 
                        : "bg-slate-950/30 border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={!!selectedIndices[idx]}
                        onChange={() => toggleSelectIndex(idx)}
                        className="w-4 h-4 rounded-sm border-white/20 bg-slate-950 text-sky-500 shrink-0 mt-1 cursor-pointer"
                        id={`preview-check-${idx}`}
                      />
                      
                      {/* Editable Form */}
                      <div className="flex-grow space-y-2.5 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Título da Frase</span>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handlePreviewEditChange(idx, "title", e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-hidden focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Categoria</span>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => handlePreviewEditChange(idx, "category", e.target.value)}
                              placeholder="Ex: VPN, N2 / N3..."
                              className="w-full bg-slate-950 border border-white/10 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-hidden focus:border-sky-500"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Corpo da Mensagem</span>
                          <textarea
                            value={item.content}
                            onChange={(e) => handlePreviewEditChange(idx, "content", e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950 border border-white/10 px-2.5 py-1.5 text-xs text-white rounded-lg focus:outline-hidden focus:border-sky-500 select-text font-sans resize-y leading-relaxed"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {item.tags?.map((tag: string, tagIdx: number) => (
                              <span key={tagIdx} className="text-[9px] bg-sky-500/10 text-sky-300 border border-sky-500/20 px-1.5 py-0.5 rounded-md font-mono">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreviewDelete(idx)}
                            className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition cursor-pointer"
                            title="Remover frase da importação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode indicator */}
              <div className="text-[11px] text-slate-400 bg-white/5 py-2 px-3 rounded-lg border border-white/5 flex gap-2 items-center">
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  {clearCurrent 
                    ? "Modo Substituição: As fraseologias antigas do catálogo serão apagadas e substituídas pelas novas." 
                    : "Modo Adição: As fraseologias selecionadas serão anexadas ao seu catálogo existente."}
                </span>
              </div>

              {/* Actions Footer */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="py-2.5 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-bold rounded-xl transition cursor-pointer border border-white/10"
                >
                  Voltar e Escolher Outro
                </button>
                <button
                  type="button"
                  onClick={handleFinishImport}
                  disabled={selectedCount === 0}
                  className="py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 shadow-lg shadow-sky-500/10 disabled:opacity-40"
                  id="finalize-import-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Importação ({selectedCount} frases)</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
