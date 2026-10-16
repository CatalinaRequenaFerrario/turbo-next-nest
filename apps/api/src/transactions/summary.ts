import type { Summary, TransactionType } from '@cuentas/types';

interface Movement {
  type: TransactionType;
  amount: number;
  category: string;
}

export function summarize(movements: Movement[]): Summary {
  let income = 0;
  let expense = 0;
  const byCategory = new Map<string, Summary['byCategory'][number]>();

  for (const m of movements) {
    if (m.type === 'income') income += m.amount;
    else expense += m.amount;

    const key = `${m.type}:${m.category}`;
    const entry = byCategory.get(key);
    if (entry) entry.amount += m.amount;
    else byCategory.set(key, { category: m.category, type: m.type, amount: m.amount });
  }

  return { income, expense, balance: income - expense, byCategory: [...byCategory.values()] };
}
