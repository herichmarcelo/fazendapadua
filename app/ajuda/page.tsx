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

        {/* Guia de Instalação PWA no Celular */}
        <div className="card" style={{ padding: '1.25rem', background: 'white', borderRadius: '1rem', marginBottom: '1.5rem', borderLeft: '4px solid #009739' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📲</span>
            Como Instalar no Celular (Android e iPhone)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.825rem', color: '#374151' }}>
            {/* Android */}
            <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
              <strong style={{ color: '#006B2B', display: 'block', marginBottom: '0.35rem' }}>🤖 No Android (Google Chrome):</strong>
              <p style={{ margin: '0 0 0.25rem' }}>1. Ao entrar no site, clique no botão <strong>&quot;Instalar Aplicativo&quot;</strong> que surge na tela.</p>
              <p style={{ margin: 0 }}>2. Ou toque nos <strong>3 pontinhos ⋮</strong> no canto superior do Chrome e escolha <strong>&quot;Instalar aplicativo&quot;</strong>.</p>
            </div>

            {/* iOS */}
            <div style={{ background: '#F0F9FF', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #BAE6FD' }}>
              <strong style={{ color: '#0284C7', display: 'block', marginBottom: '0.35rem' }}>🍏 No iPhone / iPad (Safari):</strong>
              <p style={{ margin: '0 0 0.25rem' }}>1. Abra o site no navegador <strong>Safari</strong>.</p>
              <p style={{ margin: '0 0 0.25rem' }}>2. Toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta ⬆ no rodapé).</p>
              <p style={{ margin: '0 0 0.25rem' }}>3. Role para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong> ➕.</p>
              <p style={{ margin: 0 }}>4. Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior direito.</p>
            </div>
          </div>
        </div>

        {/* Informações da Versão */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
          <p style={{ margin: 0 }}>CercasApp v1.0 • PWA Offline Ready</p>
          <p style={{ margin: '0.2rem 0 0' }}>Fazenda Santo Antônio de Pádua • Horário GMT-4 (MS)</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
