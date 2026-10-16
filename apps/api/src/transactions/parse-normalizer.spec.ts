import { describe, expect, it } from 'vitest';
import { extractJson, normalizeParsed } from './parse-normalizer';

const TODAY = '2026-10-16';

describe('extractJson', () => {
  it('quita los bloques de código markdown', () => {
    expect(extractJson('```json\n{"amount": 12}\n```')).toEqual({ amount: 12 });
  });

  it('falla si no es JSON', () => {
    expect(() => extractJson('no sé')).toThrow();
  });
});

describe('normalizeParsed', () => {
  it('acepta una respuesta válida', () => {
    expect(
      normalizeParsed(
        { type: 'expense', amount: 12, category: 'Alimentación', note: 'comida', date: '2026-10-15' },
        TODAY,
      ),
    ).toEqual({ type: 'expense', amount: 12, category: 'Alimentación', note: 'comida', date: '2026-10-15' });
  });

  it('usa "Otros" si la categoría no existe', () => {
    expect(normalizeParsed({ amount: 5, category: 'Mascotas' }, TODAY).category).toBe('Otros');
  });

  it('convierte el importe a positivo y lo redondea a céntimos', () => {
    expect(normalizeParsed({ amount: '-12.345' }, TODAY).amount).toBe(12.35);
  });

  it('usa gasto, hoy y nota nula por defecto', () => {
    expect(normalizeParsed({ amount: 3, date: 'ayer', note: '  ' }, TODAY)).toMatchObject({
      type: 'expense',
      date: TODAY,
      note: null,
    });
  });

  it('rechaza importes no numéricos o cero', () => {
    expect(() => normalizeParsed({ amount: 'doce' }, TODAY)).toThrow();
    expect(() => normalizeParsed({ amount: 0 }, TODAY)).toThrow();
  });
});
