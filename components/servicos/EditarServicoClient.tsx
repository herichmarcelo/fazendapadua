'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { atualizarServico, excluirServico, getTiposServico } from '@/lib/actions/servicos';
import { getEmpresas } from '@/lib/actions/empresas';
import { formatCurrency } from '@/lib/utils';
import DatePickerBR from '@/components/ui/DatePickerBR';
import { DollarSign, Trash2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

interface EditarServicoClientProps {
  initialServico: {
    id: string;
    empresa_id: string;
    tipo_servico_id: string;
    data: string;
    metragem: number;
    preco_unitario: number;
    valor_total: number;
    observacoes?: string | null;
    local_servico?: string | null;
    status: string;
  };
  empresas: any[];
  tiposServico: any[];
}

export default function EditarServicoClient({
  initialServico,
  empresas,
  tiposServico
}: EditarServicoClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    empresa_id: initialServico.empresa_id || '',
    tipo_servico_id: initialServico.tipo_servico_id || '',
    data: initialServico.data || '',
    metragem: initialServico.metragem?.toString() || '',
    preco_unitario: initialServico.preco_unitario?.toString() || '',
    observacoes: initialServico.observacoes || '',
    local_servico: initialServico.local_servico || '',
    status: initialServico.status || 'pendente'
  });

  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    const metragem = parseFloat(formData.metragem) || 0;
    const precoUnitario = parseFloat(formData.preco_unitario) || 0;
    setCalculatedTotal(metragem * precoUnitario);
  }, [formData.metragem, formData.preco_unitario]);

  const handleTipoServicoChange = (value: string) => {
    const tipo = tiposServico.find(t => t.id === value);
    setFormData(prev => ({
      ...prev,
      tipo_servico_id: value,
      preco_unitario: prev.preco_unitario || (tipo?.preco_padrao_metro ? tipo.preco_padrao_metro.toString() : '')
    }));
  };

  const selectedTipo = tiposServico.find(t => t.id === formData.tipo_servico_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await atualizarServico(initialServico.id, {
        empresa_id: formData.empresa_id,
        tipo_servico_id: formData.tipo_servico_id,
        data: formData.data,
        metragem: parseFloat(formData.metragem),
        preco_unitario: parseFloat(formData.preco_unitario),
        observacoes: formData.observacoes || undefined,
        local_servico: formData.local_servico || undefined,
        status: formData.status as any
      });

      router.push('/servicos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar serviço');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      await excluirServico(initialServico.id);
      router.push('/servicos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir serviço');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-verde-50">
      <Header title="Editar Serviço" />

      <main style={{ maxWidth: '36rem', margin: '0 auto', padding: '1.25rem 1rem 6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#009739',
              fontWeight: '700',
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#DC2626',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={15} />
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          {/* Empresa */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
              Empresa / Equipe *
            </label>
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

          {/* Tipo de Serviço */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
              Tipo de Serviço *
            </label>
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

          {/* Data com DatePickerBR */}
          <div>
            <DatePickerBR
              label="Data do Serviço"
              value={formData.data}
              onChange={(val) => setFormData(prev => ({ ...prev, data: val }))}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
              Status do Serviço *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="input-field"
              style={{ fontWeight: '600' }}
              required
            >
              <option value="pendente">⏳ Pendente de Conferência</option>
              <option value="em_andamento">🔄 Em Execução (Não entra no relatório)</option>
              <option value="concluido">📋 Finalizado (Aguardando Fechamento)</option>
              <option value="fechado">🔒 Fechado • Liberado no Relatório</option>
              <option value="pago">💰 Pago com NF (Liberado no Relatório)</option>
            </select>
          </div>

          {/* Metragem / Quantidade */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
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

          {/* Preço Unitário */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
              Preço Unitário (R$) *
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={formData.preco_unitario}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_unitario: e.target.value }))}
                placeholder="0.00"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Local do Serviço */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
              Local do Serviço
            </label>
            <input
              type="text"
              value={formData.local_servico}
              onChange={(e) => setFormData(prev => ({ ...prev, local_servico: e.target.value }))}
              placeholder="Ex: Fazenda Cabrines - Piquete 4"
              className="input-field"
            />
          </div>

          {/* Observações */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
              Observações
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Detalhes ou anotações adicionais..."
            />
          </div>

          {/* Totalizador em Tempo Real */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 151, 57, 0.08) 0%, rgba(0, 107, 43, 0.15) 100%)',
            border: '1px solid #C8E6C9',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <p style={{ fontSize: '0.8rem', color: '#4B5563', fontWeight: '600', margin: 0 }}>
              Valor Total Calculado:
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: '900', color: '#009739', margin: '0.2rem 0 0' }}>
              {formatCurrency(calculatedTotal)}
            </p>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primario"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '700'
              }}
            >
              <Save size={18} />
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secundario"
              style={{ padding: '0.75rem', textAlign: 'center' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div className="card" style={{ maxWidth: '24rem', width: '100%', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', margin: 0 }}>
              Excluir Serviço?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.5rem 0 1.25rem' }}>
              Esta ação removerá este lançamento de serviço do sistema. Deseja continuar?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secundario"
                style={{ flex: 1, padding: '0.625rem' }}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1,
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.625rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
