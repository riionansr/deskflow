import { Phrase } from '../types';

// O DeskFlow Community BYOD inicia com o catálogo zerado.
// O usuário cria suas próprias frases ou importa um repertório de um colega/backup.
export const initialPhrases: Phrase[] = [];

// Lista de IDs legados da versão anterior para limpeza do LocalStorage
export const LEGACY_DEFAULT_PHRASE_IDS = [
  'n2n3-verificacao',
  'n2n3-analise',
  'n2n3-vpn-entra-id',
  'n2n3-sso-anyconnect',
  'pendente-info-adicional',
  'vpn-terceiro-qrcode',
  'encerramento-vpn-authenticator',
  'sem-termo-encerrada',
  'tentativa-contato-sem-sucesso',
  'encerramento-tentativas',
  'reset-senha-sucesso',
  'pasta-rede-recursos',
  'encaminhar-ca-vivo',
  'impressora-reabertura',
  'email-terceiro-diretrizes',
  'reativacao-conta-terceiro',
  'simpress-portas-regioes-m',
  'troca-senha-mfa-portal',
  'remoto-logmein-123',
  'passwordreset-remoto',
  'senha-reset-loop',
  'rede-internet-instavel',
  'conect-incidente',
  'software-reabertura-categoria',
  'solicitar-endereco-localidade',
  'm365-licencas-f3-e5'
];

