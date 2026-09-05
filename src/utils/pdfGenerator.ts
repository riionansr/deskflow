import jsPDF from 'jspdf';

export function generateOperationalManualPDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180

  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = margin + 10;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Top bar background on page 2+
      if (i > 1) {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(56, 189, 248); // sky-400
        doc.text('DESKFLOW - MANUAL OPERACIONAL DO USUÁRIO', margin, 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('Suporte & Fraseologias Corporativas', pageWidth - margin, 8, { align: 'right' });
      }

      // Bottom footer on all pages
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('DeskFlow Community • Guia Prático de Operação', margin, pageHeight - 7);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }
  };

  // -------------------------------------------------------------
  // PAGE 1: COVER & HEADER
  // -------------------------------------------------------------

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // Slate-900 dark background
  doc.rect(0, 0, pageWidth, 48, 'F');

  // Decorative Accent Line
  doc.setFillColor(56, 189, 248); // Sky-400
  doc.rect(0, 47, pageWidth, 1.5, 'F');

  // Badge Top
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, 10, 52, 6, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(56, 189, 248);
  doc.text('MANUAL OPERACIONAL v1.0', margin + 3, 14);

  // Document Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('DeskFlow — Guia do Usuário', margin, 26);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('Plataforma Ágil de Fraseologias, Padronização e Produtividade para Suporte de TI', margin, 33);

  // Metadata pills
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Data de Atualização: Agosto/2026   |   Modo: BYOD (Bring Your Own Data)   |   Versão: 1.0.0', margin, 41);

  currentY = 56;

  // -------------------------------------------------------------
  // SECTION 1: VISÃO GERAL
  // -------------------------------------------------------------

  const drawSectionHeader = (title: string, iconNumber: string) => {
    checkPageBreak(18);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, currentY, contentWidth, 9, 1.5, 1.5, 'F');

    doc.setFillColor(2, 132, 199); // sky-600
    doc.roundedRect(margin + 1, currentY + 1, 7, 7, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(iconNumber, margin + 4.5, currentY + 5.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title, margin + 11, currentY + 6.2);

    currentY += 13;
  };

  drawSectionHeader('1. Visão Geral e Arquitetura da Ferramenta', '1');

  // Intro paragraph box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700
  const introText = 'O DeskFlow é um catálogo operacional de frases e scripts de suporte de TI desenvolvido para agilizar o atendimento de N1, N2 e N3. Operando no modo BYOD (Bring Your Own Data), os dados ficam armazenados localmente no seu próprio navegador (LocalStorage/IndexedDB). O usuário possui total autonomia sobre seus dados, podendo sincronizá-los ou fazer backups via Google Drive, GitHub ou exportação em arquivos JSON/TXT.';
  const splitIntro = doc.splitTextToSize(introText, contentWidth - 8);
  doc.text(splitIntro, margin + 4, currentY + 6);

  currentY += 28;

  // -------------------------------------------------------------
  // SECTION 2: PRINCIPAIS RECURSOS OPERACIONAIS
  // -------------------------------------------------------------

  drawSectionHeader('2. Recursos Principais e Destaques Operacionais', '2');

  const features = [
    {
      title: 'Busca Inteligente & Hashtags',
      desc: 'Pesquise por termos, palavras do texto ou hashtags específicas (ex: #VPN, #365, #Senha). Os resultados são filtrados em tempo real.',
    },
    {
      title: 'Cópia em 1 Clique com Assinatura Automática',
      desc: 'Ao clicar em "Copiar", o texto da fraseologia é copiado imediatamente para a área de transferência com sua assinatura personalizada anexada ao final.',
    },
    {
      title: 'Fixação de Frases (Pin/Favoritos)',
      desc: 'Fixe as fraseologias mais utilizadas no topo do catálogo clicando no ícone de tarracha/pin para acesso ultra rápido.',
    },
    {
      title: 'Gestão de Categorias e Ordenação',
      desc: 'Organize suas frases em categorias personalizadas. Reordene, crie ou exclua categorias conforme a rotina da sua equipe.',
    },
  ];

  features.forEach((feat) => {
    checkPageBreak(16);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'D');

    // Bullet indicator
    doc.setFillColor(14, 165, 233); // sky-500
    doc.circle(margin + 4, currentY + 4.5, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(feat.title, margin + 8, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitF = doc.splitTextToSize(feat.desc, contentWidth - 12);
    doc.text(splitF, margin + 8, currentY + 10);

    currentY += 17;
  });

  currentY += 2;

  // -------------------------------------------------------------
  // SECTION 3: PASSO A PASSO DE ATENDIMENTO (WORKFLOW)
  // -------------------------------------------------------------

  drawSectionHeader('3. Passo a Passo do Workflow de Atendimento', '3');

  const steps = [
    {
      step: 'Etapa 1',
      title: 'Localizar a Fraseologia Desejada',
      desc: 'Utilize a barra de pesquisa superior digitando a palavra-chave ou clique nas tags de hashtags frequentes (#VPN, #Senha, #Impressora).',
    },
    {
      step: 'Etapa 2',
      title: 'Ajustar Variáveis/Placeholders (se houver)',
      desc: 'Caso a frase possua campos entre colchetes como [Nome], [Protocolo] ou [Link], edite rapidamente se necessário ou substitua no chamado.',
    },
    {
      step: 'Etapa 3',
      title: 'Copiar e Colar no Chamado / Chat',
      desc: 'Clique no botão azul "COPIAR". O sistema exibirá a notificação de confirmação e a mensagem estará pronta para ser colada no Service Desk ou chat.',
    },
    {
      step: 'Etapa 4',
      title: 'Criar / Editar Novas Frases',
      desc: 'Para adicionar novos padrões da sua equipe, clique em "+ Nova Frase", defina o título, categoria, tags e o conteúdo padronizado.',
    },
  ];

  steps.forEach((s) => {
    checkPageBreak(18);
    // Left step pill
    doc.setFillColor(224, 242, 254); // sky-100
    doc.roundedRect(margin, currentY, 20, 14, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(3, 105, 161); // sky-700
    doc.text(s.step, margin + 10, currentY + 8.5, { align: 'center' });

    // Step content box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 22, currentY, contentWidth - 22, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(s.title, margin + 25, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitS = doc.splitTextToSize(s.desc, contentWidth - 28);
    doc.text(splitS, margin + 25, currentY + 9.5);

    currentY += 17;
  });

  currentY += 2;

  // -------------------------------------------------------------
  // SECTION 4: ASSINATURA, IMPORTAÇÃO E NUVEM
  // -------------------------------------------------------------

  drawSectionHeader('4. Assinatura, Importação de Frases e Nuvem (Google Drive / GitHub)', '4');

  const advancedBoxes = [
    {
      label: 'Configurar Assinatura Pessoal',
      text: 'Acesse "Armazenamento & Sync" > guia "Assinatura". Defina seu nome, cargo, telefone de suporte ou central. Esta assinatura será anexada automaticamente em todas as frases copiadas.',
    },
    {
      label: 'Importação em Lote de Fraseologias (.txt / .json)',
      text: 'No menu "Importar", você pode carregar arquivos de texto (.txt, .json) ou colar blocos separados por linhas tracejadas. O sistema identifica automaticamente títulos, categorias e hashtags com revisão antes de salvar.',
    },
    {
      label: 'Sincronização em Nuvem & Backup',
      text: 'Conecte sua conta do Google Drive ou repositório/Gist do GitHub no menu de Armazenamento. Seus dados podem ser restaurados ou compartilhados com seus colegas em qualquer computador.',
    },
  ];

  advancedBoxes.forEach((adv) => {
    checkPageBreak(18);
    doc.setFillColor(245, 243, 255); // purple-50
    doc.setDrawColor(221, 214, 254); // purple-200
    doc.roundedRect(margin, currentY, contentWidth, 15, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(109, 40, 217); // purple-700
    doc.text(`• ${adv.label}`, margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitAdv = doc.splitTextToSize(adv.text, contentWidth - 8);
    doc.text(splitAdv, margin + 4, currentY + 10);

    currentY += 18;
  });

  currentY += 2;

  // -------------------------------------------------------------
  // SECTION 5: ATALHOS E DICAS RÁPIDAS
  // -------------------------------------------------------------

  drawSectionHeader('5. Resumo de Atalhos & Boas Práticas', '5');

  // Table header
  checkPageBreak(30);
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Ação Operacional', margin + 4, currentY + 4.8);
  doc.text('Como Executar no DeskFlow', margin + 70, currentY + 4.8);
  doc.text('Resultado Esperado', margin + 130, currentY + 4.8);

  currentY += 7;

  const tableRows = [
    { a: 'Copiar Frase', b: 'Clique em "COPIAR" no card', c: 'Texto + Assinatura na área de transferência' },
    { a: 'Fixar Frase', b: 'Clique no ícone de Tarracha/Pin', c: 'Frase mantida no topo da lista' },
    { a: 'Editar Frase', b: 'Clique no ícone de Lápis', c: 'Abre modal de edição rápida' },
    { a: 'Nova Frase', b: 'Clique em "+ Nova Frase"', c: 'Abre formulário de cadastro' },
    { a: 'Filtro por Tag', b: 'Clique na tag (ex: #VPN)', c: 'Filtra frases daquela tag instantaneamente' },
    { a: 'Backup Local', b: 'Clique em "Exportar" > Download', c: 'Gera arquivo JSON / TXT de segurança' },
  ];

  tableRows.forEach((row, idx) => {
    checkPageBreak(8);
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.a, margin + 4, currentY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(row.b, margin + 70, currentY + 4.8);

    doc.setTextColor(3, 105, 161);
    doc.text(row.c, margin + 130, currentY + 4.8);

    currentY += 7;
  });

  currentY += 8;

  // Final Callout Box
  checkPageBreak(16);
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(187, 247, 208); // green-200
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61); // green-700
  doc.text('✓ Dica Importante de Produtividade:', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('Mantenha suas frases atualizadas e utilize o botão "Exportar" semanalmente para garantir um backup atualizado de todas as fraseologias da sua equipe.', margin + 4, currentY + 10);

  // Apply header and footer to all generated pages
  drawHeaderFooter();

  // Save PDF
  doc.save('DeskFlow_Manual_Operacional_Usuario.pdf');
}
