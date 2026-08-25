'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm('Deseja realmente sair da sua conta?')) return;

    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao sair. Tente novamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: '#FEF2F2',
        border: '1.5px solid #FECACA',
        borderRadius: '1rem',
        padding: '1rem 1.125rem',
        cursor: isLoggingOut ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.06)'
      }}
    >
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '0.75rem',
        background: '#FEE2E2',
        color: '#DC2626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <LogOut size={22} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: '700',
          color: '#991B1B',
          margin: 0
        }}>
          {isLoggingOut ? 'Saindo da conta...' : 'Sair da Conta'}
        </h3>
        <p style={{
          fontSize: '0.8rem',
          color: '#B91C1C',
          margin: '0.15rem 0 0'
        }}>
          Encerrar sessão no dispositivo
        </p>
      </div>

      {isLoggingOut ? (
        <Loader2 size={20} className="animate-spin" style={{ color: '#DC2626' }} />
      ) : (
        <div style={{
          padding: '0.35rem 0.65rem',
          borderRadius: '0.5rem',
          background: 'rgba(220, 38, 38, 0.1)',
          color: '#DC2626',
          fontSize: '0.75rem',
          fontWeight: '700'
        }}>
          Sair
        </div>
      )}
    </button>
  );
}
