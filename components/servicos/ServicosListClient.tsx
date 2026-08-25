'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ServicoCard, { ServicoItemProps } from '@/components/servicos/ServicoCard';
import { Plus, Search, Filter, Layers, DollarSign, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ServicosListClient({
  initialServicos,
  empresas,
  tiposServico
}: {
  initialServicos: ServicoItemProps[];
  empresas: any[];
  tiposServico: any[];
}) {
  const [servicosList, setServicosList] = useState<ServicoItemProps[]>(initialServicos);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleDeleted = (deletedId: string) => {
    setServicosList(prev => prev.filter(s => s.id !== deletedId));
  };

  const handleStatusUpdated = (id: string, newStatus: string) => {
    setServicosList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const filteredServicos = useMemo(() => {
    return servicosList.filter(s => {
      const matchSearch = !searchTerm || 
        s.empresas?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tipos_servico?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.local_servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEmpresa = selectedEmpresa === 'all' || s.empresas?.id === selectedEmpresa || (s as any).empresa_id === selectedEmpresa;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchSearch && matchEmpresa && matchStatus;
    });
  }, [servicosList, searchTerm, selectedEmpresa, selectedStatus]);

  const totalFiltrado = useMemo(() => {
    return filteredServicos.reduce((acc, s) => acc + (Number(s.valor_total) || 0), 0);
  }, [filteredServicos]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '40rem', margin: '0 auto' }}>
      {/* Barra de Busca e Filtros Rápidos */}
      <div className="card" style={{ padding: '1rem', background: 'white' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, tipo, local..."
              className="input-field"
              style={{ paddingLeft: '2.5rem', paddingRight: '0.75rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', fontSize: '0.875rem' }}
            />
          </div>

          <Link
            href="/servicos/novo"
            className="btn-primario"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Plus size={18} />
            <span>+ Novo</span>
          </Link>
        </div>

        {/* Filtros em Pílulas / Selects */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            className="input-field"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: '600' }}
          >
            <option value="all">Todas as Empresas</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: '600' }}
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">⏳ Pendente de Conferência</option>
            <option value="em_andamento">🔄 Em Execução</option>
            <option value="concluido">📋 Finalizado</option>
            <option value="fechado">🔒 Fechado • Liberado no Relatório</option>
            <option value="pago">💰 Pago com NF</option>
          </select>
        </div>
      </div>

      {/* Resumo Rápido de Serviços Filtrados */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0.5rem'
      }}>
        <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4B5563', margin: 0 }}>
          {filteredServicos.length} {filteredServicos.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
        </p>
        <p style={{ fontSize: '0.95rem', fontWeight: '800', color: '#009739', margin: 0 }}>
          Total: {formatCurrency(totalFiltrado)}
        </p>
      </div>

      {/* Lista de Cards Modernos */}
      {filteredServicos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredServicos.map((servico) => (
            <ServicoCard
              key={servico.id}
              servico={servico}
              onDeleted={handleDeleted}
              onStatusUpdated={handleStatusUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'white' }}>
          <Layers size={48} style={{ color: '#9CA3AF', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
            Nenhum serviço encontrado
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.5rem 0 1.25rem' }}>
            {searchTerm || selectedEmpresa !== 'all' || selectedStatus !== 'all'
              ? 'Tente limpar os filtros para ver outros lançamentos.'
              : 'Comece adicionando o primeiro serviço realizado.'}
          </p>

          <Link href="/servicos/novo" className="btn-primario" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <Plus size={18} />
            <span>Adicionar Serviço</span>
          </Link>
        </div>
      )}
    </div>
  );
}
