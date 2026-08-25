'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { excluirServico, fecharServicoParaPagamento } from '@/lib/actions/servicos';
import DatePickerBR from '@/components/ui/DatePickerBR';
import { getTodayCampoGrande } from '@/lib/date-utils';
import { 
  Building2, 
  Calendar, 
  Edit3, 
  Trash2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Activity,
  AlertTriangle,
  CreditCard,
  X,
  FileCheck,
  Check
} from 'lucide-react';

export interface ServicoItemProps {
  id: string;
  data: string;
  metragem: number;
  preco_unitario?: number;
  valor_total: number;
  status: string;
  local_servico?: string | null;
  observacoes?: string | null;
  empresas?: { id?: string; nome: string };
  tipos_servico?: { id?: string; nome: string; unidade?: string; preco_padrao_metro?: number };
}

export default function ServicoCard({
  servico,
  onDeleted,
  onStatusUpdated
}: {
  servico: ServicoItemProps;
  onDeleted?: (id: string) => void;
  onStatusUpdated?: (id: string, newStatus: string) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFecharModal, setShowFecharModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);

  // Estados do Modal de Fechamento
  const [dataPagamento, setDataPagamento] = useState(getTodayCampoGrande());
  const [confirmado, setConfirmado] = useState(false);
  const [fecharError, setFecharError] = useState('');

  const statusConfig = {
    pendente: {
      label: 'Pendente de Conferência',
      shortLabel: 'Pendente',
      bg: 'rgba(239, 68, 68, 0.1)',
      text: '#DC2626',
      border: 'rgba(239, 68, 68, 0.25)',
      icon: Clock,
      liberadoRelatorio: false
    },
    em_andamento: {
      label: 'Em Execução',
      shortLabel: 'Em Execução',
      bg: 'rgba(37, 99, 235, 0.1)',
      text: '#2563EB',
      border: 'rgba(37, 99, 235, 0.25)',
      icon: Activity,
      liberadoRelatorio: false
    },
    concluido: {
      label: 'Finalizado (Aguardando Fechamento)',
      shortLabel: 'Finalizado',
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#D97706',
      border: 'rgba(245, 158, 11, 0.25)',
      icon: Clock,
      liberadoRelatorio: false
    },
    fechado: {
      label: 'Fechado',
      shortLabel: 'Fechado (Aguardando NF)',
      bg: 'rgba(0, 151, 57, 0.12)',
      text: '#009739',
      border: 'rgba(0, 151, 57, 0.3)',
      icon: CheckCircle2,
      liberadoRelatorio: true
    },
    pago: {
      label: 'Pago',
      shortLabel: 'Pago',
      bg: 'rgba(0, 151, 57, 0.18)',
      text: '#006B2B',
      border: 'rgba(0, 151, 57, 0.4)',
      icon: CheckCircle2,
      liberadoRelatorio: true
    }
  };

  const isFechado = servico.status === 'fechado' || servico.status === 'pago';
  const isPago = servico.status === 'pago';
  const currentStatus = statusConfig[servico.status as keyof typeof statusConfig] || statusConfig.pendente;
  const StatusIcon = currentStatus.icon;
  const isUnidade = servico.tipos_servico?.unidade === 'unidade';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await excluirServico(servico.id);
      if (onDeleted) {
        onDeleted(servico.id);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir serviço');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleConfirmarFechamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmado) {
      setFecharError('Por favor, confirme que conferiu o serviço antes de fechar.');
      return;
    }

    setClosing(true);
    setFecharError('');

    try {
      await fecharServicoParaPagamento(servico.id, {
        data_fechamento: dataPagamento,
        observacoes: `Fechamento validado para ${servico.empresas?.nome || 'Empresa'}`
      });

      setShowFecharModal(false);
      if (onStatusUpdated) {
        onStatusUpdated(servico.id, 'fechado');
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setFecharError(err.message || 'Erro ao processar fechamento');
      setClosing(false);
    }
  };

  return (
    <>
      <div 
        className="card"
        style={{
          padding: '1.125rem',
          borderRadius: '1rem',
          background: 'white',
          border: isPago ? '1px solid #C8E6C9' : '1px solid #E5E7EB',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          position: 'relative',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        {/* Cabeçalho do Card: Empresa e Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '0.625rem',
              background: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#009739'
            }}>
              <Building2 size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: '800',
                color: '#111827',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {servico.empresas?.nome || 'Empresa não identificada'}
              </h3>
              {servico.local_servico && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  margin: '0.1rem 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <MapPin size={12} style={{ color: '#009739' }} />
                  <span>{servico.local_servico}</span>
                </p>
              )}
            </div>
          </div>

          {/* Badge de Status */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.3rem 0.625rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: currentStatus.bg,
            color: currentStatus.text,
            border: `1px solid ${currentStatus.border}`,
            flexShrink: 0
          }}>
            <StatusIcon size={13} />
            {currentStatus.shortLabel}
          </span>
        </div>

        {/* Tipo de Serviço e Data */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0.75rem',
          background: '#F9FAFB',
          borderRadius: '0.625rem',
          border: '1px solid #F3F4F6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#009739' }}>
              {servico.tipos_servico?.nome || 'Serviço'}
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#4B5563'
          }}>
            <Calendar size={13} style={{ color: '#009739' }} />
            {formatDate(servico.data)}
          </div>
        </div>

        {/* Valores e Metragem */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          paddingTop: '0.25rem'
        }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
              {isUnidade ? 'Quantidade' : 'Metragem'}
            </p>
            <p style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', margin: '0.15rem 0 0' }}>
              {formatNumber(servico.metragem, 1)} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6B7280' }}>{isUnidade ? 'un' : 'm'}</span>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
              Valor Total
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: '900', color: '#009739', margin: '0.15rem 0 0' }}>
              {formatCurrency(servico.valor_total)}
            </p>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL: FECHAR SERVIÇO */}
        {!isFechado ? (
          <button
            type="button"
            onClick={() => {
              setConfirmado(false);
              setFecharError('');
              setShowFecharModal(true);
            }}
            className="btn-primario"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              marginTop: '0.25rem',
              boxShadow: '0 2px 8px rgba(0, 151, 57, 0.25)'
            }}
          >
            <CreditCard size={17} />
            <span>Fechar para Pagamento</span>
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.5rem',
            background: 'rgba(0, 151, 57, 0.08)',
            border: '1px solid rgba(0, 151, 57, 0.3)',
            borderRadius: '0.75rem',
            color: '#006B2B',
            fontSize: '0.8rem',
            fontWeight: '800'
          }}>
            <CheckCircle2 size={16} />
            <span>🔒 Fechado • Liberado no Relatório</span>
          </div>
        )}

        {/* Botões Secundários: Editar e Excluir */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #F3F4F6'
        }}>
          <Link
            href={`/servicos/${servico.id}/edit`}
            className="btn-secundario"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            <Edit3 size={14} />
            <span>Editar</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: '0.75rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Excluir Serviço"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: FECHAMENTO DE SERVIÇO PARA PAGAMENTO */}
      {/* ========================================================================= */}
      {showFecharModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 60
        }}>
          <div className="card" style={{
            maxWidth: '28rem',
            width: '100%',
            padding: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'white',
            borderRadius: '1.25rem'
          }}>
            {/* Cabeçalho do Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '0.75rem',
                  background: 'rgba(0, 151, 57, 0.12)',
                  color: '#009739',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                    Fechar para Pagamento
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.1rem 0 0' }}>
                    Confirmação de medição e liberação financeira
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFecharModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Resumo Detalhado dos Dados do Serviço */}
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '0.875rem',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Empresa / Equipe:</span>
                <span style={{ fontWeight: '800', color: '#111827' }}>{servico.empresas?.nome}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Tipo de Serviço:</span>
                <span style={{ fontWeight: '700', color: '#009739' }}>{servico.tipos_servico?.nome}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Data do Serviço:</span>
                <span style={{ fontWeight: '700', color: '#111827' }}>{formatDate(servico.data)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>{isUnidade ? 'Quantidade:' : 'Metragem:'}</span>
                <span style={{ fontWeight: '800', color: '#111827' }}>
                  {formatNumber(servico.metragem, 1)} {isUnidade ? 'un' : 'm'}
                </span>
              </div>

              {servico.preco_unitario !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>Preço Unitário:</span>
                  <span style={{ fontWeight: '600', color: '#4B5563' }}>{formatCurrency(servico.preco_unitario)}</span>
                </div>
              )}

              {servico.local_servico && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>Local:</span>
                  <span style={{ fontWeight: '600', color: '#4B5563' }}>{servico.local_servico}</span>
                </div>
              )}

              <div style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111827' }}>Valor a Pagar:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#009739' }}>
                  {formatCurrency(servico.valor_total)}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmarFechamento} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fecharError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {fecharError}
                </div>
              )}

              {/* Nota Explicativa */}
              <div style={{
                background: 'rgba(0, 151, 57, 0.08)',
                border: '1px solid rgba(0, 151, 57, 0.25)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                fontSize: '0.78rem',
                color: '#006B2B',
                lineHeight: '1.4'
              }}>
                <strong>📌 Validação do Serviço:</strong> Ao clicar em &quot;Fechar para Pagamento&quot;, o serviço passa a ser considerado <strong>VÁLIDO</strong>, entrando nos relatórios de serviços e liberado no controle financeiro.
              </div>

              {/* Data do Fechamento */}
              <div>
                <DatePickerBR
                  label="Data da Conferência / Fechamento"
                  value={dataPagamento}
                  onChange={(val) => setDataPagamento(val)}
                  required
                />
              </div>

              {/* Checkbox de Confirmação */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                cursor: 'pointer',
                background: confirmado ? 'rgba(0, 151, 57, 0.08)' : '#F9FAFB',
                border: confirmado ? '1px solid #009739' : '1px solid #E5E7EB',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s'
              }}>
                <input
                  type="checkbox"
                  checked={confirmado}
                  onChange={(e) => setConfirmado(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#009739', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: confirmado ? '#006B2B' : '#374151', lineHeight: '1.3' }}>
                  Conferi a execução deste serviço e confirmo o fechamento para pagamento e relatórios.
                </span>
              </label>

              {/* Botões de Ação do Modal */}
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowFecharModal(false)}
                  className="btn-secundario"
                  style={{ flex: 1, padding: '0.65rem' }}
                  disabled={closing}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={closing || !confirmado}
                  className="btn-primario"
                  style={{
                    flex: 1.6,
                    padding: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    opacity: !confirmado ? 0.6 : 1,
                    cursor: !confirmado ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Check size={18} />
                  <span>{closing ? 'Fechando...' : 'Fechar para Pagamento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ========================================================================= */}
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
          zIndex: 60
        }}>
          <div className="card" style={{ maxWidth: '22rem', width: '100%', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.875rem'
            }}>
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
              Excluir este Serviço?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.5rem 0 1.25rem' }}>
              Deseja realmente excluir o lançamento de <strong>{servico.tipos_servico?.nome}</strong> para <strong>{servico.empresas?.nome}</strong> ({formatCurrency(servico.valor_total)})?
            </p>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secundario"
                style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem' }}
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
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}