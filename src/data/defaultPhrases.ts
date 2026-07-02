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
    content: 'Prezados,\n\nFoi verificado que o colaborador não foi incluído no grupo “GRP_SSO_AnyConnect”, necessário para acesso VPN via ENTRA ID/SSO.\n\nPoderiam, por gentileza, realizar a inclusão do usuário no grupo citado? Caso contrário, será apresentada falha no momento da tentativa de acesso.\n\nEste contato com a nossa central gerou, por padrão, o protocolo INC0597476'
  },
  {
    id: 'pendente-info-adicional',
    title: 'Pendente - Motivo de Impressão e Contato',
    category: 'Tentativas & Pendente',
    tags: ['pendente', 'motivo', 'chamado', 'impressora', 'impressão', 'telefone', 'contato'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Olá Cristiano .\n\nPara seguirmos com o atendimento do seu chamado, precisamos que informe o motivo de não conseguir imprimir os documentos.\n\nVamos precisar também que informe um numero DDD + TELEFONE\n\nFicaremos no aguardo das informações. Obrigado!'
  },
  {
    id: 'vpn-terceiro-qrcode',
    title: 'VPN Terceiro - Requisitos e Termo',
    category: 'VPN',
    tags: ['vpn', 'terceiro', 'terceiros', 'termo', 'qrcode', 'responsabilidade', 'contato', 'ativacao'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: '* Providenciar o termo de responsabilidade anexo neste chamado preenchido e assinado pelo colaborador e também pelo aprovador SABESP\n\n* Informar o e-mail válido do colaborador para recebimento do QRCode de ativação da VPN\n\n* Numero de contato.'
  },
  {
    id: 'encerramento-vpn-authenticator',
    title: 'Encerramento VPN - Microsoft Authenticator (365)',
    category: 'VPN',
    tags: ['vpn', 'encerramento', 'grupo', 'microsoft authenticator', 'authenticator', '365', 'outlook', 'mfa', 'cisco duo'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nVerificamos que o acesso VPN já foi devidamente concedido pela equipe responsável, com inclusão realizada no grupo de acesso correspondente.\n\nConforme nova diretriz vigente a partir de 18/05/2026, o acesso VPN passou a utilizar autenticação através do Microsoft Authenticator (Microsoft 365), substituindo gradativamente o modelo anterior via Cisco Duo.\n\nDessa forma, não é mais necessário o envio de QR Code para utilização da VPN, uma vez que a autenticação será realizada diretamente pelo método já utilizado nos acessos Microsoft 365 (Teams, Outlook, e-mail corporativo, entre outros), através do aplicativo Microsoft Authenticator.\n\nOs novos grupos de acesso VPN são:\n\n* CC-VPN-FUNCIONARIOS-Microsoft\n* PP-VPN-FUNCIONARIOS-Microsoft\n\nUtilizando o login:\nlogin@sabesp.com.br\n\nOrientamos que realize um teste de acesso utilizando o novo método de autenticação.\n\nEm caso de dúvidas ou dificuldades, favor contatar a Central de Serviços.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'sem-termo-encerrada',
    title: 'Sem Termo Encerrada - Requisitos de VPN Terceiro',
    category: 'VPN',
    tags: ['vpn', 'terceiro', 'encerramento', 'sem termo', 'termo', 'responsabilidade', 'FE-TI0003', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPara solicitar acesso à VPN para terceiros, é necessário abrir a solicitação e anexar o termo de responsabilidade FE‑TI0003, devidamente assinado por ambas as partes: os colaboradores e o(a) gestor(a) SABESP.\n\nPedimos também que informe o numero de telefone e e-mail ativo dos colaboradores.\n\nLink direto da solicitação correta:  https://sabesp.service-now.com/esc?id=sc_cat_item&table=sc_cat_item&sys_id=5269a5bd3b51fed0c2b33c37f4e45a88&recordUrl=com.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1&sysparm_id=5269a5bd3b51fed0c2b33c37f4e45a88\n\nOu pesquisando "Acesso à VPN (usuário TERCEIRO)"\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'tentativa-contato-sem-sucesso',
    title: 'Tentativa - Primeira Tentativa Sem Sucesso',
    category: 'Tentativas & Pendente',
    tags: ['tentativa', 'contato', 'sem sucesso', 'chamado', 'telefone', 'encerramento'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Primeira tentativa de contato sem sucesso.\nNúmero(s) chamado(s):11974654356 \nStatus: chamada não atendida/desligada.\n\nPrezado(a),\n\nCaso sua solicitação já tenha sido atendida, pedimos que registre um comentário no chamado.\nObservação: Após três tentativas de contato sem sucesso o seu chamado será encerrado sem solução.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'encerramento-tentativas',
    title: 'Tentativa - Encerramento por Múltiplas Tentativas',
    category: 'Tentativas & Pendente',
    tags: ['tentativa', 'encerramento', 'múltiplas', 'contato', 'sem sucesso'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nInformamos que a solicitação foi encerrada devido a múltiplas tentativas de contato sem sucesso.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'reset-senha-sucesso',
    title: 'Senha - Reset de Senha de Rede',
    category: 'Senha & Reset',
    tags: ['senha', 'reset', 'rede', 'sucesso', 'configuração', 'login'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nApós as confirmações de segurança, realizamos o reset da senha de rede com sucesso.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'pasta-rede-recursos',
    title: 'Acessos - Solicitação de Pasta de Rede / File Server',
    category: 'Acessos & Redes',
    tags: ['pasta', 'rede', 'file server', 'acessos', 'permissão', 'caminho', 'diretório', 'solicitação'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitações referentes à pasta de rede devem ser realizadas através da requisição:\n\nServiços de Diretório > Liberação de Recursos (File Server)\n\nNa solicitação, é necessário descrever:\n\n* Caminho completo da pasta;\n* Tipo de permissão desejada (Leitura ou Modificação);\n* Ou detalhamento da falha de acesso apresentada, preferencialmente com evidências/prints do erro.\n\nLink direto:\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=fd149c3d3b0f6610c2b33c37f4e45aef\n\nOu navegando pelo menu:\nServiços de Tecnologia > Gestão de Acessos > Acessos\n\nSelecionando a opção:\n“Pasta de Rede” no campo “Sistema”.\n\nImportante:\nÉ necessário informar o caminho completo da pasta, incluindo o servidor.\n\nExemplo:\n\\fsabesp\\pasta\\subpasta\n\nAtenciosamente,\n\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'encaminhar-ca-vivo',
    title: 'Conectividade - Encaminhar CA.VIVO',
    category: 'Acessos & Redes',
    tags: ['vivo', 'aparelho', 'ca.vivo', 'conectividade', 'endereço', 'cep', 'contato'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Necessário preencher as informações abaixo para prosseguir:\n\nID do aparelho vivo:\nHorário de funcionamento do local:\nContato no local (Nome/ telefone):\nEndereço:\nCEP:\nCidade:'
  },
  {
    id: 'impressora-reabertura',
    title: 'Impressora - Reabertura na Categoria Correta',
    category: 'Impressoras',
    tags: ['impressora', 'impressão', 'categoria', 'reabertura', 'serviços de impressão', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, que realize a reabertura da solicitação através da categoria correta, conforme orientações abaixo:\n\nLink direto:\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=0db6141a3b576a50c2b33c37f4e45a52&table=sc_cat_item&searchTerm=impressao\n\nOu pesquisando por:\n“Impressora” ou “Impressão” no campo de busca do ServiceNow, selecionando a solicitação “Serviços de Impressão”.\n\nAtenciosamente,\n\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'email-terceiro-diretrizes',
    title: 'Terceiros - Criação de E-mail / Licença para Terceiros',
    category: 'Terceiros',
    tags: ['email', 'terceiro', 'licença', 'gestor', 'aprovador', 'criação', 'n2', 'servicenow'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Olá, informamos que.\n\nA criação/solicitação de e-mail/licença para terceiros deverá ser solicitada formalmente pelo gestor responsável, via solicitação na ferramenta service now, com a aprovação do N2 SABESP responsável pelo Gestor do Contrato com a devida justificativa.\n\nA solicitação deve ser aberta pelo gestor responsável, pedimos que cancele a solicitação e solicite a abertura conforme orientação. \n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'reativacao-conta-terceiro',
    title: 'Terceiros - Reativação e Prorrogação de Conta',
    category: 'Terceiros',
    tags: ['terceiro', 'reativação', 'prorrogação', 'conta', 'acessos', 'formulário', 'TI0039', 'FE-T10006'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a) ,\n\nPara a prorrogação da conta de rede, é necessário abrir o formulário no caminho:\nAcessos > Sistema Afetado > Acesso de Rede – Terceiro.\n\nLink: https://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=fd149c3d3b0f6610c2b33c37f4e45aef\n\nNecessário anexar o formulário referente a solicitação:\n\nOs formulários variam de acordo com o tipo de solicitação:\n\nCriação e ativação de conta: FE-T10006 – Criação\nProrrogação de conta: TI0039 – Prorrogação\nCancelamento de conta: FE-T10025 – Cancelamento\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'simpress-portas-regioes-m',
    title: 'Impressora - Fornecedor Simpress (Regiões M)',
    category: 'Impressoras',
    tags: ['simpress', 'impressora', 'região m', 'fornecedor', 'portal', 'email'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nOs atendimentos para impressoras Simpress – Regiões M devem ser solicitados diretamente no portal do fornecedor:\n🔗 https://ux.simpress.com.br\n\nDúvidas sobre o uso do portal podem ser encaminhadas para:\n📧 impressorasm@sabesp.com.br\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n📞 Telefone: (11) 3388-9000\n📱 WhatsApp: (11) 3388-9000\n💬 Sani (Chat MS Teams)\n🌐 Portal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'gupy-liberacao-acesso',
    title: 'Acessos - Liberação da plataforma Gupy',
    category: 'Acessos & Redes',
    tags: ['gupy', 'liberação', 'acesso', 'recrutamento', 'talentos', 'email'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPara a liberação do acesso, é necessário entrar em contato com o time responsável por meio do e-mail GupyTalentosinternos@sabesp.com.br, que poderá realizar a verificação e dar continuidade à solicitação.\n\nAtenciosamente,\n\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'troca-senha-mfa-portal',
    title: 'Senha - Redefinição via Portal Microsoft (MFA)',
    category: 'Senha & Reset',
    tags: ['senha', 'troca', 'redefinição', 'microsoft', 'mfa', 'validação', 'política', '14 caracteres'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPedimos, por gentileza, que realize nova tentativa de redefinição de senha por meio do portal oficial da Microsoft, acessando o link: https://passwordreset.microsoftonline.com\n\nDurante o processo, será necessário concluir a validação por MFA (autenticação multifator), conforme método previamente cadastrado.\n\nReforçamos que a nova senha deve atender à política de segurança vigente: mínimo de 14 caracteres, contendo ao menos três dos seguintes tipos — letras maiúsculas, letras minúsculas, números e caracteres especiais — não podendo conter o nome do usuário (ou parte dele) nem repetir senhas já utilizadas anteriormente.\n\nEm caso de inconsistência ou impossibilidade de conclusão do procedimento, solicitamos reabrir o chamado junto à Central de Serviços para continuidade da tratativa.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'remoto-logmein-123',
    title: 'Suporte - Acesso Remoto LogMeIn123',
    category: 'Outros',
    tags: ['remoto', 'acesso', 'logmein', 'logmein123', 'pin', 'sessão', 'suporte'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: '1. Acesse o site www.logmein123.com\n\n2. Localize o campo onde é solicitado o PIN.\n\n3. Digite o PIN 720703 e clique em “Iniciar Sessão”.\n\n4. Será realizado o download de um arquivo em seu equipamento.\n\n5. Execute o arquivo baixado e aguarde o estabelecimento da conexão.\n\n6. Em instantes, aparecerá uma mensagem com meu nome. Clique em “OK” para iniciar a conexão.'
  },
  {
    id: 'passwordreset-remoto',
    title: 'Senha - Redefinição Assistida via Remoto (#PASSWORDRESET)',
    category: 'Senha & Reset',
    tags: ['senha', 'redefinição', 'passwordreset', 'remoto', 'assistida', 'provisória', 'política', '16 caracteres'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Foi realizado acesso remoto no computador e acessada a página **passwordreset.microsoftonline.com**, onde foi efetuada a alteração de senha.\n\nFoi definida uma senha provisória apenas para evitar o bloqueio do acesso. O cliente foi orientada a acessar posteriormente a página de Segurança da Microsoft para cadastrar uma senha pessoal definitiva.\n\nrequisitos de senha:\n\n* Mínimo de 16 caracteres;\n* Conter pelo menos 3 dos 4 tipos:\n\n  * Letras maiúsculas;\n  * Letras minúsculas;\n  * Números;\n  * Caracteres especiais;\n* Não pode conter o nome ou parte do nome do usuário;\n* Não pode repetir senhas anteriormente utilizadas.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'senha-reset-loop',
    title: 'Senha - Redirecionamento em Loop no Reset (#Loop)',
    category: 'Senha & Reset',
    tags: ['senha', 'loop', 'reset', 'remoto', 'inconsistência', 'falha', 'portal', 'pendente'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Em contato com o cliente, foi realizado acesso remoto e tentativa de normalização da senha por meio do portal passwordreset.microsoftonline.com, porém sem sucesso.\n\nTambém foi utilizada a opção “Esqueci minha senha”, entretanto o processo entra em loop, redirecionando o cliente sempre para a tela apresentada em anexo, impossibilitando a conclusão do procedimento.\n\nPermanece necessária verificação da inconsistência no fluxo de redefinição de senha.\n\nA solicitação vai ficar pendente até normalização do sistema de reset/desbloqueio de senha.'
  },
  {
    id: 'rede-internet-instavel',
    title: 'Acessos - Rede / Internet Falha / Link Incidente (#Rede)',
    category: 'Acessos & Redes',
    tags: ['rede', 'internet', 'falha', 'conexão', 'instável', 'incidente', 'vivo', 'categoria', 'reabertura'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nIdentificamos que o incidente foi registrado em categoria incorreta. Para que a solicitação seja direcionada adequadamente à equipe responsável, solicitamos a reabertura do chamado na categoria correta, conforme orientações abaixo.\n\nA abertura poderá ser realizada diretamente pelo link:\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=c405a24e3b6fa210e7476337f4e45aef&table=sc_cat_item&searchTerm=incident\n\nOu acessando o ServiceNow pelo caminho:\nTenho um problema > Criar incidente > Categoria: “Rede” > Tipo de ocorrência: “Conexão à internet instável ou inexistente”.\n\nÉ imprescindível o preenchimento de todos os campos obrigatórios e das informações na tabela de opções do incidente, a fim de garantir o correto encaminhamento à equipe técnica responsável.\n\n* ID do aparelho Vivo:\n* Horário de funcionamento do local:\n* Contato no local (Nome/telefone):\n* Endereço:\n* CEP:\n* Cidade:\n\nPermanecemos à disposição para esclarecimentos.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'conect-incidente',
    title: 'Acessos - Conect@ Incidente Reabertura (#Conect@)',
    category: 'Acessos & Redes',
    tags: ['conect@', 'incidente', 'reabertura', 'categoria', 'serviços de tecnologia', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, a reabertura da solicitação por meio da requisição correta, conforme link abaixo:\n\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=92a88b0d878ff610a6b7a7540cbb357e\n\nAlternativamente, o acesso pode ser realizado pelo portal, seguindo o caminho:\nServiços de Tecnologia > Conect@ > Conect@.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'conect-acessos',
    title: 'Acessos - Conect@ Acessos Perfil (#Conect@)',
    category: 'Acessos & Redes',
    tags: ['conect@', 'acessos', 'reabertura', 'perfil', 'gestão de acessos', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, a reabertura da solicitação por meio da requisição correta, conforme link abaixo:\n\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=fd149c3d3b0f6610c2b33c37f4e45aef\n\nAlternativamente, o acesso pode ser realizado pelo portal, seguindo o caminho: Serviços de Tecnologia > Gestão de Acessos > Acessos, selecionando a opção “conect@” no campo “Sistema”.\n\nImportante apontar o perfil de acesso no momento da abertura da solicitação \n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\n\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal Service Now: https://sabesp.service-now.com/esc'
  },
  {
    id: 'software-reabertura-categoria',
    title: 'Software - Reabertura de Chamado / Requisitos (#Software)',
    category: 'Software',
    tags: ['software', 'reabertura', 'categoria', 'instalação', 'requisitos', 'dados', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nSolicitamos, por gentileza, que realize a reabertura da solicitação através da categoria correta, conforme orientações abaixo:\n\nLink direto:\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=a61633bd3b1fa210e7476337f4e45adb\n\nOu navegando pelo menu:\nServiços de Tecnologia > Software > Solicitações\n\nNo momento da abertura da solicitação, será necessário informar os dados abaixo:\n\n* Nome da aplicação/software;\n* Motivo da solicitação de instalação;\n* Qual será a finalidade de utilização da aplicação;\n* Há outro colaborador/usuário no setor que já utiliza esta aplicação?;\n* Em caso positivo, informar o nome do colaborador.\n\nAtenciosamente,\n\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  },
  {
    id: 'email-terceiro-licenca-f3',
    title: 'Terceiros - Licença Microsoft F3 / Aprovação Gestor (#Email)',
    category: 'Terceiros',
    tags: ['email', 'terceiro', 'licença', 'f3', 'aprovação', 'gestor', 'termo', 'link'],
    updatedAt: '2026-05-18T10:00:00Z',
    content: 'Prezado(a),\n\nPara solicitação de licença de e-mail para usuários terceiros, o time interno de TI SABESP orienta que o chamado possua aprovação do gestor imediato SABESP, com a devida evidência anexada à solicitação.\n\nPara usuários terceiros, é disponibilizada a licença Microsoft Office F3.\n\nA evidência de aprovação pode ser:\n\nTermo de uso do correio eletrônico assinado digitalmente pelo gestor; ou\nPrint/evidência de e-mail contendo o “de acordo” do gestor, demonstrando ciência e aprovação do licenciamento.\n\nA solicitação deverá ser aberta através do link abaixo:\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=f4f86f773b01b690e7476337f4e45a9d\n\nOu navegando pelo portal:\nServiços de Tecnologia > Sistemas > Solicitações\n\nSelecionando a opção:\n“Email”\n\nImportante:\nNo momento da abertura da solicitação, é obrigatório anexar a evidência de aprovação gerencial ou o termo de uso do correio eletrônico devidamente assinado.\n\nAtenciosamente,\n\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
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
    content: 'Prezado(a),\n\nFoi verificado que o tipo de licença atribuído ao seu perfil é do tipo F3, a qual permite acesso apenas via versão web dos aplicativos Microsoft 365, não contemplando a utilização do pacote Office em versão desktop.\n\nPara acessar os aplicativos disponíveis para o seu tipo de licença, utilize o link abaixo:\nhttps://m365.cloud.microsoft/apps\n\nCaso haja necessidade de elevação da licença para o tipo E5, que permite a utilização dos aplicativos desktop, será necessário seguir as orientações abaixo para abertura de solicitação.\n\nAbertura da solicitação\n\nLink direto:\nhttps://sabesp.service-now.com/esc?id=sc_cat_item&sys_id=fd149c3d3b0f6610c2b33c37f4e45aef&table=sc_cat_item&searchTerm=acessos\n\nOu navegando pelo portal:\nSolicite Algo > Acessos > Email\n\nNo campo de descrição, informar:\n“Solicitação de licença Office 365 para a conta do usuário.”\n\n* Obrigatória aprovação do gestor imediato SABESP;\n* Necessário anexar evidência da aprovação na solicitação (exemplo: e-mail com o “de acordo” do gestor);\n\nApós aprovação no fluxo, a solicitação será direcionada para a equipe responsável para continuidade da tratativa.\n\nAtenciosamente,\nServiço de Atendimento de Tecnologia da Informação\nCentral de Serviços SABESP\nTelefone: (11) 3388-9000\nWhatsApp: (11) 3388-9000\nSani (Chat MS Teams)\nPortal ServiceNow: https://sabesp.service-now.com/esc'
  }
];
