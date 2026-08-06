import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Alunos } from './views/Alunos';
import { Presenca } from './views/Presenca';
import { Loja } from './views/Loja';
import { Financeiro } from './views/Financeiro';
import { TelegramConfig } from './views/TelegramConfig';
import { Login } from './views/Login';
import { checkAndNotifyDuePayments } from './services/telegramService';

interface ToastState {
  message: string;
  isError: boolean;
  visible: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Controle de recarregamento reativo
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastState>({
    message: '',
    isError: false,
    visible: false,
  });

  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('koringa_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('koringa_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('koringa_auth');
  };

  // Verifica cobranças do dia e envia via Telegram automaticamente
  useEffect(() => {
    if (isAuthenticated) {
      checkAndNotifyDuePayments().then((result) => {
        if (result.success && result.count > 0) {
          showToast(`📨 Telegram: ${result.count} cobrança(s) enviada(s) automaticamente!`);
        }
      });
    }
  }, [isAuthenticated]);

  const handleRefresh = () => {
    setTriggerRefresh((prev) => !prev);
  };

  const showToast = (message: string, isError = false) => {
    setToast({
      message,
      isError,
      visible: true,
    });
  };

  // Esconde o toast após 3.5 segundos
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Renderizador condicional de abas
  const renderActiveView = () => {
    switch (activeTab) {
      case 'alunos':
        return (
          <Alunos
            showToast={showToast}
            triggerRefresh={triggerRefresh}
            onRefresh={handleRefresh}
          />
        );
      case 'presenca':
        return (
          <Presenca
            showToast={showToast}
            triggerRefresh={triggerRefresh}
            onRefresh={handleRefresh}
          />
        );
      case 'loja':
        return (
          <Loja
            showToast={showToast}
            triggerRefresh={triggerRefresh}
            onRefresh={handleRefresh}
          />
        );
      case 'financeiro':
        return (
          <Financeiro
            showToast={showToast}
            triggerRefresh={triggerRefresh}
            onRefresh={handleRefresh}
          />
        );
      case 'telegram':
        return (
          <TelegramConfig
            showToast={showToast}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard
            showToast={showToast}
            triggerRefresh={triggerRefresh}
            onRefresh={handleRefresh}
          />
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} showToast={showToast} />
        {toast.visible && (
          <div className={`toast ${toast.isError ? 'toast-error' : ''}`} style={{ zIndex: 100000 }}>
            <div className="toast-content">
              {!toast.isError ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-neon)' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-danger)' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
              <span style={{ marginLeft: '10px', fontWeight: 500 }}>{toast.message}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Elementos visuais de fundo - Esferas brilhantes */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Menu Lateral de Navegação (inclui topbar mobile e drawer) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Conteúdo Principal */}
      <main className="main-content" style={{ maxWidth: '100%' }}>
        {renderActiveView()}
      </main>

      {/* Toast Notification Neon Pop-up */}
      {toast.visible && (
        <div className={`toast ${toast.isError ? 'toast-error' : ''}`}>
          <div className="toast-content">
            {!toast.isError ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-neon)' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-danger)' }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span style={{ marginLeft: '10px', fontWeight: 500 }}>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
