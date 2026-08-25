'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const tipoServicoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_padrao_metro: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero'),
  unidade: z.string().min(1, 'Unidade é obrigatória').default('metro'),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

export async function criarTipoServico(data: z.infer<typeof tipoServicoSchema>) {
  const supabase = await createClient();
  const validated = tipoServicoSchema.parse(data);

  const { error } = await supabase.from('tipos_servico').insert({
    nome: validated.nome.toUpperCase(),
    preco_padrao_metro: validated.preco_padrao_metro,
    unidade: validated.unidade.toLowerCase(),
    descricao: validated.descricao || null,
    ativo: validated.ativo ?? true
  });

  if (error) throw new Error(error.message || 'Erro ao criar tipo de serviço');

  revalidatePath('/tipos-servico');
  revalidatePath('/servicos/novo');
  revalidatePath('/');
  return { success: true };
}

export async function atualizarTipoServico(id: string, data: z.infer<typeof tipoServicoSchema>) {
  const supabase = await createClient();
  const validated = tipoServicoSchema.parse(data);

  const { error } = await supabase.from('tipos_servico').update({
    nome: validated.nome.toUpperCase(),
    preco_padrao_metro: validated.preco_padrao_metro,
    unidade: validated.unidade.toLowerCase(),
    descricao: validated.descricao || null,
    ativo: validated.ativo ?? true
  }).eq('id', id);

  if (error) throw new Error(error.message || 'Erro ao atualizar tipo de serviço');

  revalidatePath('/tipos-servico');
  revalidatePath('/servicos/novo');
  revalidatePath('/');
  return { success: true };
}

export async function excluirTipoServico(id: string) {
  const supabase = await createClient();

  // Try hard delete first, fallback to soft delete if referenced by foreign key
  const { error: hardDeleteError } = await supabase.from('tipos_servico').delete().eq('id', id);

  if (hardDeleteError) {
    const { error: softDeleteError } = await supabase.from('tipos_servico').update({ ativo: false }).eq('id', id);
    if (softDeleteError) throw new Error(softDeleteError.message || 'Erro ao excluir tipo de serviço');
  }

  revalidatePath('/tipos-servico');
  revalidatePath('/servicos/novo');
  revalidatePath('/');
  return { success: true };
}

export async function getTiposServico() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tipos_servico').select('*').eq('ativo', true).order('nome');
  if (error) throw new Error(error.message || 'Erro ao buscar tipos de serviço');
  return data || [];
}

export async function getTipoServicoById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tipos_servico').select('*').eq('id', id).single();
  if (error) throw new Error(error.message || 'Erro ao buscar tipo de serviço');
  return data;
}
