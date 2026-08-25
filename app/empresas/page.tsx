import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import { getEmpresas } from '@/lib/actions/empresas'
import { Building2, Plus, Phone, User, FileText, Edit } from 'lucide-react'
import Link from 'next/link'

export default async function EmpresasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const empresas = await getEmpresas()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header title="Empresas" />
      
      <main style={{ padding: '1.5rem 1rem 6rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#009739',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Building2 size={28} />
            Empresas
          </h2>
          <Link
            href="/empresas/novo"
            className="btn-primario"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={20} />
            Nova Empresa
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {empresas && empresas.length > 0 ? (
            empresas.map((empresa) => (
              <div key={empresa.id} className="card" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 245, 233, 0.95) 100%)',
                borderLeft: '4px solid #009739',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: 'bold', 
                      color: '#009739',
                      marginBottom: '0.25rem'
                    }}>
                      {empresa.nome}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                      {empresa.razao_social}
                    </p>
                    {empresa.cnpj && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                        <FileText size={16} />
                        {empresa.cnpj}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/empresas/${empresa.id}/edit`}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(0, 151, 57, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#009739',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Edit size={20} />
                  </Link>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                  {empresa.contato && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} />
                      {empresa.contato}
                    </div>
                  )}
                  {empresa.nome_proprietario && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} />
                      {empresa.nome_proprietario}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 245, 233, 0.9) 100%)'
            }}>
              <Building2 size={64} style={{ color: '#C8E6C9', marginBottom: '1rem' }} />
              <p style={{ color: '#6B7280', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                Nenhuma empresa cadastrada
              </p>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Comece adicionando sua primeira empresa!
              </p>
              <Link
                href="/empresas/novo"
                className="btn-primario"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem'
                }}
              >
                <Plus size={20} />
                Cadastrar Primeira Empresa
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}