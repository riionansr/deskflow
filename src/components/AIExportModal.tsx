import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Download, 
  FileDown, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Settings,
  HelpCircle
} from "lucide-react";
import { exportWithAI } from "../lib/api";
import { generateExportContent } from "../lib/exportFormatter";
import { Phrase } from "../types";

interface AIExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrases: Phrase[];
}

const AI_EXPORT_STEPS = [
  "Iniciando empacotador de fraseologias...",
  "Estabelecendo conexão segura com o Gemini 3.5 Flash...",
  "Analisando semântica e tópicos das respostas...",
  "Escrevendo hashtags preditivas para o importador inteligente...",
  "Inserindo linhas de marcação para reimportação simplificada...",
  "Estruturando arquivo de saída .txt para compartilhamento..."
];

export default function AIExportModal({ isOpen, onClose, phrases }: AIExportModalProps) {
  const [exportMode, setExportMode] = useState<"plain" | "ai_optimized">("ai_optimized");
  
  // Processing states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [errorWord, setErrorWord] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setErrorWord(null);
    setIsLoading(true);
    setLoadingStepIdx(0);

    const stepInterval = setInterval(() => {
      setLoadingStepIdx((prev) => {
        if (prev < AI_EXPORT_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    try {
      let content = "";
      try {
        content = await exportWithAI(phrases, exportMode);
      } catch (serverErr) {
        // Fallback to client-side formatted export for pure BYOD Vercel mode
        content = generateExportContent(phrases, exportMode === "ai_optimized" ? "formatted" : "plain");
      }
      clearInterval(stepInterval);

      // Trigger download
      const filename = exportMode === "ai_optimized" 
        ? `fraseologias-otimizadas-ia-${new Date().getFullYear()}.txt` 
        : `fraseologias-exportadas-normal.txt`;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.id = "hidden-download-anchor";
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorWord(err.message || "Erro de conexão ao processar exportação no servidor.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrorWord(null);
    setSuccess(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg glass-premium rounded-2xl overflow-hidden border border-indigo-500/15 shadow-2 shadow-indigo-500/10 animate-scale-up my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="ai-export-modal-wrapper"
      >
        <div className="h-1 bg-gradient-to-r from-teal-400 to-indigo-500 w-full shrink-0" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-slate-900/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">Exportar Biblioteca de Mensagens</h3>
              <p className="text-[11px] text-slate-400">Gere um pacote para compartilhar com novatos ou colegas de equipe</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            id="close-ai-export-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5" id="ai-export-modal-body">
          {errorWord && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/10 mb-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorWord}</div>
            </div>
          )}

          {/* Success Screen */}
          {success ? (
            <div className="py-6 text-center space-y-4 animate-scale-up" id="export-success-screen">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-100 font-display">Exportação Concluída!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  O download do seu arquivo <strong className="text-teal-450">.txt</strong> começou automaticamente. Salve e compartilhe com sua equipe!
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-250 border border-white/10 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Fechar janela
                </button>
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-5" id="ai-export-loader">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-teal-450 animate-spin" />
                <Sparkles className="absolute w-4 h-4 text-violet-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200">Estruturando com Gemini Flash</h4>
                <div className="text-[11px] text-slate-450 italic max-w-xs leading-relaxed">
                  "{AI_EXPORT_STEPS[loadingStepIdx]}"
                </div>
              </div>
            </div>
          ) : (
            /* Configuration State */
            <div className="space-y-5" id="export-config-state">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Total de Fraseologias do Perfil</span>
                  <span className="font-mono text-teal-400 font-bold">{phrases.length} itens</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Mode Selection Cards */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  Selecione o formato de saída
                </label>

                {/* AI Optimized Export Card */}
                <div 
                  onClick={() => setExportMode("ai_optimized")}
                  className={`p-4 rounded-xl border transition cursor-pointer flex gap-3.5 items-start ${
                    exportMode === "ai_optimized"
                      ? "bg-indigo-500/10 border-indigo-400/30 text-white"
                      : "bg-slate-950/25 border-white/5 hover:bg-white/5 text-slate-405"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === "ai_optimized"}
                    onChange={() => setExportMode("ai_optimized")}
                    className="w-4 h-4 text-indigo-500 border-white/10 bg-slate-950 mt-0.5"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 font-display">Otimizado com Gemini Flash (Melhor para reimportar)</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-sm">IA Ativa</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      Utiliza inteligência artificial para classificar cada texto e escrever uma única linha inteligente com <strong>hashtags automatizadas</strong> no rodapé de cada item (ex: <code className="text-teal-300 font-mono">#VPN #Acessos</code>). Isso permite que qualquer colega reimporte no portal e ganhe categorização perfeita imediatamente!
                    </p>
                  </div>
                </div>

                {/* Plain Text Export Card */}
                <div 
                  onClick={() => setExportMode("plain")}
                  className={`p-4 rounded-xl border transition cursor-pointer flex gap-3.5 items-start ${
                    exportMode === "plain"
                      ? "bg-teal-500/5 border-teal-400/30 text-white"
                      : "bg-slate-950/25 border-white/5 hover:bg-white/5 text-slate-405"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === "plain"}
                    onChange={() => setExportMode("plain")}
                    className="w-4 h-4 text-teal-500 border-white/10 bg-slate-950 mt-0.5"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-bold text-slate-100 font-display">Formatado Normal (Documento Simples)</span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      Gera um arquivo de texto (.txt) simplificado, listando os títulos, categorias, tags originais de forma linear seguidos dos corpos de fraseologia e divisores. É excelente para impressão, leitura em bloco ou backups comuns rápidos.
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 bg-white/5 text-slate-350 hover:bg-white/10 text-xs font-bold rounded-xl transition cursor-pointer border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleStartExport}
                  disabled={phrases.length === 0}
                  className="py-2.5 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 shadow-lg shadow-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="final-export-download-btn"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Gerar e Baixar (.txt)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
