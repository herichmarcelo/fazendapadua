'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import {
  MESES_PT,
  DIAS_SEMANA_PT,
  getTodayCampoGrande,
  formatISOToBR,
  parseBRToISO
} from '@/lib/date-utils';

interface DatePickerBRProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function DatePickerBR({
  value,
  onChange,
  label = 'Data',
  required = false,
  disabled = false,
  className = ''
}: DatePickerBRProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Data de hoje em Campo Grande (GMT-4)
  const todayCampoGrande = getTodayCampoGrande();

  // Estado para visualização do mês/ano no calendário
  const [viewYear, setViewYear] = useState<number>(() => {
    if (value && value.includes('-')) {
      return parseInt(value.split('-')[0], 10);
    }
    return parseInt(todayCampoGrande.split('-')[0], 10);
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (value && value.includes('-')) {
      return parseInt(value.split('-')[1], 10) - 1;
    }
    return parseInt(todayCampoGrande.split('-')[1], 10) - 1;
  });

  // Texto digitável no formato DD/MM/AAAA
  const [displayValue, setDisplayValue] = useState<string>(() => formatISOToBR(value));

  useEffect(() => {
    setDisplayValue(formatISOToBR(value));
    if (value && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [value]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Navegar meses
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Selecionar dia
  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mm}-${dd}`;
    onChange(isoString);
    setIsOpen(false);
  };

  // Botão "Hoje (GMT-4 Campo Grande)"
  const handleSelectToday = () => {
    onChange(todayCampoGrande);
    const [y, m] = todayCampoGrande.split('-');
    setViewYear(parseInt(y, 10));
    setViewMonth(parseInt(m, 10) - 1);
    setIsOpen(false);
  };

  // Digitação manual com máscara
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 8) input = input.slice(0, 8);

    let formatted = '';
    if (input.length <= 2) {
      formatted = input;
    } else if (input.length <= 4) {
      formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    } else {
      formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    }

    setDisplayValue(formatted);

    if (input.length === 8) {
      const day = parseInt(input.slice(0, 2), 10);
      const month = parseInt(input.slice(2, 4), 10);
      const year = parseInt(input.slice(4, 8), 10);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(iso);
        setViewYear(year);
        setViewMonth(month - 1);
      }
    }
  };

  // Gerar dias da grade do mês
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Lista de anos para o select
  const currentYear = parseInt(todayCampoGrande.split('-')[0], 10);
  const yearsList = Array.from({ length: 15 }, (_, i) => currentYear - 7 + i);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} className={className}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.375rem'
        }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
          </label>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#006B2B',
            background: 'rgba(0, 151, 57, 0.1)',
            padding: '0.15rem 0.45rem',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Clock size={11} />
            GMT-4 Campo Grande
          </span>
        </div>
      )}

      {/* Input principal exibindo DD/MM/AAAA */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          required={required}
          disabled={disabled}
          className="input-field"
          style={{
            width: '100%',
            paddingRight: '2.75rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            letterSpacing: '0.025em'
          }}
        />

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: isOpen ? '#009739' : '#6B7280',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
            transition: 'color 0.2s'
          }}
          title="Abrir calendário em Português"
        >
          <CalendarIcon size={20} />
        </button>
      </div>

      {/* Popover do Calendário em Português */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 50,
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
          border: '1px solid #C8E6C9',
          padding: '1rem',
          width: '100%',
          minWidth: '290px',
          maxWidth: '340px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Cabeçalho do calendário (Mês / Ano + Navegação) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.875rem'
          }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '0.5rem',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#374151'
              }}
              title="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                style={{
                  fontWeight: '700',
                  color: '#006B2B',
                  background: '#E8F5E9',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {MESES_PT.map((mes, idx) => (
                  <option key={mes} value={idx}>{mes}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                style={{
                  fontWeight: '700',
                  color: '#006B2B',
                  background: '#E8F5E9',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              style={{
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '0.5rem',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#374151'
              }}
              title="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dias da semana em PT-BR */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            marginBottom: '0.5rem',
            borderBottom: '1px solid #F3F4F6',
            paddingBottom: '0.375rem'
          }}>
            {DIAS_SEMANA_PT.map((dia, index) => (
              <span
                key={dia}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: index === 0 ? '#DC2626' : index === 6 ? '#006B2B' : '#6B7280'
                }}
              >
                {dia}
              </span>
            ))}
          </div>

          {/* Grade de dias */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            textAlign: 'center'
          }}>
            {/* Dias do mês anterior apagados */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const prevDayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  style={{
                    padding: '0.5rem 0',
                    fontSize: '0.8rem',
                    color: '#D1D5DB',
                    userSelect: 'none'
                  }}
                >
                  {prevDayNum}
                </div>
              );
            })}

            {/* Dias do mês atual */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const currentIso = `${viewYear}-${mm}-${dd}`;
              
              const isSelected = value === currentIso;
              const isToday = todayCampoGrande === currentIso;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    padding: '0.45rem 0',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '700' : isToday ? '700' : '500',
                    background: isSelected
                      ? 'linear-gradient(135deg, #009739 0%, #006B2B 100%)'
                      : isToday
                      ? '#E8F5E9'
                      : 'transparent',
                    color: isSelected
                      ? 'white'
                      : isToday
                      ? '#009739'
                      : '#1F2937',
                    border: isToday && !isSelected ? '1.5px solid #009739' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 3px 8px rgba(0, 151, 57, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F0FDF4';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isToday ? '#E8F5E9' : 'transparent';
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Rodapé: Botão Hoje e Fechar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.875rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              type="button"
              onClick={handleSelectToday}
              style={{
                background: '#E8F5E9',
                color: '#006B2B',
                border: '1px solid #A5D6A7',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              📅 Hoje ({formatISOToBR(todayCampoGrande)})
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                color: '#6B7280',
                border: 'none',
                padding: '0.35rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
