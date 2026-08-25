import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import PagamentosClient from '@/components/pagamentos/PagamentosClient';
import { getControleFinanceiroCompleto } from '@/lib/actions/pagamentos';

export const metadata: Metadata = {
  title: 'Controle de Pagamentos & Financeiro | CercasApp',
  description: 'Controle financeiro oficial, histórico de pagamentos e quitações',
};

export default async function PagamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { demonstrativoEmpresas, resumoGeral, historicoPagamentos } = await getControleFinanceiroCompleto();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Financeiro & Pagamentos" />

      <main style={{
        flex: 1,
        maxWidth: '56rem',
        width: '100%',
        margin: '0 auto',
        padding: '1.25rem 1rem 6rem'
      }}>
        <PagamentosClient
          demonstrativoEmpresas={demonstrativoEmpresas}
          resumoGeral={resumoGeral}
          historicoPagamentos={historicoPagamentos}
        />
      </main>

      <BottomNav />
    </div>
  );
}