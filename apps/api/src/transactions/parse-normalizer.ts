import { CATEGORIES } from '@cuentas/types';
import type { ParsedTransaction } from '@cuentas/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function extractJson(raw: string): unknown {
  const json = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(json);
}

export function normalizeParsed(data: unknown, today: string): ParsedTransaction {
  const d = (data ?? {}) as Record<string, unknown>;

  const amount = Math.abs(Number(d.amount));
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('Importe no reconocido');
  }

  const category = (CATEGORIES as readonly string[]).includes(d.category as string)
    ? (d.category as string)
    : 'Otros';

  const note = typeof d.note === 'string' && d.note.trim() ? d.note.trim() : null;
  const date = typeof d.date === 'string' && DATE_RE.test(d.date) ? d.date : today;

  return {
    type: d.type === 'income' ? 'income' : 'expense',
    amount: Math.round(amount * 100) / 100,
    category,
    note,
    date,
  };
}
