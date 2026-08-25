'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import { criarEmpresa } from '@/lib/actions/empresas'
import { Building2, ArrowLeft, Save } from 'lucide-react'

export default function NovaEmpresaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    razao_social: '',
    nome: '',
    cnpj: '',
    contato: '',
    nome_proprietario: '',
    ativo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await criarEmpresa(formData)
      router.push('/empresas')
    } catch (error: any) {
      const msg = typeof error === 'string' ? error : error?.message || 'Erro ao criar empresa'
      setError(msg)
      setSubmitting(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header title="Nova Empresa" />
      
      <main style={{ padding: '1.5rem 1rem 6rem' }}>
        <button 
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'white',
            border: '2px solid #009739',
            borderRadius: '0.75rem',
            color: '#009739',
            fontWeight: '600',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: '#009739',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Building2 size={24} />
            Cadastrar Nova Empresa
          </h2>

          {error && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              border: '2px solid #FECACA', 
              color: '#DC2626', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>Razão Social *</label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                placeholder="Ex: AGRICOLA JUNIOR CABRINE LTDA"
                className="input-field"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>Nome Fantasia *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: JUNIOR CABRINE"
                className="input-field"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>CNPJ</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                placeholder="00.000.000/0000-00"
                className="input-field"
                disabled={submitting}
                maxLength={18}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>Contato</label>
              <input
                type="tel"
                value={formData.contato}
                onChange={(e) => setFormData(prev => ({ ...prev, contato: formatTelefone(e.target.value) }))}
                placeholder="(00) 00000-0000"
                className="input-field"
                disabled={submitting}
                maxLength={15}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>Nome do Proprietário</label>
              <input
                type="text"
                value={formData.nome_proprietario}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_proprietario: e.target.value }))}
                placeholder="Nome completo do proprietário"
                className="input-field"
                disabled={submitting}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primario" 
              style={{ 
                width: '100%',
                fontSize: '1rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }} 
              disabled={submitting}
            >
              <Save size={20} />
              {submitting ? 'Salvando...' : 'Salvar Empresa'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}