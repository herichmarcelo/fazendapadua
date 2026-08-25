export interface Empresa {
  id: string
  razao_social: string
  nome: string
  cnpj?: string
  contato?: string
  nome_proprietario?: string
  ativo: boolean
  created_at: string
}

export interface TipoServico {
  id: string
  nome: string
  preco_padrao_metro: number
  unidade: string
  descricao?: string
  ativo: boolean
}

export interface Servico {
  id: string
  empresa_id: string
  tipo_servico_id: string
  data: string
  metragem: number
  preco_unitario: number
  valor_total: number
  observacoes?: string
  local_servico?: string
  status: 'pendente' | 'em_andamento' | 'concluido' | 'pago'
  fotos?: string[]
  created_at: string
  empresas?: Empresa
  tipos_servico?: TipoServico
}

export interface Pagamento {
  id: string
  empresa_id: string
  valor: number
  data_pagamento: string
  forma_pagamento?: string
  comprovante_url?: string
  observacoes?: string
  created_at: string
}