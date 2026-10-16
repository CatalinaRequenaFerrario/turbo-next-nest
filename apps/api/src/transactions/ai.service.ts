import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { CATEGORIES } from '@cuentas/types';
import type { ParsedTransaction } from '@cuentas/types';
import { extractJson, normalizeParsed } from './parse-normalizer';

@Injectable()
export class AiService {
  private client: GoogleGenAI;
  private model: string;
  private timeZone: string;

  constructor(config: ConfigService) {
    this.client = new GoogleGenAI({ apiKey: config.get<string>('GEMINI_API_KEY') });
    this.model = config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.timeZone = config.get<string>('APP_TIMEZONE', 'Europe/Madrid');
  }

  async parse(text: string): Promise<ParsedTransaction> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: this.timeZone }).format(new Date());

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

    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });
      return normalizeParsed(extractJson(response.text ?? ''), today);
    } catch {
      throw new BadGatewayException('No se pudo interpretar el texto');
    }
  }
}
