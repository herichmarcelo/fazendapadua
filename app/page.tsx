import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import { getServicos, getTotaisPorEmpresa, getResumoFinanceiro } from '@/lib/actions/servicos'
import { getEmpresas } from '@/lib/actions/empresas'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DollarSign, Ruler, Building2, ClipboardList, TrendingUp, AlertCircle } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [servicos, totaisEmpresa, resumo, empresas] = await Promise.all([
    getServicos(),
    getTotaisPorEmpresa(),
    getResumoFinanceiro(),
    getEmpresas()
  ])

  const ultimosServicos = servicos?.slice(0, 5) || []
  const empresasArray = empresas || []

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header title="Dashboard" />
      
      <main style={{ padding: '1.5rem 1rem 6rem' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '1.5rem' }} className="fade-in">
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#009739',
            marginBottom: '0.25rem'
          }}>
            Bem-vindo! 👋
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Controle total das suas cercas em um só lugar
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <div className="card fade-in" style={{
            background: 'linear-gradient(135deg, #009739 0%, #006B2B 100%)',
            color: 'white',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <DollarSign size={20} style={{ color: '#FFD700' }} />
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Total Geral</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {formatCurrency(resumo.total)}
            </p>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Acumulado total
            </div>
          </div>

          <div className="card fade-in" style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            color: 'white',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Ruler size={20} style={{ color: '#FFD700' }} />
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Metragem</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {formatNumber(resumo.total / (resumo.pago || 1), 1)} m
            </p>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Total de cerca instalada
            </div>
          </div>

          <div className="card fade-in" style={{
            background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)',
            color: 'white',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Building2 size={20} style={{ color: '#FFD700' }} />
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Empresas</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {empresasArray.length}
            </p>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Clientes ativos
            </div>
          </div>

          <div className="card fade-in" style={{
            background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
            color: 'white',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ClipboardList size={20} style={{ color: '#FFD700' }} />
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Serviços</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {servicos?.length || 0}
            </p>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Serviços registrados
            </div>
          </div>
        </div>

        {/* Company Progress */}
        <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            color: '#009739',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Building2 size={20} />
            Por Empresa
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(totaisEmpresa || {}).map(([empresa, dados]) => (
              <div key={empresa} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: '600', color: '#1F2937' }}>{empresa}</span>
                  <span style={{ fontWeight: 'bold', color: '#009739' }}>{formatCurrency(dados.valor)}</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  background: '#E5E7EB', 
                  borderRadius: '9999px', 
                  height: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #009739 0%, #006B2B 100%)',
                      height: '100%',
                      borderRadius: '9999px',
                      transition: 'all 0.3s ease',
                      width: `${(dados.pago / dados.valor) * 100}%`
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
                  <span>Pago: <strong style={{ color: '#009739' }}>{formatCurrency(dados.pago)}</strong></span>
                  <span>Pendente: <strong style={{ color: '#F59E0B' }}>{formatCurrency(dados.pendente)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Services */}
        <div className="fade-in">
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            color: '#009739',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ClipboardList size={20} />
            Últimos Serviços
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ultimosServicos.length > 0 ? (
              ultimosServicos.map((servico) => (
                <div key={servico.id} className="card" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 245, 233, 0.9) 100%)',
                  padding: '1rem',
                  borderLeft: '4px solid #009739'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 'bold', color: '#1F2937', marginBottom: '0.25rem' }}>{servico.empresas?.nome}</h4>
                      <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{servico.tipos_servico?.nome}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold', color: '#009739', fontSize: '1.125rem' }}>{formatCurrency(servico.valor_total)}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{formatNumber(servico.metragem, 1)} m</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 245, 233, 0.9) 100%)'
              }}>
                <AlertCircle size={48} style={{ color: '#F59E0B', marginBottom: '1rem' }} />
                <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Nenhum serviço cadastrado ainda
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                  Comece adicionando seu primeiro serviço!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}