'use client';

import { useState } from 'react';
import { Wrench, Plus, Edit2, Trash2, X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { criarTipoServico, atualizarTipoServico, excluirTipoServico } from '@/lib/actions/tipos-servico';
import { useRouter } from 'next/navigation';

export interface TipoServico {
  id: string;
  nome: string;
  preco_padrao_metro: number;
  unidade: string;
  descricao?: string | null;
  ativo?: boolean;
}

interface TiposServicoClientProps {
  initialTipos: TipoServico[];
}

export default function TiposServicoClient({ initialTipos }: TiposServicoClientProps) {
  const router = useRouter();
  const [tipos, setTipos] = useState<TipoServico[]>(initialTipos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoServico | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    unidade: 'metro',
    preco_padrao_metro: ''
  });

  const openCreateModal = () => {
    setEditingTipo(null);
    setFormData({
      nome: '',
      descricao: '',
      unidade: 'metro',
      preco_padrao_metro: ''
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (tipo: TipoServico) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao || '',
      unidade: tipo.unidade || 'metro',
      preco_padrao_metro: tipo.preco_padrao_metro?.toString() || '0'
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTipo(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const precoNumber = parseFloat(formData.preco_padrao_metro.replace(',', '.'));
    if (isNaN(precoNumber) || precoNumber < 0) {
      setError('Por favor, insira um valor válido maior ou igual a zero.');
      setSubmitting(false);
      return;
    }

    try {
      if (editingTipo) {
        await atualizarTipoServico(editingTipo.id, {
          nome: formData.nome,
          descricao: formData.descricao || undefined,
          unidade: formData.unidade,
          preco_padrao_metro: precoNumber,
          ativo: true
        });
        setSuccessMessage('Tipo de serviço atualizado com sucesso!');
      } else {
        await criarTipoServico({
          nome: formData.nome,
          descricao: formData.descricao || undefined,
          unidade: formData.unidade,
          preco_padrao_metro: precoNumber,
          ativo: true
        });
        setSuccessMessage('Tipo de serviço cadastrado com sucesso!');
      }

      router.refresh();
      closeModal();
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Erro ao salvar tipo de serviço';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o tipo de serviço "${nome}"?`)) {
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await excluirTipoServico(id);
      setTipos(prev => prev.filter(t => t.id !== id));
      setSuccessMessage('Tipo de serviço excluído com sucesso!');
      if (modalOpen) closeModal();
      router.refresh();
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Erro ao excluir tipo de serviço';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
      {/* Top action banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#009739',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Wrench size={26} />
            Tipos de Serviço
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#4B5563', marginTop: '0.25rem' }}>
            Gerencie os tipos de cerca, desmanches e valores padrão
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primario"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          <Plus size={18} />
          Novo Tipo
        </button>
      </div>

      {/* Success feedback alert */}
      {successMessage && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          padding: '0.875rem 1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Global error alert */}
      {error && !modalOpen && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          padding: '0.875rem 1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} color="#DC2626" />
          <span>{error}</span>
        </div>
      )}

      {/* List of service types */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {initialTipos && initialTipos.length > 0 ? (
          initialTipos.map((tipo) => (
            <div
              key={tipo.id}
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 245, 233, 0.95) 100%)',
                borderLeft: '4px solid #009739',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>
                    {tipo.nome}
                  </h3>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: tipo.unidade === 'unidade' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 151, 57, 0.15)',
                    color: tipo.unidade === 'unidade' ? '#1D4ED8' : '#006B2B'
                  }}>
                    {tipo.unidade === 'unidade' ? '📦 Unidade' : '📐 Metros'}
                  </span>
                </div>

                {tipo.descricao && (
                  <p style={{ fontSize: '0.875rem', color: '#4B5563', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
                    {tipo.descricao}
                  </p>
                )}

                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>VALOR PADRÃO:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#009739' }}>
                    {formatCurrency(tipo.preco_padrao_metro)}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>
                    / {tipo.unidade || 'metro'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => openEditModal(tipo)}
                  title="Editar serviço"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    background: 'white',
                    border: '1px solid #C8E6C9',
                    borderRadius: '0.5rem',
                    color: '#009739',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Edit2 size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(tipo.id, tipo.nome)}
                  title="Excluir serviço"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    background: 'white',
                    border: '1px solid #FECACA',
                    borderRadius: '0.5rem',
                    color: '#DC2626',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 245, 233, 0.95) 100%)'
          }}>
            <Wrench size={56} style={{ color: '#A5D6A7', marginBottom: '1rem' }} />
            <p style={{ color: '#4B5563', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Nenhum tipo de serviço cadastrado
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Cadastre tipos de serviço como Desmanche, Cerca Feita, Porteira, etc.
            </p>
            <button
              onClick={openCreateModal}
              className="btn-primario"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem'
              }}
            >
              <Plus size={20} />
              Cadastrar Primeiro Tipo
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog for Create & Edit */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '30rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '0.875rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#009739',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0
              }}>
                <Wrench size={22} />
                {editingTipo ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Error inside modal */}
            {error && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={20} color="#DC2626" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.375rem'
                }}>
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CERCA FEITA, DESMANCHE, PORTEIRA"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="input-field"
                  disabled={submitting}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.375rem'
                }}>
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cerca convencional 5 fios"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="input-field"
                  disabled={submitting}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Unidade de Medida *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, unidade: 'metro' }))}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      border: formData.unidade === 'metro' ? '2px solid #009739' : '2px solid #E5E7EB',
                      background: formData.unidade === 'metro' ? 'rgba(0, 151, 57, 0.08)' : 'white',
                      color: formData.unidade === 'metro' ? '#009739' : '#4B5563',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    📐 Metros (m)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, unidade: 'unidade' }))}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      border: formData.unidade === 'unidade' ? '2px solid #1D4ED8' : '2px solid #E5E7EB',
                      background: formData.unidade === 'unidade' ? 'rgba(29, 78, 216, 0.08)' : 'white',
                      color: formData.unidade === 'unidade' ? '#1D4ED8' : '#4B5563',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    📦 Unidade (un)
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.375rem'
                }}>
                  Preço / Valor Padrão (R$) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: '700',
                    color: '#009739',
                    fontSize: '1rem'
                  }}>
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.preco_padrao_metro}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_padrao_metro: e.target.value }))}
                    className="input-field"
                    style={{ paddingLeft: '3rem' }}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    color: '#4B5563',
                    cursor: 'pointer'
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-primario"
                  style={{
                    flex: 2,
                    padding: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                  }}
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
