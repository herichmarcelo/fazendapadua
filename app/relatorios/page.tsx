import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import FechamentoManager from '@/components/relatorios/FechamentoManager';
import { getTotaisPorEmpresa, getResumoFinanceiro, getServicos } from '@/lib/actions/servicos';
import { getEmpresas } from '@/lib/actions/empresas';

export const metadata: Metadata = {
  title: 'Fechamento de Equipes | Relatórios',
  description: 'Relatório de fechamento e extrato detalhado por empresa',
};

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [empresasData, totaisEmpresaData, resumoData, servicosData] = await Promise.all([
    getEmpresas(),
    getTotaisPorEmpresa(),
    getResumoFinanceiro(),
    getServicos({ apenasFechados: true })
  ]);

  return (
    <div style={{ minHeight: '100vh' }} className="print:bg-white">
      {/* Header oculto na impressão */}
      <div className="print:hidden">
        <Header title="Fechamento de Equipes" />
      </div>

      <main style={{ maxWidth: '64rem', margin: '0 auto', padding: '1.5rem 1rem 6rem' }} className="print:p-0 print:max-w-none">
        <FechamentoManager
          empresas={empresasData || []}
          totaisEmpresa={totaisEmpresaData || {}}
          resumoFinanceiro={resumoData || { total: 0, pendente: 0, pago: 0, em_andamento: 0 }}
          servicos={(servicosData as any) || []}
        />
      </main>

      {/* BottomNav oculto na impressão */}
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}