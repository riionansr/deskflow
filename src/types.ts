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

export type CategoryType = string;

export const CATEGORIES: CategoryType[] = [];
