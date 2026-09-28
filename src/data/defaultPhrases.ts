import { Phrase } from '../types';

// O DeskFlow Community BYOD inicia com o catálogo zerado.
// O usuário cria suas próprias frases ou importa um repertório de um colega/backup.
export const initialPhrases: Phrase[] = [];

// Lista de IDs legados da versão anterior para limpeza do LocalStorage
export const LEGACY_DEFAULT_PHRASE_IDS = [
  'n2n3-verificacao',
  'n2n3-analise',
  'n2n3-vpn-acesso',
  'n2n3-sso-vpn',
  'pendente-info-adicional',
  'vpn-terceiro-qrcode',
  'encerramento-vpn-mfa',
  'sem-termo-encerrada',
  'tentativa-contato-sem-sucesso',
  'encerramento-tentativas',
  'reset-senha-sucesso',
  'pasta-rede-recursos',
  'encaminhar-suporte-telecom',
  'impressora-reabertura',
  'email-terceiro-diretrizes',
  'reativacao-conta-terceiro',
  'impressoras-filas-rede',
  'troca-senha-mfa-portal',
  'remoto-suporte-padrao',
  'passwordreset-remoto',
  'senha-reset-loop',
  'rede-internet-instavel',
  'portal-servicos-incidente',
  'software-reabertura-categoria',
  'solicitar-endereco-localidade',
  'licencas-produtividade'
];

