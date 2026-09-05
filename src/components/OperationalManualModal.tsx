import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  BookOpen,
  Search,
  Copy,
  Check,
  Sparkles,
  Cloud,
  Key,
  Layers,
  HelpCircle,
  HardDrive,
  FolderPlus,
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { generateOperationalManualPDF } from '../utils/pdfGenerator';

interface OperationalManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperationalManualModal: React.FC<OperationalManualModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'features' | 'import_ai' | 'sync' | 'faq'>('overview');
  const [copiedSample, setCopiedSample] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleCopySample = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSample(id);
    setTimeout(() => setCopiedSample(null), 2000);
  };

  const handleDownloadPDF = () => {
    generateOperationalManualPDF();
  };

  const handlePrintManual = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl glass-card rounded-2xl overflow-hidden border border-sky-500/20 shadow-2xl my-4 flex flex-col max-h-[92vh] bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
                  Manual Operacional do Usuário
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  PDF Operacional
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Guia prático de utilização, atalhos, fluxo de suporte e exportação em PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
              title="Gerar e Baixar PDF Operacional"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>

            <button
              onClick={handlePrintManual}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Imprimir Manual"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/60 p-2 gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>2. Fluxo de Atendimento</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'features'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>3. Recursos &amp; Tags</span>
          </button>

          <button
            onClick={() => setActiveTab('import_ai')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'import_ai'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>4. Importação &amp; IA</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'sync'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>5. Nuvem &amp; Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>6. Perguntas Frequentes</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* Top Banner inside Modal */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/25 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Documentação Operacional Oficial — DeskFlow BYOD</span>
              </div>
              <p className="text-slate-300 text-xs">
                Aprenda a otimizar chamados de Service Desk, copiar frases com assinatura automática e sincronizar seu catálogo.
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Gerar PDF Completo</span>
            </button>
          </div>

          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fadeIn">
              <h4 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                O que é o DeskFlow?
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <h5 className="font-bold text-sky-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <HardDrive className="w-3.5 h-3.5" />
                    Modelo BYOD (Bring Your Own Data)
                  </h5>
                  <p className="text-slate-400 text-xs">
                    Todos os seus modelos de fraseologia, assinaturas e categorias ficam gravados com 100% de privacidade no armazenamento local do seu próprio navegador (LocalStorage/IndexedDB).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <h5 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Agilidade no Service Desk
                  </h5>
                  <p className="text-slate-400 text-xs">
                    Projetado para eliminar retrabalho na digitação de scripts repetitivos de suporte N1/N2/N3, garantindo padrão de qualidade corporativo.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Principais Pilares da Ferramenta:
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                    <span><strong>Assinatura Automática:</strong> Anexa automaticamente sua assinatura pessoal corporativa ao copiar qualquer mensagem.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                    <span><strong>Filtro por Hashtags e Categorias:</strong> Encontre instantaneamente qualquer resposta pesquisando por #VPN, #365, #Senha ou #Rede.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                    <span><strong>Fixação de Frases (Pin):</strong> Deixe os scripts mais recorrentes no topo da página.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span><strong>Importação por IA (Gemini BYOK):</strong> Limpe conversas ou chamados e converta em fraseologias perfeitas utilizando inteligência artificial.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span><strong>Sincronização em Nuvem:</strong> Faça backup ou compartilhe no Google Drive e GitHub Gist em segundos.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: FLUXO DE ATENDIMENTO */}
          {activeTab === 'workflow' && (
            <div className="space-y-5 animate-fadeIn">
              <h4 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-sky-400" />
                Passo a Passo do Workflow de Suporte
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 font-bold font-mono text-xs shrink-0">
                    01
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Localizar a Fraseologia</h5>
                    <p className="text-slate-400 text-xs">
                      Digite o termo na barra de pesquisa (ex: "VPN", "Redefinição de senha") ou clique nas tags de hashtag frequentemente usadas como #VPN, #365 ou #Reset.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 font-bold font-mono text-xs shrink-0">
                    02
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Ajustar Variáveis (se houver)</h5>
                    <p className="text-slate-400 text-xs">
                      Se o script contiver campos como <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">[Nome]</code>, <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">[Protocolo]</code> ou <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">[Link]</code>, você pode clicar em "Editar" para preenchê-los previamente ou ajustar diretamente no sistema de chamados.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs shrink-0">
                    03
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Clique em "COPIAR"</h5>
                    <p className="text-slate-400 text-xs">
                      Pressione o botão azul "COPIAR". O texto da mensagem + sua assinatura configurada serão gravados instantaneamente na área de transferência.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 font-bold font-mono text-xs shrink-0">
                    04
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-100 text-xs sm:text-sm">Cole no Ticket ou Chat</h5>
                    <p className="text-slate-400 text-xs">
                      Use <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[10px] font-mono">Ctrl + V</kbd> no seu ITSM/Service Desk ou Teams para enviar a mensagem formatada para o cliente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-300 flex items-center justify-between">
                <span>Quer testar o botão de cópia rápida agora?</span>
                <button
                  onClick={() => handleCopySample('Prezado(a),\n\nProcedimento realizado com sucesso.\n\nAtenciosamente,\nCentral de Suporte de TI', 'sample1')}
                  className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSample === 'sample1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSample === 'sample1' ? 'Copiado!' : 'Testar Copiar Frase'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RECURSOS & TAGS */}
          {activeTab === 'features' && (
            <div className="space-y-5 animate-fadeIn">
              <h4 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-sky-400" />
                Organização por Categorias &amp; Hashtags
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    Gerenciador de Categorias
                  </h5>
                  <p className="text-slate-400 text-xs">
                    No menu "Armazenamento &amp; Sync" &gt; aba "Categorias", você pode adicionar novas categorias (ex: N1, N2, N3, Telefonia, Impressoras), reordená-las ou renomeá-las conforme o perfil do seu setor.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    Assinatura do Analista
                  </h5>
                  <p className="text-slate-400 text-xs">
                    Em "Armazenamento &amp; Sync" &gt; aba "Assinatura", personalize como sua fraseologia deve ser assinada. Exemplo:
                  </p>
                  <pre className="p-3 bg-slate-900 border border-white/10 rounded-lg text-xs font-mono text-slate-300">
                    {`Atenciosamente,
Serviço de Atendimento de Tecnologia da Informação
Central de Atendimento e Suporte de TI`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPORTAÇÃO E IA */}
          {activeTab === 'import_ai' && (
            <div className="space-y-5 animate-fadeIn">
              <h4 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Importação em Lote &amp; Inteligência Artificial (Gemini BYOK)
              </h4>

              <p className="text-slate-300 text-xs">
                O DeskFlow permite cadastrar dezenas de fraseologias de uma só vez utilizando importação simples por arquivo TXT/JSON ou assistida por IA.
              </p>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <h5 className="font-bold text-purple-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Como usar a Inteligência Artificial (BYOK - Bring Your Own Key):
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Obtenha uma chave API gratuita no Google AI Studio (a chave é 100% sua).</li>
                  <li>Acesse o menu <strong>Armazenamento &amp; Sync &gt; Chave Gemini (BYOK)</strong> e salve sua chave.</li>
                  <li>Clique em <strong>Importar</strong> na barra superior e cole conversas brutas de chamados.</li>
                  <li>A IA vai analisar o texto, remover nomes sensíveis, definir título, hashtags e categoria automaticamente!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: NUVEM E BACKUP */}
          {activeTab === 'sync' && (
            <div className="space-y-5 animate-fadeIn">
              <h4 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                Sincronização em Nuvem &amp; Backup
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-2">
                  <h5 className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5" />
                    Google Drive Sync
                  </h5>
                  <p className="text-slate-400 text-xs">
                    Conecte sua conta do Google Drive para realizar backups periódicos do seu banco de frases na nuvem. Você pode restaurar em outro computador a qualquer momento.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-2">
                  <h5 className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Exportar JSON / TXT
                  </h5>
                  <p className="text-slate-400 text-xs">
                    No menu "Exportar", faça o download do seu catálogo em formato JSON (compatível com o DeskFlow) ou TXT formatado para compartilhamento rápido.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQ / DÚVIDAS */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                Perguntas Frequentes &amp; Resolução de Problemas
              </h4>

              <div className="space-y-3">
                <details className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-200 group-hover:text-sky-300 transition">
                    Minhas frases somem se eu fechar o navegador?
                  </summary>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Não. Todas as frases e alterações ficam salvas permanentemente no armazenamento local (LocalStorage) do seu navegador. Para garantir backup contra limpeza de cache, recomendamos fazer exportação em JSON ou conectar com o Google Drive.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-200 group-hover:text-sky-300 transition">
                    Como posso compartilhar minhas frases com um colega de trabalho?
                  </summary>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Clique no menu "Exportar", baixe o arquivo em formato JSON e envie para o seu colega. Ele só precisará clicar em "Importar" no DeskFlow dele e selecionar o arquivo JSON recebido.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-200 group-hover:text-sky-300 transition">
                    A chave do Gemini fica segura?
                  </summary>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Sim! Sua chave do Gemini nunca é enviada para nenhum servidor do DeskFlow. Ela permanece estritamente guardada no seu próprio navegador e é enviada diretamente do seu computador para os servidores oficiais da Google API.
                  </p>
                </details>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Documentação Técnica &amp; Manual Operacional do Usuário</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Baixar PDF do Manual</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
