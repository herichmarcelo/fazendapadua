'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Receipt, 
  FileText, 
  Search, 
  ChevronDown, 
  ChevronUp,
  X,
  History,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { registrarPagamento, excluirPagamento, PagamentoInput } from '@/lib/actions/pagamentos';
import DatePickerBR from '@/components/ui/DatePickerBR';
import { getTodayCampoGrande, formatISOToBR } from '@/lib/date-utils';

interface EmpresaDemonstrativo {
  empresaId: string;
  empresaNome: string;
  empresaRazaoSocial: string;
  empresaContato: string;
  totalDevido: number;
  totalPago: number;
  saldoRestante: number;
  statusPagamento: 'nao_pago' | 'parcial' | 'pago';
  percentualPago: number;
  qtdServicos: number;
  metragemTotal: number;
  servicos: any[];
  pagamentos: any[];
}

interface ResumoGeral {
  totalDevido: number;
  totalPago: number;
  saldoRestante: number;
  totalServicos: number;
  totalMetragem: number;
}

interface PagamentosClientProps {
  demonstrativoEmpresas: EmpresaDemonstrativo[];
  resumoGeral: ResumoGeral;
  historicoPagamentos: any[];
}

export default function PagamentosClient({
  demonstrativoEmpresas,
  resumoGeral,
  historicoPagamentos,
}: PagamentosClientProps) {
  const router = useRouter();
  const [tabAtiva, setTabAtiva] = useState<'empresas' | 'historico'>('empresas');
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'nao_pago' | 'parcial' | 'pago'>('all');
  const [buscaTexto, setBuscaTexto] = useState('');
  
  // Accordion de empresas abertas
  const [expandedEmpresaId, setExpandedEmpresaId] = useState<string | null>(null);

  // Estado do Modal de Pagamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
  const [valorPagamento, setValorPagamento] = useState<string>('');
  const [dataPagamento, setDataPagamento] = useState<string>(getTodayCampoGrande());
  const [formaPagamento, setFormaPagamento] = useState<string>('PIX');
  const [observacoes, setObservacoes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Formatação de Moeda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Abre modal para empresa específica
  const handleOpenModal = (empresaId?: string) => {
    setErrorMessage('');
    const targetEmpresaId = empresaId || (demonstrativoEmpresas[0]?.empresaId || '');
    setSelectedEmpresaId(targetEmpresaId);
    
    // Sugere o saldo devedor da empresa se houver
    const targetEmp = demonstrativoEmpresas.find(e => e.empresaId === targetEmpresaId);
    if (targetEmp && targetEmp.saldoRestante > 0) {
      setValorPagamento(targetEmp.saldoRestante.toFixed(2));
    } else {
      setValorPagamento('');
    }

    setDataPagamento(getTodayCampoGrande());
    setFormaPagamento('PIX');
    setObservacoes('');
    setIsModalOpen(true);
  };

  // Ao mudar de empresa no modal, atualiza o saldo sugerido
  const handleEmpresaChangeInModal = (empId: string) => {
    setSelectedEmpresaId(empId);
    const targetEmp = demonstrativoEmpresas.find(e => e.empresaId === empId);
    if (targetEmp && targetEmp.saldoRestante > 0) {
      setValorPagamento(targetEmp.saldoRestante.toFixed(2));
    }
  };

  // Submissão do Pagamento
  const handleSubmitPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numValor = parseFloat(valorPagamento.replace(',', '.'));
    if (isNaN(numValor) || numValor <= 0) {
      setErrorMessage('Informe um valor de pagamento válido maior que R$ 0,00');
      return;
    }

    if (!selectedEmpresaId) {
      setErrorMessage('Selecione uma empresa');
      return;
    }

    setIsLoading(true);
    try {
      await registrarPagamento({
        empresa_id: selectedEmpresaId,
        valor: numValor,
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        observacoes: observacoes.trim() || undefined,
      });

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('Erro ao salvar pagamento:', err);
      setErrorMessage(err.message || 'Erro ao registrar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir pagamento com confirmação
  const handleDeletePagamento = async (id: string, valor: number, empresaNome: string) => {
    const confirm = window.confirm(
      `Deseja realmente estornar/excluir o pagamento de ${formatCurrency(valor)} para ${empresaNome}?`
    );
    if (!confirm) return;

    try {
      await excluirPagamento(id);
      router.refresh();
    } catch (err: any) {
      alert('Erro ao excluir pagamento: ' + err.message);
    }
  };

  // Filtros aplicados às empresas
  const empresasFiltradas = demonstrativoEmpresas.filter((emp) => {
    const matchTexto = 
      emp.empresaNome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      emp.empresaRazaoSocial.toLowerCase().includes(buscaTexto.toLowerCase());
    
    const matchStatus = filtroStatus === 'all' || emp.statusPagamento === filtroStatus;
    return matchTexto && matchStatus;
  });

  // Filtros aplicados ao histórico
  const historicoFiltrado = historicoPagamentos.filter((pag) => {
    const nomeEmp = pag.empresas?.nome || '';
    const matchTexto = 
      nomeEmp.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (pag.observacoes && pag.observacoes.toLowerCase().includes(buscaTexto.toLowerCase())) ||
      (pag.forma_pagamento && pag.forma_pagamento.toLowerCase().includes(buscaTexto.toLowerCase()));
    
    return matchTexto;
  });

  const selectedEmpresaObj = demonstrativoEmpresas.find(e => e.empresaId === selectedEmpresaId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ========================================================== */}
      {/* 1. CABEÇALHO DO MÓDULO FINANCEIRO */}
      {/* ========================================================== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Landmark size={26} style={{ color: '#009739' }} />
            Controle de Pagamentos & Financeiro
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.2rem 0 0' }}>
            Gestão oficial de quitações das empresas com serviços fechados
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="btn-primario"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.125rem',
            fontSize: '0.875rem',
            fontWeight: '700'
          }}
        >
          <Plus size={18} />
          <span>Registrar Pagamento</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* 2. CARDS DE RESUMO FINANCEIRO (RESPONSIVO 2x2 NO MOBILE / 4x1 NO DESKTOP) */}
      {/* ========================================================== */}
      <div className="relatorio-summary-grid">
        {/* Total Produção Fechada (Devido) */}
        <div className="card" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #111827',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#4B5563',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0
          }}>
            Produção Fechada (Devido)
          </p>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#111827',
            margin: '0.35rem 0 0'
          }}>
            {formatCurrency(resumoGeral.totalDevido)}
          </p>
        </div>

        {/* Total Já Pago */}
        <div className="card" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #009739',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#009739',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0
          }}>
            Total Já Pago
          </p>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#009739',
            margin: '0.35rem 0 0'
          }}>
            {formatCurrency(resumoGeral.totalPago)}
          </p>
        </div>

        {/* Saldo Restante a Pagar */}
        <div className="card" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #EA580C',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#EA580C',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0
          }}>
            Saldo Restante a Pagar
          </p>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#EA580C',
            margin: '0.35rem 0 0'
          }}>
            {formatCurrency(resumoGeral.saldoRestante)}
          </p>
        </div>

        {/* Total de Pagamentos Realizados */}
        <div className="card" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #2563EB',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#2563EB',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0
          }}>
            Lançamentos Realizados
          </p>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#111827',
            margin: '0.35rem 0 0'
          }}>
            {historicoPagamentos.length} <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B7280' }}>pagamentos</span>
          </p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. NAVEGAÇÃO ENTRE ABAS (DEMONSTRATIVO vs HISTÓRICO) */}
      {/* ========================================================== */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: '#E5E7EB',
        padding: '0.35rem',
        borderRadius: '0.875rem'
      }}>
        <button
          type="button"
          onClick={() => setTabAtiva('empresas')}
          style={{
            flex: 1,
            padding: '0.65rem',
            borderRadius: '0.625rem',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            background: tabAtiva === 'empresas' ? 'white' : 'transparent',
            color: tabAtiva === 'empresas' ? '#111827' : '#6B7280',
            boxShadow: tabAtiva === 'empresas' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Building2 size={18} />
          <span>Por Empresa / Prestador</span>
        </button>

        <button
          type="button"
          onClick={() => setTabAtiva('historico')}
          style={{
            flex: 1,
            padding: '0.65rem',
            borderRadius: '0.625rem',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            background: tabAtiva === 'historico' ? 'white' : 'transparent',
            color: tabAtiva === 'historico' ? '#111827' : '#6B7280',
            boxShadow: tabAtiva === 'historico' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <History size={18} />
          <span>Histórico de Pagamentos ({historicoPagamentos.length})</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* 4. BARRA DE BUSCA E FILTROS */}
      {/* ========================================================== */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Campo de Busca */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Buscar por nome da empresa ou observação..."
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem', height: '42px' }}
          />
        </div>

        {/* Filtro de Status Financeiro (Apenas na aba de empresas) */}
        {tabAtiva === 'empresas' && (
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="input-field"
            style={{ width: 'auto', minWidth: '180px', height: '42px', fontSize: '0.85rem', fontWeight: '600' }}
          >
            <option value="all">Todas as Situações</option>
            <option value="nao_pago">🔴 Não Pago (0%)</option>
            <option value="parcial">🟡 Parcialmente Pago</option>
            <option value="pago">🟢 Totalmente Quitado</option>
          </select>
        )}
      </div>

      {/* ========================================================== */}
      {/* 5. CONTEÚDO DA ABA: POR EMPRESA */}
      {/* ========================================================== */}
      {tabAtiva === 'empresas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {empresasFiltradas.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#6B7280' }}>
              <Building2 size={40} style={{ margin: '0 auto 0.75rem', color: '#9CA3AF' }} />
              <p style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Nenhuma empresa encontrada com os filtros selecionados</p>
            </div>
          ) : (
            empresasFiltradas.map((emp) => {
              const isExpanded = expandedEmpresaId === emp.empresaId;

              // Cor e Badge de Status Financeiro
              let badgeColor = '#DC2626';
              let badgeBg = '#FEF2F2';
              let statusLabel = 'Não Pago (0%)';

              if (emp.statusPagamento === 'pago') {
                badgeColor = '#006B2B';
                badgeBg = '#E8F5E9';
                statusLabel = 'Totalmente Quitado (100%)';
              } else if (emp.statusPagamento === 'parcial') {
                badgeColor = '#D97706';
                badgeBg = '#FEF3C7';
                statusLabel = `Parcial (${emp.percentualPago}%)`;
              }

              return (
                <div
                  key={emp.empresaId}
                  className="card"
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    border: '1px solid #E5E7EB',
                    borderLeft: `4px solid ${emp.statusPagamento === 'pago' ? '#009739' : emp.statusPagamento === 'parcial' ? '#D97706' : '#DC2626'}`,
                    padding: '1.125rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Cabeçalho da Empresa */}
                  <div className="empresa-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '0.75rem',
                        background: 'rgba(0, 151, 57, 0.1)',
                        color: '#009739',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Building2 size={24} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                            {emp.empresaNome}
                          </h3>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: badgeColor,
                            background: badgeBg,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px'
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.775rem', color: '#6B7280', margin: '0.2rem 0 0' }}>
                          {emp.qtdServicos} {emp.qtdServicos === 1 ? 'serviço validado' : 'serviços validados'} • {emp.pagamentos.length} {emp.pagamentos.length === 1 ? 'pagamento registrado' : 'pagamentos registrados'}
                        </p>
                      </div>
                    </div>

                    {/* Ação de Registrar Pagamento */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(emp.empresaId)}
                        className="btn-primario"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.5rem 0.875rem',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <DollarSign size={16} />
                        <span>Pagar</span>
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progresso de Quitação */}
                  <div style={{ marginTop: '0.875rem', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#4B5563', marginBottom: '0.3rem' }}>
                      <span>Progresso Financeiro</span>
                      <span>{emp.percentualPago}% Quitado</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${emp.percentualPago}%`,
                        height: '100%',
                        background: emp.percentualPago >= 100 ? '#009739' : emp.percentualPago > 0 ? '#D97706' : '#E5E7EB',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Grade de 3 Valores Financeiros */}
                  <div className="empresa-card-grid" style={{
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: '0.75rem'
                  }}>
                    <div>
                      <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
                        Produção Fechada
                      </p>
                      <p style={{ fontSize: '1.05rem', fontWeight: '900', color: '#111827', margin: '0.2rem 0 0' }}>
                        {formatCurrency(emp.totalDevido)}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#006B2B', textTransform: 'uppercase', margin: 0 }}>
                        Total Já Pago
                      </p>
                      <p style={{ fontSize: '1.05rem', fontWeight: '900', color: '#009739', margin: '0.2rem 0 0' }}>
                        {formatCurrency(emp.totalPago)}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.68rem', fontWeight: '700', color: '#EA580C', textTransform: 'uppercase', margin: 0 }}>
                        Saldo a Pagar
                      </p>
                      <p style={{ fontSize: '1.05rem', fontWeight: '900', color: '#EA580C', margin: '0.2rem 0 0' }}>
                        {formatCurrency(emp.saldoRestante)}
                      </p>
                    </div>
                  </div>

                  {/* Botão de Expandir Detalhes / Extrato da Empresa */}
                  <div style={{ marginTop: '0.875rem', borderTop: '1px dashed #E5E7EB', paddingTop: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedEmpresaId(isExpanded ? null : emp.empresaId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#009739',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span>{isExpanded ? 'Ocultar Detalhes da Empresa' : 'Ver Extrato de Serviços e Pagamentos'}</span>
                    </button>
                  </div>

                  {/* DETALHES EXPANDIDOS: Serviços Fechados + Pagamentos */}
                  {isExpanded && (
                    <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', animation: 'fadeIn 0.2s ease-out' }}>
                      {/* Subseção 1: Serviços Fechados */}
                      <div style={{ background: '#F9FAFB', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #E5E7EB' }}>
                        <h4 style={{ fontSize: '0.825rem', fontWeight: '800', color: '#374151', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FileText size={15} style={{ color: '#009739' }} />
                          Serviços Fechados & Validados ({emp.servicos.length})
                        </h4>
                        {emp.servicos.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Nenhum serviço fechado no momento.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {emp.servicos.map((serv: any) => (
                              <div key={serv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', padding: '0.35rem 0', borderBottom: '1px solid #F3F4F6' }}>
                                <div>
                                  <strong>{serv.tipos_servico?.nome || 'Serviço'}</strong> • {formatISOToBR(serv.data)}
                                  {serv.local_servico && <span style={{ color: '#6B7280' }}> ({serv.local_servico})</span>}
                                </div>
                                <span style={{ fontWeight: '800', color: '#111827' }}>
                                  {formatCurrency(serv.valor_total)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Subseção 2: Pagamentos Realizados */}
                      <div style={{ background: '#F0FDF4', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #BBF7D0' }}>
                        <h4 style={{ fontSize: '0.825rem', fontWeight: '800', color: '#006B2B', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Receipt size={15} style={{ color: '#009739' }} />
                          Histórico de Pagamentos Desta Empresa ({emp.pagamentos.length})
                        </h4>
                        {emp.pagamentos.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Nenhum pagamento registrado ainda para esta empresa.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {emp.pagamentos.map((pag: any) => (
                              <div key={pag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', padding: '0.35rem 0', borderBottom: '1px solid #DCFCE7' }}>
                                <div>
                                  <span style={{ fontWeight: '700', color: '#006B2B' }}>{formatISOToBR(pag.data_pagamento)}</span>
                                  <span style={{ color: '#4B5563' }}> • {pag.forma_pagamento || 'Transferência'}</span>
                                  {pag.observacoes && <span style={{ color: '#6B7280', fontStyle: 'italic' }}> - {pag.observacoes}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: '900', color: '#009739' }}>
                                    {formatCurrency(pag.valor)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePagamento(pag.id, pag.valor, emp.empresaNome)}
                                    style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.2rem' }}
                                    title="Estornar/Excluir lançamento"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. CONTEÚDO DA ABA: HISTÓRICO GERAL DE PAGAMENTOS */}
      {/* ========================================================== */}
      {tabAtiva === 'historico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {historicoFiltrado.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#6B7280' }}>
              <Receipt size={40} style={{ margin: '0 auto 0.75rem', color: '#9CA3AF' }} />
              <p style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Nenhum pagamento registrado ainda</p>
              <p style={{ fontSize: '0.8rem', margin: '0.35rem 0 0' }}>Clique em &quot;Registrar Pagamento&quot; para fazer o primeiro lançamento financeiro.</p>
            </div>
          ) : (
            historicoFiltrado.map((pag) => (
              <div
                key={pag.id}
                className="card"
                style={{
                  background: 'white',
                  borderRadius: '0.875rem',
                  padding: '1rem',
                  border: '1px solid #E5E7EB',
                  borderLeft: '4px solid #009739',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {pag.empresas?.nome || 'Empresa'}
                    </h4>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#006B2B',
                      background: '#E8F5E9',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px'
                    }}>
                      {pag.forma_pagamento || 'Transferência'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.775rem', color: '#6B7280', margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} />
                    <span>Pago em {formatISOToBR(pag.data_pagamento)}</span>
                  </p>

                  {pag.observacoes && (
                    <p style={{ fontSize: '0.75rem', color: '#4B5563', margin: '0.25rem 0 0', fontStyle: 'italic' }}>
                      &quot;{pag.observacoes}&quot;
                    </p>
                  )}
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block' }}>Valor Pago</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#009739' }}>
                      {formatCurrency(pag.valor)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePagamento(pag.id, pag.valor, pag.empresas?.nome || 'Empresa')}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '0.5rem',
                      color: '#DC2626',
                      padding: '0.45rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Estornar / Excluir Pagamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 7. MODAL DE REGISTRO DE PAGAMENTO */}
      {/* ========================================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1.25rem',
            maxWidth: '32rem',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #E5E7EB'
          }}>
            {/* Header do Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              borderBottom: '1px solid #F3F4F6',
              background: 'linear-gradient(135deg, #009739 0%, #006B2B 100%)',
              color: 'white',
              borderTopLeftRadius: '1.25rem',
              borderTopRightRadius: '1.25rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'white' }}>
                  Registrar Pagamento
                </h3>
                <p style={{ fontSize: '0.75rem', margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.85)' }}>
                  Lançamento oficial no controle financeiro
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmitPagamento} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {errorMessage && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Selecionar Empresa */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                  Empresa / Prestador *
                </label>
                <select
                  value={selectedEmpresaId}
                  onChange={(e) => handleEmpresaChangeInModal(e.target.value)}
                  className="input-field"
                  required
                  style={{ fontWeight: '600' }}
                >
                  <option value="">Selecione uma empresa...</option>
                  {demonstrativoEmpresas.map((emp) => (
                    <option key={emp.empresaId} value={emp.empresaId}>
                      {emp.empresaNome} (Saldo a Pagar: {formatCurrency(emp.saldoRestante)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Caixa de Informação do Saldo da Empresa */}
              {selectedEmpresaObj && (
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '700' }}>Fechado</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111827', margin: '0.1rem 0 0' }}>
                      {formatCurrency(selectedEmpresaObj.totalDevido)}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#006B2B', textTransform: 'uppercase', fontWeight: '700' }}>Já Pago</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#009739', margin: '0.1rem 0 0' }}>
                      {formatCurrency(selectedEmpresaObj.totalPago)}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#EA580C', textTransform: 'uppercase', fontWeight: '700' }}>Saldo Devedor</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: '900', color: '#EA580C', margin: '0.1rem 0 0' }}>
                      {formatCurrency(selectedEmpresaObj.saldoRestante)}
                    </p>
                  </div>
                </div>
              )}

              {/* Valor do Pagamento */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#374151', margin: 0 }}>
                    Valor do Pagamento (R$) *
                  </label>
                  {selectedEmpresaObj && selectedEmpresaObj.saldoRestante > 0 && (
                    <button
                      type="button"
                      onClick={() => setValorPagamento(selectedEmpresaObj.saldoRestante.toFixed(2))}
                      style={{
                        background: '#E8F5E9',
                        color: '#006B2B',
                        border: '1px solid #A5D6A7',
                        borderRadius: '0.375rem',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Pagar Saldo Total ({formatCurrency(selectedEmpresaObj.saldoRestante)})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  placeholder="0,00"
                  className="input-field"
                  required
                  style={{ fontSize: '1.25rem', fontWeight: '900', color: '#009739' }}
                />
              </div>

              {/* Data do Pagamento com DatePickerBR */}
              <div>
                <DatePickerBR
                  label="Data do Pagamento"
                  value={dataPagamento}
                  onChange={(val) => setDataPagamento(val)}
                  required
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                  Forma de Pagamento
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="input-field"
                  style={{ fontWeight: '600' }}
                >
                  <option value="PIX">PIX</option>
                  <option value="Transferência Bancária (TED/DOC)">Transferência Bancária (TED/DOC)</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Dinheiro / Espécie">Dinheiro / Espécie</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Observações / NF */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.35rem' }}>
                  Observações / Número da Nota Fiscal (NF)
                </label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: NF 1042 - Quitação de cerca do retiro..."
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Botões do Modal */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                  className="btn-secundario"
                  style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', fontWeight: '700' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primario"
                  style={{ flex: 2, padding: '0.75rem', fontSize: '0.9rem', fontWeight: '800' }}
                >
                  {isLoading ? 'Registrando...' : 'Confirmar Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
