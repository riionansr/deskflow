import React, { useState, useRef } from "react";
import { 
  X, 
  Sparkles, 
  FileText, 
  Upload, 
  Clipboard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Info,
  ChevronRight,
  Layers
} from "lucide-react";
import { importWithAI } from "../lib/api";
import { Phrase, CategoryType } from "../types";

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newPhrases: Omit<Phrase, 'id' | 'updatedAt'>[], shouldClearCurrent: boolean) => void;
}

const AI_LOADING_STEPS = [
  "Estabelecendo conexão segura com o cérebro da Inteligência Artificial...",
  "Lendo o arquivo e extraindo conteúdo de texto em bruto...",
  "Analisando padrões linguísticos de suporte corporativo...",
  "Separando as fraseologias e limpando ruídos estruturais...",
  "Gerando títulos curtos e objetivos em português...",
  "Atribuindo as melhores categorias Sabesp de forma inteligente...",
  "Ajustando tags e placeholders internos como [Nome] ou [Senha]...",
  "Finalizando empacotamento e gerando catálogo..."
];

// Helper to normalize and map parsed/hashtag values to certified SABESP categories
function mapCategory(input: string): string {
  const norm = input.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
  
  if (norm.includes("n2n3") || norm.includes("n2") || norm.includes("n3")) return "N2 / N3";
  if (norm.includes("vpn") || norm.includes("anyconnect") || norm.includes("cisco")) return "VPN";
  if (norm.includes("senha") || norm.includes("reset") || norm.includes("password") || norm.includes("recupera")) return "Senha & Reset";
  if (norm.includes("acesso") || norm.includes("rede") || norm.includes("network") || norm.includes("wifi")) return "Acessos & Redes";
  if (norm.includes("impressora") || norm.includes("printer") || norm.includes("toner")) return "Impressoras";
  if (norm.includes("software") || norm.includes("app") || norm.includes("office") || norm.includes("teams")) return "Software";
  if (norm.includes("terceiro") || norm.includes("outsourcing") || norm.includes("externo")) return "Terceiros";
  if (norm.includes("tentativa") || norm.includes("pendente") || norm.includes("follow") || norm.includes("aguarda")) return "Tentativas & Pendente";
  
  // Direct matches
  if (input === "N2 / N3") return "N2 / N3";
  if (input === "VPN") return "VPN";
  if (input === "Senha & Reset") return "Senha & Reset";
  if (input === "Acessos & Redes") return "Acessos & Redes";
  if (input === "Impressoras") return "Impressoras";
  if (input === "Software") return "Software";
  if (input === "Terceiros") return "Terceiros";
  if (input === "Tentativas & Pendente") return "Tentativas & Pendente";
  
  return "Outros";
}

