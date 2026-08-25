'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const pagamentoSchema = z.object({
  empresa_id: z.string().uuid('Selecione uma empresa válida'),
  valor: z.number().min(0.01, 'O valor do pagamento deve ser maior que zero'),
  data_pagamento: z.string().min(1, 'Informe a data do pagamento'),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
  comprovante_url: z.string().optional(),
});

export type PagamentoInput = z.infer<typeof pagamentoSchema>;

/**
 * Registra um novo pagamento (parcial ou total) para uma empresa
 */
export async function registrarPagamento(data: PagamentoInput) {
  const supabase = await createClient();
  const validated = pagamentoSchema.parse(data);

  const payload = {
    empresa_id: validated.empresa_id,
    valor: validated.valor,
    data_pagamento: validated.data_pagamento,
    forma_pagamento: validated.forma_pagamento || 'Transferência',
    observacoes: validated.observacoes || null,
    comprovante_url: validated.comprovante_url || null,
  };

  const { data: inserted, error } = await supabase
    .from('pagamentos')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw new Error(error.message || 'Erro ao registrar pagamento no banco de dados');
  }

  revalidatePath('/pagamentos');
  revalidatePath('/relatorios');
  revalidatePath('/servicos');
  revalidatePath('/');

  return { success: true, data: inserted };
}

/**
 * Exclui / Estorna um pagamento registrado
 */
export async function excluirPagamento(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pagamentos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir pagamento:', error);
    throw new Error(error.message || 'Erro ao excluir pagamento');
  }

  revalidatePath('/pagamentos');
  revalidatePath('/relatorios');
  revalidatePath('/servicos');
  revalidatePath('/');

  return { success: true };
}

/**
 * Busca o histórico de pagamentos com detalhes da empresa
 */
export async function getPagamentos(filtros?: {
  empresa_id?: string;
  data_inicio?: string;
  data_fim?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('pagamentos')
    .select(`
      *,
      empresas (id, nome, razao_social, contato)
    `)
    .order('data_pagamento', { ascending: false });

  if (filtros?.empresa_id && filtros.empresa_id !== 'all') {
    query = query.eq('empresa_id', filtros.empresa_id);
  }

  if (filtros?.data_inicio) {
    query = query.gte('data_pagamento', filtros.data_inicio);
  }

  if (filtros?.data_fim) {
    query = query.lte('data_pagamento', filtros.data_fim);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erro ao buscar pagamentos:', error);
    throw new Error(error.message || 'Erro ao carregar histórico de pagamentos');
  }

  return data || [];
}

/**
 * Consolida o Relatório Financeiro Completo:
 * Cruzamento entre Produção Validada/Fechada pelo Capataz vs Pagamentos Realizados pelo Financeiro
 */
export async function getControleFinanceiroCompleto() {
  const supabase = await createClient();

  const [{ data: empresas }, { data: servicosFechados }, { data: pagamentos }] = await Promise.all([
    supabase.from('empresas').select('*').eq('ativo', true).order('nome'),
    supabase.from('servicos').select('*, empresas(id, nome), tipos_servico(nome, unidade)').in('status', ['fechado', 'pago']),
    supabase.from('pagamentos').select('*, empresas(id, nome)').order('data_pagamento', { ascending: false }),
  ]);

  // Agrupa pagamentos por empresa_id
  const pagamentosPorEmpresa: Record<string, { totalPago: number; lista: any[] }> = {};
  (pagamentos || []).forEach((pag) => {
    const empId = pag.empresa_id;
    if (!pagamentosPorEmpresa[empId]) {
      pagamentosPorEmpresa[empId] = { totalPago: 0, lista: [] };
    }
    pagamentosPorEmpresa[empId].totalPago += Number(pag.valor || 0);
    pagamentosPorEmpresa[empId].lista.push(pag);
  });

  // Agrupa serviços fechados por empresa_id
  const servicosPorEmpresa: Record<string, { totalDevido: number; metragem: number; count: number; lista: any[] }> = {};
  (servicosFechados || []).forEach((serv) => {
    const empId = serv.empresa_id;
    if (!servicosPorEmpresa[empId]) {
      servicosPorEmpresa[empId] = { totalDevido: 0, metragem: 0, count: 0, lista: [] };
    }
    servicosPorEmpresa[empId].totalDevido += Number(serv.valor_total || 0);
    servicosPorEmpresa[empId].metragem += Number(serv.metragem || 0);
    servicosPorEmpresa[empId].count += 1;
    servicosPorEmpresa[empId].lista.push(serv);
  });

  // Monta demonstrativo consolidado por empresa
  const demonstrativoEmpresas = (empresas || []).map((emp) => {
    const servData = servicosPorEmpresa[emp.id] || { totalDevido: 0, metragem: 0, count: 0, lista: [] };
    const pagData = pagamentosPorEmpresa[emp.id] || { totalPago: 0, lista: [] };

    const totalDevido = servData.totalDevido;
    const totalPago = pagData.totalPago;
    const saldoRestante = Math.max(0, totalDevido - totalPago);

    let statusPagamento: 'nao_pago' | 'parcial' | 'pago' = 'nao_pago';
    if (totalDevido > 0) {
      if (totalPago >= totalDevido) {
        statusPagamento = 'pago';
      } else if (totalPago > 0) {
        statusPagamento = 'parcial';
      } else {
        statusPagamento = 'nao_pago';
      }
    } else if (totalPago > 0) {
      statusPagamento = 'pago';
    }

    const percentualPago = totalDevido > 0 ? Math.min(100, Math.round((totalPago / totalDevido) * 100)) : (totalPago > 0 ? 100 : 0);

    return {
      empresaId: emp.id,
      empresaNome: emp.nome,
      empresaRazaoSocial: emp.razao_social || emp.nome,
      empresaContato: emp.contato || '',
      totalDevido,
      totalPago,
      saldoRestante,
      statusPagamento,
      percentualPago,
      qtdServicos: servData.count,
      metragemTotal: servData.metragem,
      servicos: servData.lista,
      pagamentos: pagData.lista,
    };
  });

  // Totais Gerais
  const resumoGeral = demonstrativoEmpresas.reduce(
    (acc, emp) => {
      acc.totalDevido += emp.totalDevido;
      acc.totalPago += emp.totalPago;
      acc.saldoRestante += emp.saldoRestante;
      acc.totalServicos += emp.qtdServicos;
      acc.totalMetragem += emp.metragemTotal;
      return acc;
    },
    {
      totalDevido: 0,
      totalPago: 0,
      saldoRestante: 0,
      totalServicos: 0,
      totalMetragem: 0,
    }
  );

  return {
    demonstrativoEmpresas,
    resumoGeral,
    historicoPagamentos: pagamentos || [],
  };
}
