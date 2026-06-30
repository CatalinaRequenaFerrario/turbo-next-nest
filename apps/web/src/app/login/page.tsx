'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '@/lib/api'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fn = mode === 'login' ? login : register
      const data = await fn(email, password)
      localStorage.setItem('token', data.accessToken)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-3xl mb-3">
            €
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas</h1>
          <p className="text-sm text-gray-500 mt-1">Tus ingresos y gastos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex mb-6 rounded-xl overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
