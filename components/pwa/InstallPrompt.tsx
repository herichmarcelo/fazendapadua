'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 1. Registra o Service Worker explicitamente para atender aos critérios de PWA do Chrome/Android
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    }

    // 2. Verifica se o app já está rodando instalado (Standalone)
    const isAppStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isAppStandalone);
    if (isAppStandalone) {
      return; // Já está instalado, não exibe nada
    }

    // 3. Verifica se o usuário dispensou recentemente
    const dismissedUntil = localStorage.getItem('cercas_pwa_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 4. Detecta iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /macintosh/.test(userAgent));

    if (isIosDevice) {
      setIsIOS(true);
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // 5. Captura o evento nativo do Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      console.log('[PWA] Evento beforeinstallprompt capturado com sucesso!');
    };

    const handleAppInstalled = () => {
      console.log('[PWA] Aplicativo instalado com sucesso!');
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('cercas_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Dispara a instalação nativa do Android
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        // Dispara o pop-up NATIVO do Android
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('[PWA] Usuário aceitou a instalação nativa');
          setShowPrompt(false);
        }
      } catch (err) {
        console.error('[PWA] Erro ao disparar prompt nativo:', err);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guarda dispensa por 12 horas
    const timeout = Date.now() + 12 * 60 * 60 * 1000;
    localStorage.setItem('cercas_pwa_dismissed_until', timeout.toString());
  };

  // Se já estiver instalado ou se não for iOS e não tiver deferredPrompt pronto, não mostra
  if (isStandalone || !showPrompt) {
    return null;
  }

  // No Android, só exibe o banner se o evento nativo deferredPrompt estiver pronto
  if (!isIOS && !deferredPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '4.75rem',
        left: '1rem',
        right: '1rem',
        maxWidth: '28rem',
        margin: '0 auto',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        borderRadius: '1.25rem',
        border: '1.5px solid #009739',
        boxShadow: '0 12px 36px rgba(0, 151, 57, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#111827'
      }}
      className="print:hidden"
    >
      {/* Botão de Fechar */}
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '0.625rem',
          right: '0.625rem',
          background: '#F3F4F6',
          border: 'none',
          borderRadius: '50%',
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
          cursor: 'pointer'
        }}
        title="Dispensar aviso"
      >
        <X size={15} />
      </button>

      {/* Conteúdo Principal do Prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingRight: '1.5rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #009739 0%, #006B2B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 10px rgba(0, 151, 57, 0.3)',
          overflow: 'hidden'
        }}>
          <img
            src="/icon-192.png"
            alt="CercasApp Logo"
            width={48}
            height={48}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: '#111827' }}>
              Instalar CercasApp
            </h4>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '800',
              color: '#006B2B',
              background: '#E8F5E9',
              padding: '0.1rem 0.35rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              <Sparkles size={10} /> App Oficial
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#4B5563', margin: '0.15rem 0 0', lineHeight: '1.3' }}>
            Instalar na tela inicial para abrir direto como aplicativo
          </p>
        </div>
      </div>

      {/* Guia Específico para iOS Safari */}
      {isIOS && showIOSInstructions ? (
        <div style={{
          marginTop: '0.875rem',
          padding: '0.75rem',
          background: '#F9FAFB',
          borderRadius: '0.875rem',
          border: '1px solid #E5E7EB',
          fontSize: '0.78rem',
          color: '#374151',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <p style={{ fontWeight: '800', margin: 0, color: '#009739', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Smartphone size={16} /> Como instalar no iPhone/iPad:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem' }}>1</div>
            <div>Toque no botão <strong>Compartilhar</strong> <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#0284C7' }} /> no Safari.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem' }}>2</div>
            <div>Role e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong> <PlusSquare size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem' }}>3</div>
            <div>Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior. Pronto!</div>
          </div>

          <button
            type="button"
            onClick={() => setShowIOSInstructions(false)}
            style={{
              background: '#009739',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.45rem',
              fontWeight: '700',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Entendido
          </button>
        </div>
      ) : (
        /* Botões de Ação */
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              flex: 1,
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '0.625rem',
              padding: '0.55rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#4B5563',
              cursor: 'pointer'
            }}
          >
            Mais tarde
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="btn-primario"
            style={{
              flex: 1.8,
              padding: '0.55rem 0.875rem',
              fontSize: '0.825rem',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(0, 151, 57, 0.3)',
              cursor: isInstalling ? 'wait' : 'pointer'
            }}
          >
            {isIOS ? <Share size={15} /> : <Download size={15} />}
            <span>{isInstalling ? 'Instalando...' : isIOS ? 'Como Instalar no iOS' : 'Instalar no Celular'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
