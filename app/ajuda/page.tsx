import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import Link from 'next/link'
import { HelpCircle, Phone, Mail, FileText, CheckCircle2, ChevronLeft } from 'lucide-react'

export default function AjudaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Ajuda & Suporte" />

      <main className="px-4 py-6 pb-24" style={{ maxWidth: '40rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            href="/mais"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#009739',
              fontWeight: '700',
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}
          >
            <ChevronLeft size={18} />
            Voltar para Mais
          </Link>
        </div>

        {/* Card Principal */}
        <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.75rem',
              background: 'rgba(0, 151, 57, 0.1)',
              color: '#009739',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Central de Ajuda - CercasApp
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.15rem 0 0' }}>
                Fazenda Cabrines • Gestão de Cercas e Medições
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
            <p>
              O <strong>CercasApp</strong> foi desenvolvido para facilitar o acompanhamento diário de serviços de cerca, conferência e fechamento para prestadores.
            </p>
          </div>
        </div>

        {/* Guia Rápido de Uso */}
        <div className="card" style={{ padding: '1.25rem', background: 'white', borderRadius: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} style={{ color: '#009739' }} />
            Fluxo de Fechamento de Serviços
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem', color: '#4B5563' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} style={{ color: '#009739', marginTop: '2px', flexShrink: 0 }} />
              <div><strong>1. Lançamento:</strong> Registre as metragens e serviços no botão &quot;Novo Serviço&quot;.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} style={{ color: '#009739', marginTop: '2px', flexShrink: 0 }} />
              <div><strong>2. Conferência de Campo:</strong> Confere-se o serviço realizado in loco.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} style={{ color: '#009739', marginTop: '2px', flexShrink: 0 }} />
              <div><strong>3. Fechar Serviço:</strong> Clica-se em &quot;Fechar Serviço&quot; para liberar no relatório.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} style={{ color: '#009739', marginTop: '2px', flexShrink: 0 }} />
              <div><strong>4. Relatório e PDF:</strong> Acesse &quot;Relatórios&quot; para imprimir o extrato por empresa ou geral.</div>
            </div>
          </div>
        </div>

        {/* Informações da Versão */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
          <p style={{ margin: 0 }}>CercasApp v1.0 • PWA Offline Ready</p>
          <p style={{ margin: '0.2rem 0 0' }}>Horário Oficial: GMT-4 (Campo Grande / MS)</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
