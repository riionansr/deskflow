export interface Phrase {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: string;
  orderIndex?: number;
  pinned?: boolean;
}

export interface UserAccount {
  username: string;
  displayName: string;
  passwordHash: string;
  phrases: Phrase[];
  createdAt: string;
}

export type CategoryType = 
  | 'Todos'
  | 'N2 / N3'
  | 'VPN'
  | 'Senha & Reset'
  | 'Acessos & Redes'
  | 'Impressoras'
  | 'Software'
  | 'Terceiros'
  | 'Tentativas & Pendente'
  | 'Outros';

export const CATEGORIES: CategoryType[] = [
  'Todos',
  'N2 / N3',
  'VPN',
  'Senha & Reset',
  'Acessos & Redes',
  'Impressoras',
  'Software',
  'Terceiros',
  'Tentativas & Pendente',
  'Outros'
];
