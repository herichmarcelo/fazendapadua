import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import { getTiposServico } from '@/lib/actions/tipos-servico'
import TiposServicoClient from '@/components/tipos-servico/TiposServicoClient'

export default async function TiposServicoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const tipos = await getTiposServico()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header title="Tipos de Serviço" />
      
      <main style={{ padding: '1.5rem 1rem 6rem' }}>
        <TiposServicoClient initialTipos={tipos} />
      </main>

      <BottomNav />
    </div>
  )
}