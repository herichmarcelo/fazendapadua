'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import { criarServico, getTiposServico } from '@/lib/actions/servicos'
import { getEmpresas } from '@/lib/actions/empresas'
import { formatCurrency } from '@/lib/utils'
import { getTodayCampoGrande } from '@/lib/date-utils'
import DatePickerBR from '@/components/ui/DatePickerBR'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function NovoServicoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [empresas, setEmpresas] = useState<any[]>([])
  const [tiposServico, setTiposServico] = useState<any[]>([])

  const [formData, setFormData] = useState({
    empresa_id: '',
    tipo_servico_id: '',
    data: getTodayCampoGrande(),
    metragem: '',
    preco_unitario: '',
    observacoes: '',
    local_servico: '',
    status: 'pendente'
  })

  const [calculatedTotal, setCalculatedTotal] = useState(0)

  useEffect(() => {
    async function loadData() {
      const [empresasData, tiposData] = await Promise.all([
        getEmpresas(),
        getTiposServico()
      ])
      setEmpresas(empresasData || [])
      setTiposServico(tiposData || [])
    }
    loadData()
  }, [])

  useEffect(() => {
    const metragem = parseFloat(formData.metragem) || 0
    const precoUnitario = parseFloat(formData.preco_unitario) || 0
    setCalculatedTotal(metragem * precoUnitario)
  }, [formData.metragem, formData.preco_unitario])

  const handleTipoServicoChange = (value: string) => {
    const tipo = tiposServico.find(t => t.id === value)
    setFormData(prev => ({
      ...prev,
      tipo_servico_id: value,
      preco_unitario: tipo?.preco_padrao_metro ? tipo.preco_padrao_metro.toString() : ''
    }))
  }

  const selectedTipo = tiposServico.find(t => t.id === formData.tipo_servico_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await criarServico({
        empresa_id: formData.empresa_id,
        tipo_servico_id: formData.tipo_servico_id,
        data: formData.data,
        metragem: parseFloat(formData.metragem),
        preco_unitario: parseFloat(formData.preco_unitario),
        observacoes: formData.observacoes,
        local_servico: formData.local_servico,
        status: formData.status as any
      })

      router.push('/servicos')
    } catch (error: any) {
      setError(error.message || 'Erro ao criar serviço')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-verde-50">
      <Header title="Novo Serviço" />
      
      <main className="px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Empresa *</label>
            <select
              value={formData.empresa_id}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa_id: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Serviço *</label>
            <select
              value={formData.tipo_servico_id}
              onChange={(e) => handleTipoServicoChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Selecione um tipo</option>
              {tiposServico.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome} - {formatCurrency(tipo.preco_padrao_metro)}/{tipo.unidade || 'metro'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <DatePickerBR
              label="Data do Serviço"
              value={formData.data}
              onChange={(val) => setFormData(prev => ({ ...prev, data: val }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {selectedTipo?.unidade === 'unidade' ? 'Quantidade (unidades) *' : 'Metragem (metros) *'}
            </label>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={formData.metragem}
              onChange={(e) => setFormData(prev => ({ ...prev, metragem: e.target.value }))}
              placeholder={selectedTipo?.unidade === 'unidade' ? 'Ex: 1, 2, 5' : '0.00'}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Preço Unitário (R$) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={formData.preco_unitario}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_unitario: e.target.value }))}
                placeholder="0.00"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Local do Serviço</label>
            <input
              type="text"
              value={formData.local_servico}
              onChange={(e) => setFormData(prev => ({ ...prev, local_servico: e.target.value }))}
              placeholder="Ex: Fazenda Cabrines - Setor Norte"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Observações</label>
            <textarea
              className="input-field min-h-[100px]"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Detalhes adicionais sobre o serviço..."
            />
          </div>

          {/* Calculation Summary */}
          <div className="bg-verde-50 border border-verde-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Valor Total:</p>
            <p className="text-2xl font-bold text-verde-600">{formatCurrency(calculatedTotal)}</p>
          </div>

          <button type="submit" className="btn-primario w-full" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar Serviço'}
          </button>

          <button type="button" onClick={() => router.back()} className="btn-secundario w-full">
            Cancelar
          </button>
        </form>
      </main>
    </div>
  )
}