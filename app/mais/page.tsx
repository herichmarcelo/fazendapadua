import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { 
  Building2, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  FileText, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default async function MaisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Extrai nome amigável do email
  const userEmail = user.email || '';
  const userName = userEmail.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Mais Opções" />
      
      <main style={{
        flex: 1,
        maxWidth: '42rem',
        width: '100%',
        margin: '0 auto',
        padding: '1.25rem 1rem 6rem'
      }}>
        {/* ========================================================== */}
        {/* 1. CARD DE PERFIL DO USUÁRIO PREMIUM */}
        {/* ========================================================== */}
        <div style={{
          background: 'linear-gradient(135deg, #009739 0%, #006B2B 100%)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 151, 57, 0.25)',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Efeito decorativo de fundo */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            {/* Avatar com Inicial */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>
                {userInitial}
              </span>
            </div>

            {/* Informações do Usuário */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  color: 'white',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {userName}
                </h2>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <ShieldCheck size={11} /> Conectado
                </span>
              </div>
              <p style={{
                fontSize: '0.825rem',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '0.2rem 0 0',
                wordBreak: 'break-all'
              }}>
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 2. SEÇÃO: GESTÃO & OPERAÇÕES */}
        {/* ========================================================== */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: '800',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 0.625rem 0.25rem'
          }}>
            Gestão & Operações
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <MenuItemCard
              href="/empresas"
              icon={<Building2 size={22} />}
              title="Empresas & Prestadores"
              description="Gerenciar empresas cadastradas e contratos"
              iconColor="#2563EB"
              iconBg="#EFF6FF"
              badgeText="Cadastros"
            />

            <MenuItemCard
              href="/pagamentos"
              icon={<CreditCard size={22} />}
              title="Pagamentos & Financeiro"
              description="Histórico de pagamentos e quitações"
              iconColor="#059669"
              iconBg="#ECFDF5"
            />

            <MenuItemCard
              href="/relatorios"
              icon={<FileText size={22} />}
              title="Relatórios & Fechamento"
              description="Extrato por equipe e impressão de PDF"
              iconColor="#D97706"
              iconBg="#FEF3C7"
              badgeText="A4 / PDF"
            />
          </div>
        </div>

        {/* ========================================================== */}
        {/* 3. SEÇÃO: CONFIGURAÇÕES & PREÇOS */}
        {/* ========================================================== */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: '800',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 0.625rem 0.25rem'
          }}>
            Configurações & Cadastros
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <MenuItemCard
              href="/tipos-servico"
              icon={<Settings size={22} />}
              title="Tipos de Serviço & Preços"
              description="Tabela de preços por metro e unidades"
              iconColor="#7C3AED"
              iconBg="#F5F3FF"
            />
          </div>
        </div>

        {/* ========================================================== */}
        {/* 4. SEÇÃO: SUPORTE & INFORMAÇÕES */}
        {/* ========================================================== */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: '800',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 0.625rem 0.25rem'
          }}>
            Suporte & Ajuda
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <MenuItemCard
              href="/ajuda"
              icon={<HelpCircle size={22} />}
              title="Central de Ajuda"
              description="Guia rápido do fluxo de medição e fechamento"
              iconColor="#EA580C"
              iconBg="#FFF7ED"
            />
          </div>
        </div>

        {/* ========================================================== */}
        {/* 5. BOTÃO DE LOGOUT */}
        {/* ========================================================== */}
        <div style={{ marginBottom: '2rem' }}>
          <LogoutButton />
        </div>

        {/* ========================================================== */}
        {/* 6. RODAPÉ INFORMATIVO */}
        {/* ========================================================== */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            padding: '0.35rem 0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#009739',
              boxShadow: '0 0 0 2px rgba(0, 151, 57, 0.2)'
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151' }}>
              CercasApp v1.0 • PWA Offline Ready
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
            Fazenda Santo Antônio de Pádua
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// Componente Elegante para Itens de Menu
function MenuItemCard({
  href,
  icon,
  title,
  description,
  iconColor,
  iconBg,
  badgeText
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
  badgeText?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        background: 'white',
        borderRadius: '1rem',
        padding: '0.875rem 1rem',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
        textDecoration: 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Ícone com Fundo Pastel */}
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '0.75rem',
        background: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>

      {/* Textos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <h4 style={{
            fontSize: '0.925rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            {title}
          </h4>
          {badgeText && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '800',
              color: iconColor,
              background: iconBg,
              padding: '0.1rem 0.4rem',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>
              {badgeText}
            </span>
          )}
        </div>
        <p style={{
          fontSize: '0.775rem',
          color: '#6B7280',
          margin: '0.15rem 0 0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {description}
        </p>
      </div>

      {/* Seta Indicativa */}
      <div style={{ color: '#9CA3AF', flexShrink: 0 }}>
        <ChevronRight size={18} />
      </div>
    </Link>
  );
}