import type {
  Transaction,
  Summary,
  ParsedTransaction,
  CreateTransactionInput,
  AuthResponse,
} from '@cuentas/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

function token() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = token()
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(opts.headers as Record<string, string>),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || res.statusText)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return req('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function getTransactions(): Promise<Transaction[]> {
  return req('/transactions')
}

export function getSummary(): Promise<Summary> {
  return req('/transactions/summary')
}

export function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  return req('/transactions', { method: 'POST', body: JSON.stringify(data) })
}

export function parseTransaction(text: string): Promise<ParsedTransaction> {
  return req('/transactions/parse', { method: 'POST', body: JSON.stringify({ text }) })
}

export function deleteTransaction(id: string): Promise<void> {
  return req(`/transactions/${id}`, { method: 'DELETE' })
}
