'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, PlusCircle, BarChart3, MoreHorizontal } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/servicos', label: 'Serviços', icon: ClipboardList },
  { href: '/servicos/novo', label: 'Novo', icon: PlusCircle, highlight: true },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/mais', label: 'Mais', icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%)',
      borderTop: '2px solid #009739',
      backdropFilter: 'blur(10px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
      boxShadow: '0 -4px 20px rgba(0, 151, 57, 0.15)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '4rem',
        padding: '0 0.5rem'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.highlight) {
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '-1.5rem',
                textDecoration: 'none'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #009739 0%, #006B2B 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '1rem',
                  boxShadow: '0 4px 20px rgba(0, 151, 57, 0.4)',
                  transition: 'all 0.3s ease',
                  border: '3px solid white'
                }}>
                  <Icon size={28} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#009739',
                  fontWeight: '600',
                  marginTop: '0.25rem'
                }}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive ? '#009739' : '#6B7280',
              transition: 'all 0.2s'
            }}>
              <Icon size={24} />
              <span style={{
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                fontWeight: isActive ? '600' : '400'
              }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}