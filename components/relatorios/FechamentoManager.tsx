'use client';

import { useState, useMemo } from 'react';
import { 
  Building2, 
  Printer, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  Activity, 
  FileText, 
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { getTodayCampoGrande, formatISOToBR } from '@/lib/date-utils';

export interface Empresa {
  id: string;
  nome: string;
  razao_social?: string;
  cnpj?: string;
  contato?: string;
  nome_proprietario?: string;
}

export interface ServicoItem {
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
  empresas?: { id?: string; nome: string };
  tipos_servico?: { nome: string; preco_padrao_metro?: number; unidade?: string };
}

interface FechamentoManagerProps {
  empresas: Empresa[];
  totaisEmpresa: Record<string, { metragem: number; valor: number; pendente: number; pago: number; count: number }>;
  resumoFinanceiro: { total: number; pendente: number; pago: number; em_andamento: number };
  servicos: ServicoItem[];
}

export default function FechamentoManager({
  empresas,
  totaisEmpresa,
  resumoFinanceiro,
  servicos
}: FechamentoManagerProps) {
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPrinting, setIsPrinting] = useState(false);

  const todayCG = getTodayCampoGrande();
  const dataFormatadaHoje = formatISOToBR(todayCG);

  // Empresa atualmente selecionada
  const selectedEmpresa = useMemo(() => {
    if (selectedEmpresaId === 'all') return null;
    return empresas.find(e => e.id === selectedEmpresaId) || null;
  }, [selectedEmpresaId, empresas]);

  // Serviços filtrados pela empresa e status
  const filteredServicos = useMemo(() => {
    return servicos.filter(s => {
      const matchEmpresa = selectedEmpresaId === 'all' || s.empresa_id === selectedEmpresaId;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchEmpresa && matchStatus;
    });
  }, [servicos, selectedEmpresaId, statusFilter]);

  // Cálculos consolidados para a visualização atual
  const currentStats = useMemo(() => {
    if (selectedEmpresaId === 'all' && statusFilter === 'all') {
      return resumoFinanceiro;
    }
    
    const initial = { total: 0, pendente: 0, pago: 0, em_andamento: 0, metragem: 0, count: 0 };
    return filteredServicos.reduce((acc, s) => {
      const v = Number(s.valor_total) || 0;
      acc.total += v;
      acc.metragem += Number(s.metragem) || 0;
      acc.count += 1;
      if (s.status === 'pago') {
        acc.pago += v;
      } else {
        acc.pendente += v;
      }
      return acc;
    }, initial);
  }, [selectedEmpresaId, statusFilter, resumoFinanceiro, filteredServicos]);

  const handlePrint = (empresaIdToPrint?: string) => {
    if (empresaIdToPrint) {
      setSelectedEmpresaId(empresaIdToPrint);
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ========================================================== */}
      {/* 1. BARRA DE FILTROS & AÇÕES (Oculto na impressão) */}
      {/* ========================================================== */}
      <div className="card print:hidden" style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        background: 'white',
        border: '1px solid #C8E6C9'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: '#009739',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0
            }}>
              <FileText size={22} />
              Fechamento de Equipes & Relatórios
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.25rem 0 0' }}>
              Selecione uma empresa para gerar o fechamento individual ou imprima o geral
            </p>
          </div>

          <button
            type="button"
            onClick={() => handlePrint()}
            disabled={isPrinting}
            className="btn-primario"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(0, 151, 57, 0.35)'
            }}
          >
            <Printer size={20} />
            <span>{isPrinting ? 'Preparando PDF...' : 'Imprimir / Gerar PDF'}</span>
          </button>
        </div>

        {/* Filtros em Linha */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #F3F4F6'
        }}>
          {/* Seletor de Empresa */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#374151',
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}>
              Filtrar por Empresa / Equipe:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedEmpresaId}
                onChange={(e) => setSelectedEmpresaId(e.target.value)}
                className="input-field"
                style={{
                  fontWeight: '600',
                  color: selectedEmpresaId === 'all' ? '#009739' : '#111827',
                  fontSize: '0.95rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">🏢 Todas as Empresas (Fechamento Geral)</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 {emp.nome} {emp.razao_social && emp.razao_social !== emp.nome ? `(${emp.razao_social})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seletor de Status */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#374151',
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}>
              Filtrar por Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ fontWeight: '600', fontSize: '0.95rem' }}
            >
              <option value="all">Todos os Fechamentos (Pagos e A Pagar)</option>
              <option value="fechado">🔒 Saldo a Pagar (Fechados Pendentes)</option>
              <option value="pago">✅ Já Pagos (100% Liquidados)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. CABEÇALHO OFICIAL DO DOCUMENTO DE IMPRESSÃO (Com Logo Pluma) */}
      {/* ========================================================== */}
      <div style={{
        display: 'none',
        borderBottom: '2px solid #000000',
        paddingBottom: '1.25rem',
        marginBottom: '1.75rem'
      }} className="print:block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Logo Pluma */}
            <img
              src="/pluma.png"
              alt="Logo Pluma"
              style={{
                width: '75px',
                height: '75px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div>
              {selectedEmpresa ? (
                <div>
                  <p style={{
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    color: '#374151',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    FECHAMENTO DE EQUIPE:
                  </p>
                  <h1 style={{
                    fontSize: '1.45rem',
                    fontWeight: '900',
                    color: '#000000',
                    margin: '0.2rem 0 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    lineHeight: '1.2'
                  }}>
                    {selectedEmpresa.nome}
                  </h1>
                </div>
              ) : (
                <h1 style={{
                  fontSize: '1.4rem',
                  fontWeight: '900',
                  color: '#000000',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  RELATÓRIO GERAL DE FECHAMENTO
                </h1>
              )}
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#4B5563', margin: '0.35rem 0 0' }}>
                FAZENDAS SANTO ANTÔNIO DE PÁDUA • CONTROLE DE CERCAS
              </p>
              {selectedEmpresa && selectedEmpresa.cnpj && (
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.25rem 0 0' }}>
                  CNPJ: {selectedEmpresa.cnpj} {selectedEmpresa.contato ? `| Contato: ${selectedEmpresa.contato}` : ''}
                </p>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: '170px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#000000', margin: 0, textTransform: 'uppercase' }}>
              DATA DE EMISSÃO:
            </p>
            <p style={{ fontSize: '1rem', fontWeight: '900', color: '#000000', margin: '0.15rem 0 0' }}>
              {dataFormatadaHoje}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: '0.1rem 0 0' }}>
              Fuso Horário GMT-4 (MS)
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. CARDS DE RESUMO FINANCEIRO (RESPONSIVO: 2x2 MOBILE / 4x1 DESKTOP & PRINT) */}
      {/* ========================================================== */}
      <div className="relatorio-summary-grid" style={{
        marginTop: '1.25rem',
        marginBottom: '1.5rem',
        width: '100%'
      }}>
        {/* Total Geral */}
        <div className="card break-inside-avoid" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #111827',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#4B5563',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Valor Total Bruto
          </p>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#111827',
            margin: '0.35rem 0 0'
          }} className="print:text-black">
            {formatCurrency(currentStats.total)}
          </p>
        </div>

        {/* Pago */}
        <div className="card break-inside-avoid" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #009739',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#009739',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Total Já Pago
          </p>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#009739',
            margin: '0.35rem 0 0'
          }} className="print:text-black">
            {formatCurrency(currentStats.pago)}
          </p>
        </div>

        {/* Pendente */}
        <div className="card break-inside-avoid" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #EA580C',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#EA580C',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Saldo a Pagar
          </p>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#EA580C',
            margin: '0.35rem 0 0'
          }} className="print:text-black">
            {formatCurrency(currentStats.pendente)}
          </p>
        </div>

        {/* Quantidade / Metragem */}
        <div className="card break-inside-avoid" style={{
          padding: '0.875rem 1rem',
          borderLeft: '4px solid #2563EB',
          borderRadius: '1rem',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#2563EB',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Total de Serviços
          </p>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#111827',
            margin: '0.35rem 0 0'
          }} className="print:text-black">
            {filteredServicos.length} <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B7280' }}>serviços</span>
          </p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 4. VISUALIZAÇÃO INDIVIDUAL: EXTRATO COMPLETO DE SERVIÇOS */}
      {/* ========================================================== */}
      {selectedEmpresaId !== 'all' ? (
        <div className="card break-inside-avoid" style={{
          padding: '1.5rem',
          background: 'white',
          border: '1px solid #D1D5DB'
        }} className="print:border-0 print:p-0">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Extrato de Medições e Serviços: {selectedEmpresa?.nome}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.2rem 0 0' }}>
                Detalhamento dos serviços executados para validação e fechamento
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedEmpresaId('all')}
              className="btn-secundario print:hidden"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              Ver Todas as Empresas
            </button>
          </div>

          {/* Tabela de Serviços da Empresa */}
          {filteredServicos.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151' }}>Data</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151' }}>Tipo de Serviço</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151' }}>Local / Obs</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151', textAlign: 'right' }}>Qtd / Metros</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151', textAlign: 'right' }}>Preço Unit.</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151', textAlign: 'right' }}>Total (R$)</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#374151', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServicos.map((serv, index) => (
                    <tr 
                      key={serv.id}
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        background: index % 2 === 0 ? 'white' : '#FAFAFA'
                      }}
                    >
                      <td style={{ padding: '0.625rem 0.5rem', fontWeight: '600', color: '#111827' }}>
                        {formatDate(serv.data)}
                      </td>
                      <td style={{ padding: '0.625rem 0.5rem', fontWeight: '700', color: '#009739' }}>
                        {serv.tipos_servico?.nome || 'Serviço'}
                      </td>
                      <td style={{ padding: '0.625rem 0.5rem', color: '#4B5563', fontSize: '0.8rem' }}>
                        {serv.local_servico || serv.observacoes || '-'}
                      </td>
                      <td style={{ padding: '0.625rem 0.5rem', textAlign: 'right', fontWeight: '600' }}>
                        {formatNumber(serv.metragem, 1)} {serv.tipos_servico?.unidade === 'unidade' ? 'un' : 'm'}
                      </td>
                      <td style={{ padding: '0.625rem 0.5rem', textAlign: 'right', color: '#6B7280' }}>
                        {formatCurrency(serv.preco_unitario)}
                      </td>
                      <td style={{ padding: '0.625rem 0.5rem', textAlign: 'right', fontWeight: '800', color: '#111827' }}>
                        {formatCurrency(serv.valor_total)}
                      </td>
                      <td style={{ padding: '0.625rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          background: serv.status === 'pago' ? '#DEF7EC' : '#FEF3C7',
                          color: serv.status === 'pago' ? '#03543F' : '#92400E'
                        }}>
                          {serv.status === 'pago' ? 'Pago' : 'Saldo a Pagar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#F3F4F6', borderTop: '2px solid #374151' }}>
                    <td colSpan={3} style={{ padding: '0.75rem 0.5rem', fontWeight: '800', color: '#111827' }}>
                      TOTAL GERAL DO FECHAMENTO:
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '800', color: '#111827' }}>
                      {formatNumber(filteredServicos.reduce((acc, s) => acc + Number(s.metragem || 0), 0), 1)}
                    </td>
                    <td></td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '900', fontSize: '1.05rem', color: '#009739' }} className="print:text-black">
                      {formatCurrency(filteredServicos.reduce((acc, s) => acc + Number(s.valor_total || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
              Nenhum serviço encontrado para esta empresa com os filtros selecionados.
            </div>
          )}
        </div>
      ) : (
        /* ========================================================== */
        /* 5. VISUALIZAÇÃO GERAL: CARDS CONSOLIDADOS POR EMPRESA */
        /* ========================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="print:hidden" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
              Fechamentos por Equipe ({Object.keys(totaisEmpresa).length} Empresas)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Clique em &quot;Imprimir Equipe&quot; para relatório individual
            </span>
          </div>

          {Object.entries(totaisEmpresa).map(([empresaNome, dados]) => {
            const empObj = empresas.find(e => e.nome.trim().toUpperCase() === empresaNome.trim().toUpperCase());
            const pagoPercent = dados.valor > 0 ? Math.round((dados.pago / dados.valor) * 100) : 0;

            return (
              <div
                key={empresaNome}
                className="card break-inside-avoid"
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderLeft: '4px solid #009739',
                  borderRadius: '1rem',
                  padding: '1.125rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Cabeçalho da Empresa */}
                <div className="empresa-card-header" style={{ marginBottom: '0.875rem' }}>
                  {/* Nome e Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '0.75rem',
                      background: 'rgba(0, 151, 57, 0.1)',
                      color: '#009739',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Building2 size={22} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{
                        fontSize: '1.05rem',
                        fontWeight: '800',
                        color: '#111827',
                        margin: 0,
                        wordBreak: 'break-word'
                      }}>
                        {empresaNome}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.15rem 0 0' }}>
                        {dados.count} {dados.count === 1 ? 'serviço executado' : 'serviços executados'}
                      </p>
                    </div>
                  </div>

                  {/* Valor e Botão Imprimir */}
                  <div className="empresa-card-stats">
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: '600' }}>
                        Total ({pagoPercent}% recebido):
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#009739' }} className="print:text-black">
                        {formatCurrency(dados.valor)}
                      </span>
                    </div>

                    {/* Botão de Fechamento Individual Desta Empresa */}
                    {empObj && (
                      <button
                        type="button"
                        onClick={() => handlePrint(empObj.id)}
                        className="btn-secundario print:hidden"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.5rem 0.875rem',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}
                        title={`Imprimir fechamento individual de ${empresaNome}`}
                      >
                        <Printer size={16} />
                        <span>Imprimir Fechamento</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grade de totais da empresa (2x2 no celular, 4x1 no desktop/print) */}
                <div className="empresa-card-grid" style={{
                  borderTop: '1px solid #F3F4F6',
                  paddingTop: '0.75rem'
                }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
                      Qtd. Serviços
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', margin: '0.2rem 0 0' }}>
                      {dados.count}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
                      Metragem Total
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', margin: '0.2rem 0 0' }}>
                      {formatNumber(dados.metragem, 1)} m
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#006B2B', textTransform: 'uppercase', margin: 0 }}>
                      Valor Pago
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: '800', color: '#006B2B', margin: '0.2rem 0 0' }} className="print:text-black">
                      {formatCurrency(dados.pago)}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#EA580C', textTransform: 'uppercase', margin: 0 }}>
                      Valor Pendente
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: '800', color: '#EA580C', margin: '0.2rem 0 0' }} className="print:text-black">
                      {formatCurrency(dados.pendente)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. RODAPÉ DE ASSINATURAS (Aparece no final do PDF impresso) */}
      {/* ========================================================== */}
      <div style={{ display: 'none' }} className="print:block print:mt-12 print:pt-8 print:border-t print:border-black">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '2.5rem' }}></div>
            <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#000', margin: 0 }}>
              {selectedEmpresa ? selectedEmpresa.nome : 'Responsável pela Equipe'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#444', margin: 0 }}>
              Assinatura do Prestador de Serviços
            </p>
          </div>

          <div>
            <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '2.5rem' }}></div>
            <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#000', margin: 0 }}>
              Administração / Gestão Financeira
            </p>
            <p style={{ fontSize: '0.75rem', color: '#444', margin: 0 }}>
              Fazendas Santo Antônio de Pádua • {dataFormatadaHoje}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
