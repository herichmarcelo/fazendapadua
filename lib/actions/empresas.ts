'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const empresaSchema = z.object({
  razao_social: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  nome_proprietario: z.string().optional(),
  ativo: z.boolean().default(true),
});

export async function criarEmpresa(data: z.infer<typeof empresaSchema>) {
  const supabase = await createClient();
  const validated = empresaSchema.parse(data);
  const telefone = validated.contato || validated.telefone || '';

  const fullPayload: Record<string, any> = {
    nome: validated.nome,
    razao_social: validated.razao_social || validated.nome,
    cnpj: validated.cnpj || null,
    contato: telefone || null,
    telefone: telefone || null,
    nome_proprietario: validated.nome_proprietario || null,
    ativo: validated.ativo ?? true
  };

  const { error: fullError } = await supabase.from('empresas').insert(fullPayload);
  
  if (fullError) {
    if (fullError.code === 'PGRST204' || fullError.message?.includes('column')) {
      const basicPayload = {
        nome: validated.nome,
        telefone: telefone || null,
        ativo: validated.ativo ?? true
      };
      const { error: basicError } = await supabase.from('empresas').insert(basicPayload);
      if (basicError) throw new Error(basicError.message || 'Erro ao cadastrar empresa');
    } else {
      throw new Error(fullError.message || 'Erro ao cadastrar empresa');
    }
  }
  
  revalidatePath('/empresas');
  revalidatePath('/');
  return { success: true };
}

export async function atualizarEmpresa(id: string, data: z.infer<typeof empresaSchema>) {
  const supabase = await createClient();
  const validated = empresaSchema.parse(data);
  const telefone = validated.contato || validated.telefone || '';

  const fullPayload: Record<string, any> = {
    nome: validated.nome,
    razao_social: validated.razao_social || validated.nome,
    cnpj: validated.cnpj || null,
    contato: telefone || null,
    telefone: telefone || null,
    nome_proprietario: validated.nome_proprietario || null,
    ativo: validated.ativo ?? true
  };

  const { error: fullError } = await supabase.from('empresas').update(fullPayload).eq('id', id);
  
  if (fullError) {
    if (fullError.code === 'PGRST204' || fullError.message?.includes('column')) {
      const basicPayload = {
        nome: validated.nome,
        telefone: telefone || null,
        ativo: validated.ativo ?? true
      };
      const { error: basicError } = await supabase.from('empresas').update(basicPayload).eq('id', id);
      if (basicError) throw new Error(basicError.message || 'Erro ao atualizar empresa');
    } else {
      throw new Error(fullError.message || 'Erro ao atualizar empresa');
    }
  }
  
  revalidatePath('/empresas');
  revalidatePath('/');
  return { success: true };
}

export async function excluirEmpresa(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('empresas').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Erro ao excluir empresa');
  
  revalidatePath('/empresas');
  revalidatePath('/');
  return { success: true };
}

export async function getEmpresas() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('empresas').select('*').eq('ativo', true).order('nome');
  if (error) throw new Error(error.message || 'Erro ao buscar empresas');
  return (data || []).map(e => ({
    ...e,
    razao_social: e.razao_social || e.nome,
    contato: e.contato || e.telefone || '',
  }));
}

export async function getEmpresaById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('empresas').select('*').eq('id', id).single();
  if (error) throw new Error(error.message || 'Erro ao buscar empresa');
  return {
    ...data,
    razao_social: data.razao_social || data.nome,
    contato: data.contato || data.telefone || '',
  };
}