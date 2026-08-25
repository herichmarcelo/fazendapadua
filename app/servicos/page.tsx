import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import ServicosListClient from '@/components/servicos/ServicosListClient';
import { getServicos, getTiposServico } from '@/lib/actions/servicos';
import { getEmpresas } from '@/lib/actions/empresas';

export default async function ServicosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [servicos, empresas, tipos] = await Promise.all([
    getServicos(),
    getEmpresas(),
    getTiposServico()
  ]);

  return (
    <div className="min-h-screen bg-verde-50">
      <Header title="Serviços" />

      <main className="px-4 py-6 pb-28">
        <ServicosListClient
          initialServicos={(servicos as any) || []}
          empresas={empresas || []}
          tiposServico={tipos || []}
        />
      </main>

      <BottomNav />
    </div>
  );
}