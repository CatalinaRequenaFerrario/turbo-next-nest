'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@cuentas/types'
import type { Transaction, Summary, ParsedTransaction } from '@cuentas/types'
import * as api from '@/lib/api'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

const today = () => new Date().toLocaleDateString('en-CA')

const EMPTY_FORM = {
  type: 'expense' as 'income' | 'expense',
  amount: '',
  category: CATEGORIES[0] as string,
  note: '',
  date: today(),
}

export default function DashboardPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [nlText, setNlText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [txs, sum] = await Promise.all([api.getTransactions(), api.getSummary()])
      setTransactions(txs)
      setSummary(sum)
    } catch {
      // token expirado u otro error — volver al login
      localStorage.removeItem('token')
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login')
      return
    }
    loadData().finally(() => setLoading(false))
  }, [loadData, router])

  async function handleParse() {
    if (!nlText.trim()) return
    setParsing(true)
    try {
      const parsed: ParsedTransaction = await api.parseTransaction(nlText)
      setForm({
        type: parsed.type,
        amount: String(parsed.amount),
        category: parsed.category,
        note: parsed.note ?? '',
        date: parsed.date,
      })
    } catch {
      alert('No se pudo analizar el texto. Inténtalo de nuevo.')
    } finally {
      setParsing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createTransaction({
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category,
        note: form.note || undefined,
        date: form.date,
      })
      setForm({ ...EMPTY_FORM, date: today() })
      setNlText('')
      await loadData()
    } catch {
      alert('Error al guardar el movimiento.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Borrar este movimiento?')) return
    try {
      await api.deleteTransaction(id)
      await loadData()
    } catch {
      alert('Error al borrar.')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Cargando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-600">€</span>
            <span className="font-semibold text-gray-900">Cuentas</span>
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-700">
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Tarjetas de resumen */}
        {summary && (
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard label="Ingresos" amount={summary.income} green />
            <SummaryCard label="Gastos" amount={summary.expense} green={false} />
            <SummaryCard label="Balance" amount={summary.balance} green={summary.balance >= 0} />
          </div>
        )}

        {/* Input de lenguaje natural */}
        <section className="bg-white rounded-2xl border p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Añadir con texto</p>
          <div className="flex gap-2">
            <textarea
              value={nlText}
              onChange={e => setNlText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleParse() } }}
              placeholder='Ej: "gasté 12€ en comida y 40 de luz"'
              rows={2}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleParse}
              disabled={parsing || !nlText.trim()}
              className="px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors self-end py-2"
            >
              {parsing ? '...' : 'Analizar'}
            </button>
          </div>
        </section>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Movimiento</p>

          {/* Tipo */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'expense' ? 'Gasto' : 'Ingreso'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Importe (€)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Añade una nota..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar movimiento'}
          </button>
        </form>

        {/* Desglose por categoría */}
        {summary && summary.byCategory.length > 0 && (
          <section className="bg-white rounded-2xl border p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Por categoría</p>
            <div className="space-y-2">
              {[...summary.byCategory]
                .sort((a, b) => b.amount - a.amount)
                .map(c => (
                  <div key={`${c.type}-${c.category}`} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{c.category}</span>
                    <span className={c.type === 'expense' ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                      {c.type === 'expense' ? '−' : '+'}{eur.format(c.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Lista de movimientos */}
        <section className="bg-white rounded-2xl border p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Movimientos</p>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aún no hay movimientos. ¡Añade el primero!
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">{t.date}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {t.category}
                      </span>
                    </div>
                    {t.note && (
                      <p className="text-sm text-gray-600 mt-0.5 truncate">{t.note}</p>
                    )}
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${t.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                    {t.type === 'expense' ? '−' : '+'}{eur.format(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none shrink-0"
                    title="Borrar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function SummaryCard({ label, amount, green }: { label: string; amount: number; green: boolean }) {
  return (
    <div className="bg-white rounded-2xl border p-3 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-sm font-bold ${green ? 'text-green-600' : 'text-red-500'}`}>
        {eur.format(amount)}
      </p>
    </div>
  )
}
