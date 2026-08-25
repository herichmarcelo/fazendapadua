/**
 * Utilitários para tratamento de datas no fuso horário de Campo Grande / MS (GMT-4 / America/Campo_Grande)
 */

export const CAMPO_GRANDE_TIMEZONE = 'America/Campo_Grande';

export const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DIAS_SEMANA_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Retorna a data atual no fuso horário de Campo Grande (GMT-4) no formato 'YYYY-MM-DD'.
 */
export function getTodayCampoGrande(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: CAMPO_GRANDE_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // Formato YYYY-MM-DD
  } catch {
    // Fallback: cálculo manual UTC - 4 horas
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const msTime = new Date(utcTime - (4 * 3600000));
    const y = msTime.getFullYear();
    const m = String(msTime.getMonth() + 1).padStart(2, '0');
    const d = String(msTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/AAAA).
 */
export function formatISOToBR(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/**
 * Converte data no formato BR (DD/MM/AAAA) para ISO (YYYY-MM-DD).
 */
export function parseBRToISO(brDate: string): string {
  if (!brDate) return '';
  const cleaned = brDate.replace(/\D/g, '');
  if (cleaned.length < 8) return '';
  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);
  return `${year}-${month}-${day}`;
}
