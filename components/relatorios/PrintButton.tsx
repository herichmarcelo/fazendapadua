'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={isPrinting}
      className="print:hidden btn-primario"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer'
      }}
      title="Imprimir ou Salvar Relatório em PDF"
    >
      <Printer size={18} />
      <span>{isPrinting ? 'Preparando...' : 'Imprimir / Salvar PDF'}</span>
    </button>
  );
}
