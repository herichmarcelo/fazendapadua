import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getServicoById, getTiposServico } from '@/lib/actions/servicos';
import { getEmpresas } from '@/lib/actions/empresas';
import EditarServicoClient from '@/components/servicos/EditarServicoClient';

export default async function EditarServicoPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

  const [servico, empresas, tiposServico] = await Promise.all([
    getServicoById(id).catch(() => null),
    getEmpresas().catch(() => []),
    getTiposServico().catch(() => [])
  ]);

  if (!servico) {
    notFound();
  }

  return (
    <EditarServicoClient
      initialServico={servico}
      empresas={empresas || []}
      tiposServico={tiposServico || []}
    />
  );
}