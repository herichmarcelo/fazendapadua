'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const servicoSchema = z.object({
  empresa_id: z.string().uuid(),
  tipo_servico_id: z.string().uuid(),
  data: z.string(),
  metragem: z.number().min(0.01),
  preco_unitario: z.number().min(0),
  observacoes: z.string().optional(),
  local_servico: z.string().optional(),
  status: z.enum(['pendente', 'em_andamento', 'concluido', 'fechado', 'pago']).default('pendente'),
});

export async function criarServico(data: z.infer<typeof servicoSchema>) {
  const supabase = await createClient();
  const validated = servicoSchema.parse(data);
  const valor_total = validated.metragem * validated.preco_unitario;
  
  const { error } = await supabase.from('servicos').insert({ ...validated, valor_total });
  if (error) throw error;
  
  revalidatePath('/servicos');
  revalidatePath('/relatorios');
  revalidatePath('/');
  return { success: true };
}

export async function getServicos(filtros?: { 
  empresa_id?: string; 
  tipo_servico_id?: string; 
  status?: string;
  apenasFechados?: boolean;
  data_inicio?: string; 
  data_fim?: string 
}) {
  const supabase = await createClient();
  let query = supabase.from('servicos').select(`*, empresas (nome), tipos_servico (nome, preco_padrao_metro, unidade)`).order('data', { ascending: false });
  
  if (filtros?.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
  if (filtros?.tipo_servico_id) query = query.eq('tipo_servico_id', filtros.tipo_servico_id);
  if (filtros?.status) query = query.eq('status', filtros.status);
  
  // REGRA FUNDAMENTAL: Apenas serviços fechados pelo capataz (fechado ou pago) entram nos relatórios
  if (filtros?.apenasFechados) {
    query = query.in('status', ['fechado', 'pago']);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTotaisPorEmpresa() {
  const supabase = await createClient();
  
  // REGRA FUNDAMENTAL:
  // 1. Produção/Relatório: Apenas serviços validados e fechados pelo capataz (status 'fechado' ou 'pago')
  // 2. Financeiro: Pagamentos reais realizados pelo setor financeiro na tabela 'pagamentos'
  const [{ data: servicos, error: sErr }, { data: pagamentos, error: pErr }] = await Promise.all([
    supabase
      .from('servicos')
      .select(`empresa_id, empresas (id, nome), valor_total, metragem, status`)
      .in('status', ['fechado', 'pago']),
    supabase
      .from('pagamentos')
      .select(`empresa_id, valor`)
  ]);

  if (sErr) throw sErr;
  if (pErr) console.error('Aviso: erro ao buscar pagamentos:', pErr);

  // Mapeia pagamentos acumulados por empresa_id
  const pagamentosPorEmpresaId: Record<string, number> = {};
  (pagamentos || []).forEach(p => {
    if (p.empresa_id) {
      pagamentosPorEmpresaId[p.empresa_id] = (pagamentosPorEmpresaId[p.empresa_id] || 0) + Number(p.valor || 0);
    }
  });

  const totais = (servicos || []).reduce((acc, servico: any) => {
    const empId = servico.empresa_id;
    const nome = (Array.isArray(servico.empresas) ? servico.empresas[0]?.nome : servico.empresas?.nome) || 'Sem nome';
    if (!acc[nome]) {
      const totalPagoEmpresa = empId ? (pagamentosPorEmpresaId[empId] || 0) : 0;
      acc[nome] = { 
        metragem: 0, 
        valor: 0, 
        pago: totalPagoEmpresa, 
        pendente: 0, 
        count: 0 
      };
    }
    acc[nome].metragem += Number(servico.metragem || 0);
    acc[nome].valor += Number(servico.valor_total || 0);
    acc[nome].count += 1;
    return acc;
  }, {} as Record<string, { metragem: number; valor: number; pendente: number; pago: number; count: number }>);

  // Calcula o saldo pendente = valor total produzido - total pago
  Object.keys(totais).forEach(nome => {
    const t = totais[nome];
    t.pendente = Math.max(0, t.valor - t.pago);
  });
  
  return totais;
}

export async function getResumoFinanceiro() {
  const supabase = await createClient();
  
  // REGRA FUNDAMENTAL:
  // - Produção Fechada: Todos os serviços com status fechado/pago
  // - Pagamentos Realizados: Soma da tabela pagamentos
  const [{ data: servicos, error: sErr }, { data: pagamentos, error: pErr }] = await Promise.all([
    supabase
      .from('servicos')
      .select('valor_total, status')
      .in('status', ['fechado', 'pago']),
    supabase
      .from('pagamentos')
      .select('valor')
  ]);

  if (sErr) throw sErr;
  if (pErr) console.error('Aviso ao buscar pagamentos no resumo:', pErr);

  const totalProducao = (servicos || []).reduce((acc, s) => acc + Number(s.valor_total || 0), 0);
  const totalPago = (pagamentos || []).reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const saldoPendente = Math.max(0, totalProducao - totalPago);

  return {
    total: totalProducao,
    pago: totalPago,
    pendente: saldoPendente,
    em_andamento: 0
  };
}

export async function getEmpresas() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('empresas').select('*').eq('ativo', true).order('nome');
  if (error) throw error;
  return data;
}

export async function getTiposServico() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tipos_servico').select('*').eq('ativo', true).order('nome');
  if (error) throw error;
  return data;
}

export async function getServicoById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('servicos')
    .select(`*, empresas (id, nome), tipos_servico (id, nome, preco_padrao_metro, unidade)`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarServico(id: string, data: z.infer<typeof servicoSchema>) {
  const supabase = await createClient();
  const validated = servicoSchema.parse(data);
  const valor_total = validated.metragem * validated.preco_unitario;
  
  const { error } = await supabase
    .from('servicos')
    .update({ ...validated, valor_total })
    .eq('id', id);
  if (error) throw error;
  
  revalidatePath('/servicos');
  revalidatePath('/relatorios');
  revalidatePath('/');
  return { success: true };
}

export async function excluirServico(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('servicos')
    .delete()
    .eq('id', id);
  if (error) throw error;
  
  revalidatePath('/servicos');
  revalidatePath('/relatorios');
  revalidatePath('/');
  return { success: true };
}

export async function fecharServicoParaPagamento(id: string, options?: {
  data_fechamento?: string;
  observacoes?: string;
}) {
  const supabase = await createClient();
  
  // 1. Obter dados do serviço
  const { data: servico, error: fetchErr } = await supabase
    .from('servicos')
    .select('*, empresas(id, nome)')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;

  // 2. O capataz fecha o serviço para liberação no relatório e posterior pagamento após NF
  const { error: updateErr } = await supabase
    .from('servicos')
    .update({ status: 'fechado' })
    .eq('id', id);
  if (updateErr) throw updateErr;

  revalidatePath('/servicos');
  revalidatePath('/relatorios');
  revalidatePath('/');
  return { success: true };
}