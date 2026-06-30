import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { CATEGORIES } from '@cuentas/types';
import type { ParsedTransaction } from '@cuentas/types';

@Injectable()
export class AiService {
  private client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async parse(text: string): Promise<ParsedTransaction> {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `Eres un asistente que extrae datos de movimientos financieros.
Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta, sin texto adicional ni bloques de código:
{
  "type": "income" | "expense",
  "amount": <número positivo>,
  "category": <una de: ${CATEGORIES.join(', ')}>,
  "note": <string o null>,
  "date": <fecha en formato YYYY-MM-DD>
}
Reglas:
- Si no se especifica tipo, usa "expense".
- Si no se especifica fecha, usa hoy: ${today}.
- Elige la categoría más apropiada de la lista.
- amount debe ser un número, nunca string.

Texto a parsear: ${text}`;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const raw = response.text ?? '';

    const json = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(json) as ParsedTransaction;
  }
}
