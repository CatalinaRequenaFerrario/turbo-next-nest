export type TransactionType = "income" | "expense";

export const CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Hogar",
  "Salud",
  "Ocio",
  "Ropa",
  "Educación",
  "Trabajo",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  userId: string;
  createdAt: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date: string;
}

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  note: string | null;
  date: string;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  byCategory: Array<{
    category: string;
    amount: number;
    type: TransactionType;
  }>;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}
