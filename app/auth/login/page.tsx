'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #009739 0%, #006B2B 50%, #004D1F 100%)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 1 }}>
        <div className="card" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Image
              src="/pluma.png"
              alt="Logo Pluma"
              width={180}
              height={90}
              style={{ objectFit: 'contain', width: 'auto', height: '80px', maxWidth: '100%' }}
              priority
            />
          </div>

          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#009739', 
            marginBottom: '1.5rem', 
            textAlign: 'center' 
          }}>Bem-vindo de volta! 👋</h2>

          {error && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              border: '2px solid #FECACA', 
              color: '#DC2626', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field"
                required
                disabled={loading}
                style={{ fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>Senha</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                  disabled={loading}
                  style={{ 
                    fontSize: '1rem', 
                    width: '100%', 
                    boxSizing: 'border-box',
                    paddingRight: '2.75rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primario" 
              style={{ 
                width: '100%',
                fontSize: '1rem',
                padding: '1rem',
                boxSizing: 'border-box'
              }} 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem', 
            fontSize: '0.875rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #E5E7EB'
          }}>
            <span style={{ color: '#6B7280' }}>Não tem uma conta? </span>
            <Link 
              href="/auth/register" 
              style={{ 
                color: '#009739', 
                fontWeight: '700', 
                textDecoration: 'none',
                marginLeft: '0.25rem'
              }}
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}