import { Phrase } from '../types';

export const initialPhrases: Phrase[] = [
  {
    id: 'n2n3-verificacao',
    title: 'N2/N3 - Verificação de Demanda',
    category: 'N2 / N3',
    tags: ['n2', 'n3', 'verificação', 'demanda', 'encaminhar', 'chamado'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezados, solicitamos, por gentileza, a verificação da demanda encaminhada pelo cliente.'
  },
  {
    id: 'n2n3-analise',
    title: 'N2/N3 - Análise de Incidente',
    category: 'N2 / N3',
    tags: ['n2', 'n3', 'análise', 'incidente', 'reportado', 'encaminhar'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezados, solicitamos, por gentileza, a análise do incidente reportado pelo cliente na solicitação em questão.'
  },
  {
    id: 'n2n3-vpn-entra-id',
    title: 'N2/N3 - VPN SSO/Entra ID Novo Modelo',
    category: 'N2 / N3',
    tags: ['vpn', 'sso', 'entra id', 'inclusão', 'grupo', 'n2', 'n3', 'microsoft'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezados,\n\nSolicitamos, por gentileza, a inclusão do cliente no grupo de acesso à VPN e também no grupo de VPN SSO/Entra ID, conforme novo modelo de autenticação vigente.'
  },
  {
    id: 'n2n3-sso-anyconnect',
    title: 'N2/N3 - Inclusão GRP_SSO_AnyConnect',
    category: 'N2 / N3',
    tags: ['vpn', 'anyconnect', 'sso', 'grupo', 'inclusão', 'n2', 'n3', 'falha'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezados,\n\nFoi verificado que o colaborador não foi incluído no grupo “GRP_SSO_AnyConnect”, necessário para acesso VPN via ENTRA ID/SSO.\n\nPoderiam, por gentileza, realizar a inclusão do usuário no grupo citado? Caso contrário, será apresentada falha no momento da tentativa de acesso.\n\nEste contato com a nossa central gerou, por padrão, o protocolo de atendimento.'
  },
  {
    id: 'pendente-info-adicional',
    title: 'Pendente - Motivo de Impressão e Contato',
    category: 'Tentativas & Pendente',
    tags: ['pendente', 'motivo', 'chamado', 'impressora', 'impressão', 'telefone', 'contato'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Olá,\n\nPara seguirmos com o atendimento do seu chamado, precisamos que informe o motivo de não conseguir imprimir os documentos.\n\nVamos precisar também que informe um número DDD + TELEFONE de contato.\n\nFicaremos no aguardo das informações. Obrigado!'
  },
  {
    id: 'vpn-terceiro-qrcode',
    title: 'VPN Terceiro - Requisitos e Termo',
    category: 'VPN',
    tags: ['vpn', 'terceiro', 'terceiros', 'termo', 'qrcode', 'responsabilidade', 'contato', 'ativacao'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: '* Providenciar o termo de responsabilidade anexo neste chamado preenchido e assinado pelo colaborador e também pelo gestor aprovador.\n\n* Informar o e-mail válido do colaborador para recebimento do QRCode de ativação da VPN.\n\n* Número de telefone para contato.'
  },
  {
    id: 'encerramento-vpn-authenticator',
    title: 'Encerramento VPN - Microsoft Authenticator (365)',
    category: 'VPN',
    tags: ['vpn', 'encerramento', 'grupo', 'microsoft authenticator', 'authenticator', '365', 'outlook', 'mfa'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nVerificamos que o acesso VPN já foi devidamente concedido pela equipe responsável, com inclusão realizada no grupo de acesso correspondente.\n\nConforme nova diretriz vigente, o acesso VPN utiliza autenticação através do Microsoft Authenticator (Microsoft 365).\n\nDessa forma, a autenticação é realizada diretamente pelo método utilizado nos acessos Microsoft 365 (Teams, Outlook, e-mail corporativo), através do aplicativo Microsoft Authenticator.\n\nOs novos grupos de acesso VPN são:\n* CC-VPN-FUNCIONARIOS-Microsoft\n* PP-VPN-FUNCIONARIOS-Microsoft\n\nOrientamos que realize um teste de acesso utilizando o novo método de autenticação.\n\nEm caso de dúvidas ou dificuldades, favor contatar a Central de Atendimento de TI.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'sem-termo-encerrada',
    title: 'Sem Termo Encerrada - Requisitos de VPN Terceiro',
    category: 'VPN',
    tags: ['vpn', 'terceiro', 'encerramento', 'sem termo', 'termo', 'responsabilidade', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPara solicitar acesso à VPN para terceiros, é necessário abrir a solicitação e anexar o termo de responsabilidade devidamente assinado por ambas as partes: os colaboradores e o(a) gestor(a) responsável.\n\nPedimos também que informe o número de telefone e e-mail ativo dos colaboradores.\n\nAcesse o Portal de Serviços para pesquisar "Acesso à VPN (usuário TERCEIRO)".\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'tentativa-contato-sem-sucesso',
    title: 'Tentativa - Primeira Tentativa Sem Sucesso',
    category: 'Tentativas & Pendente',
    tags: ['tentativa', 'contato', 'sem sucesso', 'chamado', 'telefone', 'encerramento'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Primeira tentativa de contato sem sucesso.\nStatus: chamada não atendida/desligada.\n\nPrezado(a),\n\nCaso sua solicitação já tenha sido atendida, pedimos que registre um comentário no chamado.\nObservação: Após três tentativas de contato sem sucesso o seu chamado será encerrado sem solução.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'encerramento-tentativas',
    title: 'Tentativa - Encerramento por Múltiplas Tentativas',
    category: 'Tentativas & Pendente',
    tags: ['tentativa', 'encerramento', 'múltiplas', 'contato', 'sem sucesso'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nInformamos que a solicitação foi encerrada devido a múltiplas tentativas de contato sem sucesso.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'reset-senha-sucesso',
    title: 'Senha - Reset de Senha de Rede',
    category: 'Senha & Reset',
    tags: ['senha', 'reset', 'rede', 'sucesso', 'configuração', 'login'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nApós as confirmações de segurança, realizamos o reset da senha de rede com sucesso.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'pasta-rede-recursos',
    title: 'Acessos - Solicitação de Pasta de Rede / File Server',
    category: 'Acessos & Redes',
    tags: ['pasta', 'rede', 'file server', 'acessos', 'permissão', 'caminho', 'diretório', 'solicitação'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitações referentes à pasta de rede devem ser realizadas através do menu:\nServiços de Diretório > Liberação de Recursos (File Server)\n\nNa solicitação, é necessário descrever:\n* Caminho completo da pasta;\n* Tipo de permissão desejada (Leitura ou Modificação);\n* Detalhamento da necessidade ou falha de acesso.\n\nExemplo:\n\\\\servidor\\\\pasta\\\\subpasta\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'encaminhar-ca-vivo',
    title: 'Conectividade - Encaminhar Dados do Local',
    category: 'Acessos & Redes',
    tags: ['aparelho', 'conectividade', 'endereço', 'cep', 'contato'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Necessário preencher as informações abaixo para prosseguir:\n\nID do equipamento:\nHorário de funcionamento do local:\nContato no local (Nome/telefone):\nEndereço:\nCEP:\nCidade:'
  },
  {
    id: 'impressora-reabertura',
    title: 'Impressora - Reabertura na Categoria Correta',
    category: 'Impressoras',
    tags: ['impressora', 'impressão', 'categoria', 'reabertura', 'serviços de impressão', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, que realize a reabertura da solicitação através da categoria correta, pesquisando por “Serviços de Impressão” no portal de chamados.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'email-terceiro-diretrizes',
    title: 'Terceiros - Criação de E-mail / Licença para Terceiros',
    category: 'Terceiros',
    tags: ['email', 'terceiro', 'licença', 'gestor', 'aprovador', 'criação', 'n2'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Olá,\n\nA criação/solicitação de e-mail/licença para terceiros deverá ser solicitada formalmente pelo gestor responsável via portal de serviços, com a aprovação devida e justificativa.\n\nPedimos que solicite a abertura conforme orientação do gestor do contrato.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'reativacao-conta-terceiro',
    title: 'Terceiros - Reativação e Prorrogação de Conta',
    category: 'Terceiros',
    tags: ['terceiro', 'reativação', 'prorrogação', 'conta', 'acessos', 'formulário'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPara a prorrogação ou reativação da conta de rede, é necessário abrir o formulário no portal no caminho:\nAcessos > Acesso de Rede – Terceiro.\n\nAnexar o formulário referente à solicitação (Criação, Prorrogação ou Cancelamento).\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'simpress-portas-regioes-m',
    title: 'Impressora - Atendimento de Impressão',
    category: 'Impressoras',
    tags: ['impressora', 'fornecedor', 'portal', 'email'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nOs atendimentos para impressoras contratadas devem ser solicitados diretamente no portal de suporte de impressão do fornecedor.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'troca-senha-mfa-portal',
    title: 'Senha - Redefinição via Portal Microsoft (MFA)',
    category: 'Senha & Reset',
    tags: ['senha', 'troca', 'redefinição', 'microsoft', 'mfa', 'validação', 'política', '14 caracteres'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPedimos, por gentileza, que realize nova tentativa de redefinição de senha por meio do portal oficial da Microsoft, acessando o link: https://passwordreset.microsoftonline.com\n\nDurante o processo, será necessário concluir a validação por MFA (autenticação multifator), conforme método previamente cadastrado.\n\nReforçamos que a nova senha deve atender à política de segurança vigente: mínimo de 14 caracteres, contendo ao menos três dos seguintes tipos — letras maiúsculas, letras minúsculas, números e caracteres especiais — não podendo conter o nome do usuário (ou parte dele) nem repetir senhas já utilizadas anteriormente.\n\nEm caso de inconsistência ou impossibilidade de conclusão do procedimento, solicitamos reabrir o chamado junto à Central de Serviços para continuidade da tratativa.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'remoto-logmein-123',
    title: 'Suporte - Acesso Remoto LogMeIn123',
    category: 'Outros',
    tags: ['remoto', 'acesso', 'logmein', 'logmein123', 'pin', 'sessão', 'suporte'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: '1. Acesse o site www.logmein123.com\n\n2. Localize o campo onde é solicitado o PIN.\n\n3. Digite o PIN fornecido pelo analista e clique em “Iniciar Sessão”.\n\n4. Será realizado o download de um arquivo em seu equipamento.\n\n5. Execute o arquivo baixado e aguarde o estabelecimento da conexão.\n\n6. Em instantes, aparecerá uma mensagem na tela. Clique em “OK” para iniciar a conexão.'
  },
  {
    id: 'passwordreset-remoto',
    title: 'Senha - Redefinição Assistida via Remoto (#PASSWORDRESET)',
    category: 'Senha & Reset',
    tags: ['senha', 'redefinição', 'passwordreset', 'remoto', 'assistida', 'provisória', 'política', '16 caracteres'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Foi realizado acesso remoto no computador e acessada a página **passwordreset.microsoftonline.com**, onde foi efetuada a alteração de senha.\n\nFoi definida uma senha provisória apenas para evitar o bloqueio do acesso. O cliente foi orientado a acessar posteriormente a página de Segurança da Microsoft para cadastrar uma senha pessoal definitiva.\n\nRequisitos de senha:\n* Mínimo de 16 caracteres;\n* Conter pelo menos 3 dos 4 tipos (maiúsculas, minúsculas, números, caracteres especiais);\n* Não pode conter o nome do usuário;\n* Não pode repetir senhas anteriores.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'senha-reset-loop',
    title: 'Senha - Redirecionamento em Loop no Reset (#Loop)',
    category: 'Senha & Reset',
    tags: ['senha', 'loop', 'reset', 'remoto', 'inconsistência', 'falha', 'portal', 'pendente'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Em contato com o cliente, foi realizado acesso remoto e tentativa de normalização da senha por meio do portal passwordreset.microsoftonline.com, porém sem sucesso.\n\nTambém foi utilizada a opção “Esqueci minha senha”, entretanto o processo entra em loop, redirecionando o cliente sempre para a tela de erro.\n\nPermanece necessária verificação da inconsistência no fluxo de redefinição de senha.\n\nA solicitação vai ficar pendente até normalização do sistema de reset/desbloqueio de senha.'
  },
  {
    id: 'rede-internet-instavel',
    title: 'Acessos - Rede / Internet Falha / Link Incidente (#Rede)',
    category: 'Acessos & Redes',
    tags: ['rede', 'internet', 'falha', 'conexão', 'instável', 'incidente', 'categoria', 'reabertura'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nIdentificamos que o incidente foi registrado em categoria incorreta. Para que a solicitação seja direcionada adequadamente à equipe responsável, solicitamos a reabertura do chamado na categoria “Rede”.\n\nInformações necessárias no chamado:\n* ID do equipamento:\n* Horário de funcionamento do local:\n* Contato no local (Nome/telefone):\n* Endereço, CEP e Cidade.\n\nPermanecemos à disposição para esclarecimentos.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'conect-incidente',
    title: 'Acessos - Reabertura de Chamado / Sistema Corporativo',
    category: 'Acessos & Redes',
    tags: ['incidente', 'reabertura', 'categoria', 'serviços de tecnologia'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, a reabertura da solicitação por meio da requisição correta no portal de atendimento em Serviços de Tecnologia.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'software-reabertura-categoria',
    title: 'Software - Reabertura de Chamado / Requisitos (#Software)',
    category: 'Software',
    tags: ['software', 'reabertura', 'categoria', 'instalação', 'requisitos', 'dados'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, que realize a reabertura da solicitação através da categoria correta no menu:\nServiços de Tecnologia > Software > Solicitações\n\nNo momento da abertura, informe:\n* Nome da aplicação/software;\n* Motivo da solicitação de instalação;\n* Finalidade de utilização;\n* Colaboradores que já utilizam a aplicação no setor.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  },
  {
    id: 'solicitar-endereco-localidade',
    title: 'Demanda - Solicitar Endereço de Localidade',
    category: 'Outros',
    tags: ['demanda', 'endereço', 'localidade', 'completo', 'análise'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Para prosseguirmos com a análise, será necessário informar o endereço completo da localidade.'
  },
  {
    id: 'm365-licencas-f3-e5',
    title: 'Licença 365 - Diferença F3 / E5 e Link Web (#365)',
    category: 'Senha & Reset',
    tags: ['365', 'm365', 'microsoft', 'licença', 'f3', 'e5', 'web', 'desktop', 'solicitação', 'aprovacao'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nFoi verificado que o tipo de licença atribuído ao seu perfil é do tipo F3, a qual permite acesso apenas via versão web dos aplicativos Microsoft 365, não contemplando a utilização do pacote Office em versão desktop.\n\nPara acessar os aplicativos disponíveis para o seu tipo de licença, utilize o link: https://m365.cloud.microsoft/apps\n\nCaso haja necessidade de elevação da licença para o tipo E5 (desktop), será necessário abrir solicitação com a devida aprovação do gestor imediato.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Atendimento e Suporte de TI'
  }
];