// Highly robust offline parsing routine for DeskFlow exported text files, JSON arrays, and Markdown
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
          category: mapCategory(item.category || item.categoria || 'Outros'),
          content: item.content || item.texto || item.frase || '',
          tags: Array.isArray(item.tags) ? item.tags : []
        })).filter(p => p.content.trim().length > 0);

        if (jsonResults.length > 0) return jsonResults;
      }
    } catch {
      // Proceed to delimiter/text parsing
    }
  }

  const blocks = text.split(/--------------------------------------------------+/);
  const result: any[] = [];
  
  blocks.forEach(block => {
    const trimmed = block.trim();
    if (!trimmed) return;
    
    const lines = trimmed.split('\n');
    let title = '';
    let subtitle = '';
    let category = 'Outros';
    let tags: string[] = [];
    const contentLines: string[] = [];
    
    let titleSet = false;
    let subtitleSet = false;
    let categorySet = false;
    let tagsSet = false;
    
    lines.forEach((line, index) => {
      const lineTrim = line.trim();
      if (!lineTrim) return;
      
      // Match explicit "=== TÍTULO: text ===" or "=== TITULO: text ==="
      const titleMatch = lineTrim.match(/^===\s*(?:TÍTULO|TITULO):\s*(.*?)\s*===/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
        titleSet = true;
        return;
      }
      
      // Explicit Subtitle
      if (lineTrim.toLowerCase().startsWith('subtítulo:') || lineTrim.toLowerCase().startsWith('subtitulo:')) {
        subtitle = lineTrim.substring(lineTrim.indexOf(':') + 1).trim();
        subtitleSet = true;
        return;
      }
      
      // Explicit Category
      if (lineTrim.toLowerCase().startsWith('categoria:') || lineTrim.toLowerCase().startsWith('category:')) {
        const catVal = lineTrim.substring(lineTrim.indexOf(':') + 1).trim();
        category = mapCategory(catVal);
        categorySet = true;
        return;
      }
      
      // Explicit Tags
      if (lineTrim.toLowerCase().startsWith('tags:')) {
        const tagsVal = lineTrim.substring(lineTrim.indexOf(':') + 1).trim();
        tags = tagsVal.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
        tagsSet = true;
        return;
      }
      
      // If it looks like a footer hashtag line (e.g., #VPN #Acessos #Senha)
      const isHashtagLine = lineTrim.startsWith('#') && !lineTrim.includes(':') && 
                            (lineTrim.includes(' #') || lineTrim.split(/\s+/).every(w => w.startsWith('#')));
      if (isHashtagLine) {
        const hashes = lineTrim.split(/\s+/).map(h => h.trim().replace(/^#/, '')).filter(Boolean);
        if (hashes.length > 0) {
          if (!categorySet) {
            category = mapCategory(hashes[0]);
            categorySet = true;
            tags = [...tags, ...hashes.slice(1)];
          } else {
            tags = [...tags, ...hashes];
          }
          tagsSet = true;
          return;
        }
      }
      
      // If none matched and we haven't set the title yet, treat the static first line as Title
      if (index === 0 || (!titleSet && contentLines.length === 0)) {
        title = lineTrim.replace(/^===|===$/g, '').trim();
        titleSet = true;
        return;
      }
      
      // Gather body content
      contentLines.push(line);
    });
    
    if (!title) {
      title = 'Sem Título';
    }
    
    const content = contentLines.join('\n').trim();
    if (!content) return;
    
    result.push({
      title,
      subtitle: subtitle || undefined,
      category,
      content,
      tags: Array.from(new Set(tags))
    });
  });
  
  return result;
}

export default function AIImportModal({ isOpen, onClose, onImportComplete }: AIImportModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [importMethod, setImportMethod] = useState<"ai" | "direct">("direct");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  
  // Processing States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [errorWord, setErrorWord] = useState<string | null>(null);
  
  // Custom interactive preview step
  const [importedPreview, setImportedPreview] = useState<any[] | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});
  const [clearCurrent, setClearCurrent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const cycleLoadingSteps = (intervalId: any) => {
    setLoadingStepIdx((prev) => {
      if (prev < AI_LOADING_STEPS.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

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
      if (selectedFile.size > 2 * 1024 * 1024) {
        setErrorWord("O arquivo excede o limite de tamanho de segurança de 2MB. Selecione um arquivo menor.");
        return;
      }
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      if (ext === ".txt" || ext === ".json" || ext === ".md" || ext === ".docx") {
        setFile(selectedFile);
        setErrorWord(null);
      } else {
        setErrorWord("Tipo de arquivo inválido. Por favor, envie arquivos .txt, .json, .md ou .docx");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        setErrorWord("O arquivo excede o limite de tamanho de segurança de 2MB. Selecione um arquivo menor.");
        return;
      }
      setFile(selectedFile);
      setErrorWord(null);
    }
  };

  const processFileBase64 = (selectedFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const resultString = reader.result as string;
        // Strip data:image/png;base64,... part
        const base64 = resultString.substring(resultString.indexOf(",") + 1);
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleStartImport = async () => {
    setErrorWord(null);
    setIsLoading(true);
    setLoadingStepIdx(0);

    const stepInterval = setInterval(() => {
      cycleLoadingSteps(stepInterval);
    }, 2500);

    try {
      let base64Content = "";
      let nameOfFile = "clipboard-text.txt";
      let rawText = "";

      if (activeTab === "upload") {
        if (!file) {
          setErrorWord("Por favor, selecione um arquivo primeiro.");
          clearInterval(stepInterval);
          setIsLoading(false);
          return;
        }
        
        if (importMethod === "direct") {
          rawText = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Erro ao ler o arquivo fornecido."));
            reader.readAsText(file);
          });
        } else {
          base64Content = await processFileBase64(file);
          nameOfFile = file.name;
        }
      } else {
        if (!pastedText.trim()) {
          setErrorWord("O texto copiado está vazio. Por favor, cole suas fraseologias na área indicada.");
          clearInterval(stepInterval);
          setIsLoading(false);
          return;
        }
        
        if (pastedText.length > 2 * 1024 * 1024) {
          setErrorWord("O texto inserido excede o limite de tamanho de segurança de 2MB. Por favor, reduza o corpo do texto.");
          clearInterval(stepInterval);
          setIsLoading(false);
          return;
        }
        
        if (importMethod === "direct") {
          rawText = pastedText;
        } else {
          base64Content = btoa(unescape(encodeURIComponent(pastedText)));
          nameOfFile = "paste_clipboard.txt";
        }
      }

      if (importMethod === "direct") {
        clearInterval(stepInterval);
        const extracted = parseDirectText(rawText);
        if (extracted && extracted.length > 0) {
          // brief visual pause for professional, smooth animation flow transitions
          await new Promise(r => setTimeout(r, 600));
          setImportedPreview(extracted);
          const selectionInitial: Record<number, boolean> = {};
          extracted.forEach((_, idx) => {
            selectionInitial[idx] = true;
          });
          setSelectedIndices(selectionInitial);
          setIsLoading(false);
        } else {
          setErrorWord("Não identificamos fraseologias estruturadas válidas. Certifique-se de usar o padrão com tracejados longos (---------) e marcações corretas.");
          setIsLoading(false);
        }
        return;
      }

      const extracted = await importWithAI(base64Content, nameOfFile);
      clearInterval(stepInterval);

      if (extracted && extracted.length > 0) {
        setImportedPreview(extracted);
        // Select all by default
        const selectionInitial: Record<number, boolean> = {};
        extracted.forEach((_, idx) => {
          selectionInitial[idx] = true;
        });
        setSelectedIndices(selectionInitial);
        setIsLoading(false);
      } else {
        setErrorWord("Nenhuma fraseologia válida pôde ser identificada pela IA no arquivo de entrada. Verifique o arquivo e tente novamente.");
        setIsLoading(false);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorWord(err.message || "Não foi possível processar a importação de textos.");
      setIsLoading(false);
    }
  };

  const handleFinishImport = () => {
    if (!importedPreview) return;
    const finalSelection = importedPreview.filter((_, idx) => selectedIndices[idx]);
    if (finalSelection.length === 0) {
      setErrorWord("Selecione ao menos um item da prévia para importar.");
      return;
    }

    onImportComplete(finalSelection, clearCurrent);
    handleResetModal();
    onClose();
  };

  const handleResetModal = () => {
    setFile(null);
    setPastedText("");
    setErrorWord(null);
    setIsLoading(false);
    setImportedPreview(null);
    setSelectedIndices({});
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePreviewDelete = (idxToDelete: number) => {
    if (!importedPreview) return;
    const filtered = importedPreview.filter((_, idx) => idx !== idxToDelete);
    setImportedPreview(filtered.length > 0 ? filtered : null);
    
    // adjust selections list
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl glass-premium rounded-2xl overflow-hidden border border-indigo-500/15 shadow-2 shadow-indigo-500/10 animate-scale-up my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="ai-import-modal-wrapper"
      >
        <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-600 w-full shrink-0" />

        {/* Header Block */}
        <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-slate-900/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">Assistente de Importação Inteligente (IA)</h3>
              <p className="text-[11px] text-slate-400">Analise lotes de respostas, emails e notas utilizando inteligência artificial</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            id="close-ai-import-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body Scrollable Area */}
        <div className="flex-grow overflow-y-auto p-6" id="ai-import-modal-body">
          {errorWord && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/10 mb-4 animate-shake" id="import-error-banner">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorWord}</div>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-6" id="ai-import-loader">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-14 h-14 text-indigo-400 animate-spin" />
                <Sparkles className="absolute w-5 h-5 text-violet-400 animate-ping" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h4 className="text-sm font-bold text-slate-105 font-display flex items-center justify-center gap-1.5">
                  Processando Lote com IA
                </h4>
                <p className="text-[11px] text-indigo-350 bg-indigo-500/10 border border-indigo-500/10 px-2 py-1 rounded-md font-mono animate-pulse inline-block">
                  Aguardando resposta do Gemini 3.5 Flash...
                </p>
                <div className="pt-2 text-xs text-slate-350 min-h-[40px] italic leading-relaxed font-sans">
                  "{AI_LOADING_STEPS[loadingStepIdx]}"
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE CONFIGURATION TAB STEP (BEFORE IA RESPONSE) */}
          {!isLoading && !importedPreview && (
            <div className="space-y-5" id="ai-setup-step">
              
              {/* Import Method Selection Panel */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  Método de Importação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setImportMethod("direct")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      importMethod === "direct"
                        ? "bg-sky-500/10 border-sky-400/35 text-white shadow-xs"
                        : "bg-slate-950/20 border-white/5 hover:bg-white/5 text-slate-400"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${importMethod === "direct" ? "bg-sky-500/20 text-sky-400" : "bg-white/5 text-slate-400"}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[11px] font-bold leading-tight font-display text-slate-250">Sem IA (Direto Local)</p>
                      <p className="text-[9px] text-slate-450 font-sans truncate">Processa arquivos copiados instantaneamente</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setImportMethod("ai")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      importMethod === "ai"
                        ? "bg-indigo-500/10 border-indigo-400/35 text-white shadow-xs"
                        : "bg-slate-950/20 border-white/5 hover:bg-white/5 text-slate-400"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${importMethod === "ai" ? "bg-indigo-500/20 text-indigo-405 animate-pulse" : "bg-white/5 text-slate-400"}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[11px] font-bold leading-tight font-display text-slate-250">Com IA Inteligente</p>
                      <p className="text-[9px] text-slate-450 font-sans truncate">Interpreta textos livres com Gemini 3.5</p>
                    </div>
                  </div>
                </div>
              </div>

              {importMethod === "direct" ? (
                <div className="flex items-start gap-3 p-3 bg-sky-500/5 rounded-xl border border-sky-500/10 text-xs text-slate-350 font-sans animate-fade-in">
                  <Info className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Importação ultrarrápida local:</strong> Ideal para carregar backups ou arquivos de equipe contendo as categorias e tags em formato de marcadores ou hashtag (gerados pelo nosso assistente de exportação). Não consome limites de IA.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-slate-350 font-sans animate-fade-in">
                  <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Importação Inteligente assistida:</strong> Ideal para carregar e-mails brutos, conversas de chat ou anotações informais. A Inteligência Artificial irá separar e estruturar as fraseologias automaticamente para você revisá-las.
                  </p>
                </div>
              )}

              {/* Toggle Tabs */}
              <div className="flex border-b border-white/5" id="tabs-container">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "upload"
                      ? "border-indigo-455 text-indigo-400 bg-white/2"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload de Arquivo (.txt / .docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "paste"
                      ? "border-indigo-455 text-indigo-400 bg-white/2"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Colar Texto Diretamente</span>
                </button>
              </div>

              {/* TABS CONTENT */}
              {activeTab === "upload" ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center gap-3 min-h-[180px] cursor-pointer ${
                    dragOver
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-white/10 hover:border-white/20 bg-slate-950/20 text-slate-400"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  id="drag-drop-area"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.docx"
                    className="hidden"
                  />
                  <FileText className={`w-10 h-10 ${file ? "text-indigo-400 animate-bounce" : "text-slate-550"}`} />
                  {file ? (
                    <div id="selected-file-details">
                      <p className="text-xs font-bold text-slate-200">{file.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        {(file.size / 1024).toFixed(1)} KB — Pronto para análise via IA
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Arraste e solte seu arquivo aqui, ou <span className="text-indigo-400 underline">clique para procurar</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Suporta formatos .txt (texto simples) e .docx (Microsoft Word)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5" id="direct-paste-container">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                    Copie e cole abaixo todas as fraseologias (pode colar emails inteiros ou relatórios)
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Cole aqui seu conteúdo de suporte... 

Exemplo:
Oi obrigado pelo contato. Para resetar a senha, acesse o link sabesp.com.br/senha e use a chave padrão...

VPN Sabesp:
Para conectar na vpn Sabesp use o software Cisco AnyConnect..."
                    className="w-full min-h-[180px] p-4 rounded-xl bg-slate-950/65 border border-white/10 text-white text-xs font-sans placeholder:text-slate-600 focus:outline-hidden leading-relaxed resize-y select-text"
                    id="clipboard-textarea"
                  />
                </div>
              )}

              {/* Appending vs Claring Choice */}
              <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5" id="append-mode-setting">
                <input
                  type="checkbox"
                  id="should-clear-previous-checkbox"
                  checked={clearCurrent}
                  onChange={(e) => setClearCurrent(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-white/20 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="should-clear-previous-checkbox" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  Apagar fraseologias atuais anteriores e <strong className="text-red-400">substituir completamente</strong> por estas novas
                </label>
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handleStartImport}
                disabled={activeTab === "upload" ? !file : !pastedText.trim()}
                className={`w-full py-3 text-white rounded-xl text-xs font-bold transition active:scale-98 cursor-pointer flex justify-center items-center gap-2 shadow-lg ${
                  importMethod === "direct"
                    ? "bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 shadow-sky-500/10"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-indigo-500/10"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                id="start-ai-parsing-btn"
              >
                {importMethod === "direct" ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Processar e Carregar Textos Localmente</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analisar e Extrair com Inteligência Artificial</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* DYNAMIC INTERACTIVE EDITABLE PREVIEW STEP */}
          {!isLoading && importedPreview && (
            <div className="space-y-4" id="import-preview-step">
              <div className="flex justify-between items-center bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/15">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">
                    IA extraiu <strong className="text-emerald-400 font-mono">{importedPreview.length}</strong> fraseologias com sucesso!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="text-[10px] text-indigo-400 hover:underline font-bold"
                >
                  Recomeçar Importação
                </button>
              </div>

              <p className="text-[11px] text-slate-450 leading-relaxed">
                Revise os textos propostos pelo assistente. Você pode habilitar/desabilitar cada item, alterar seu conteúdo, revisar os títulos gerados e categorizar livremente antes de finalizar a inclusão no seu portal.
              </p>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1" id="preview-cards-scroller">
                {importedPreview.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border transition ${
                      selectedIndices[idx] 
                        ? "bg-slate-900/30 border-white/10" 
                        : "bg-slate-950/20 border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection check */}
                      <input
                        type="checkbox"
                        checked={!!selectedIndices[idx]}
                        onChange={() => toggleSelectIndex(idx)}
                        className="w-4 h-4 rounded-sm border-white/20 bg-slate-950 text-indigo-500 shrink-0 mt-1 cursor-pointer"
                        id={`preview-check-${idx}`}
                      />
                      
                      {/* Interactive Edit Body */}
                      <div className="flex-grow space-y-3 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Título</span>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handlePreviewEditChange(idx, "title", e.target.value)}
                              className="w-full bg-slate-950 border border-white/5 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Categoria Associada</span>
                            <select
                              value={item.category}
                              onChange={(e) => handlePreviewEditChange(idx, "category", e.target.value)}
                              className="w-full bg-slate-950 border border-white/5 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-hidden"
                            >
                              <option value="N2 / N3">N2 / N3</option>
                              <option value="VPN">VPN</option>
                              <option value="Senha & Reset">Senha & Reset</option>
                              <option value="Acessos & Redes">Acessos & Redes</option>
                              <option value="Impressoras">Impressoras</option>
                              <option value="Software">Software</option>
                              <option value="Terceiros">Terceiros</option>
                              <option value="Tentativas & Pendente">Tentativas & Pendente</option>
                              <option value="Outros">Outros</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Subtítulo Contexto</span>
                          <input
                            type="text"
                            value={item.subtitle || ""}
                            onChange={(e) => handlePreviewEditChange(idx, "subtitle", e.target.value)}
                            className="w-full bg-slate-950 border border-white/5 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Corpo da Fraseologia</span>
                          <textarea
                            value={item.content}
                            onChange={(e) => handlePreviewEditChange(idx, "content", e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950 border border-white/5 px-2.5 py-1.5 text-xs text-white rounded-lg focus:outline-hidden select-text font-sans resize-y leading-relaxed"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                          <div className="flex items-center gap-1">
                            {item.tags?.map((tag: string, tagIdx: number) => (
                              <span key={tagIdx} className="text-[9px] bg-indigo-500/10 text-indigo-350 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-mono">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreviewDelete(idx)}
                            className="text-stone-400 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition cursor-pointer"
                            title="Remover frase de rascunho de importação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Option Summary line */}
              <div className="text-[11px] text-slate-405 italic bg-white/2 py-2 px-3 rounded-lg border border-white/5 flex gap-2 items-center">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {clearCurrent 
                    ? "Inclusão no perfil: As fraseologias atuais associadas ao seu login serão substituídas pelas novas selecionadas." 
                    : "Inclusão no perfil: As fraseologias selecionadas acima serão adicionadas juntamente com as suas já existentes."}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="py-2.5 bg-white/5 text-slate-350 hover:bg-white/10 text-xs font-bold rounded-xl transition cursor-pointer border border-white/10"
                >
                  Cancelar e Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinishImport}
                  className="py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 shadow-lg shadow-sky-500/10"
                  id="finalize-ai-import-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalizar Importação ({Object.values(selectedIndices).filter(Boolean).length})</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
