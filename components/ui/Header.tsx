'use client';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'linear-gradient(135deg, #009739 0%, #006B2B 100%)',
      color: 'white',
      boxShadow: '0 4px 20px rgba(0, 151, 57, 0.3)',
      padding: '0.75rem 1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <button style={{
          padding: '0.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '0.5rem',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          <Menu size={24} />
        </button>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          flex: 1,
          textAlign: 'center'
        }}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <Search size={20} />
          </button>
          <button style={{
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              width: '0.5rem',
              height: '0.5rem',
              background: '#FFD700',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)'
            }}></span>
          </button>
          <button onClick={handleLogout} style={{
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}