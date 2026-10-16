import { describe, expect, it } from 'vitest';
import { summarize } from './summary';

describe('summarize', () => {
  it('devuelve ceros sin movimientos', () => {
    expect(summarize([])).toEqual({ income: 0, expense: 0, balance: 0, byCategory: [] });
  });

  it('calcula ingresos, gastos y balance', () => {
    const s = summarize([
      { type: 'income', amount: 1500, category: 'Trabajo' },
      { type: 'expense', amount: 40.5, category: 'Hogar' },
      { type: 'expense', amount: 12, category: 'Alimentación' },
    ]);
    expect(s.income).toBe(1500);
    expect(s.expense).toBe(52.5);
    expect(s.balance).toBe(1447.5);
  });

  it('agrupa por categoría sin mezclar ingresos y gastos', () => {
    const s = summarize([
      { type: 'expense', amount: 10, category: 'Otros' },
      { type: 'expense', amount: 20, category: 'Otros' },
      { type: 'income', amount: 100, category: 'Otros' },
    ]);
    expect(s.byCategory).toEqual([
      { category: 'Otros', type: 'expense', amount: 30 },
      { category: 'Otros', type: 'income', amount: 100 },
    ]);
  });
});
