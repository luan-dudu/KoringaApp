import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Painel Inicial',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      id: 'alunos',
      label: 'Alunos & Cobrança',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'presenca',
      label: 'Presenças & Treinos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      id: 'loja',
      label: 'Loja / Suplementos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    },
    {
      id: 'financeiro',
      label: 'Financeiro & Caixas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l4.7 1.567 1.567 4.7a2.25 2.25 0 0 0 4.073.126l7.5-16.5a2.242 2.242 0 0 0-2.444-1.681z" />
          <path d="m10 14 4.5-4.5" />
        </svg>
      )
    }
  ];

  // Close drawer when tab changes
  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="sidebar sidebar-desktop">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <img src={logo} alt="KoringaApp Logo" />
          </div>
          <div>
            <span className="brand-name">KoringaApp</span>
            <span className="brand-status">Painel de Controle</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p className="footer-title">KoringaApp v1.0</p>
            <p className="footer-subtitle">Banco de Dados Local</p>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="mobile-topbar">
        <div className="mobile-brand">
          <div className="mobile-brand-logo">
            <img src={logo} alt="KoringaApp Logo" />
          </div>
          <span className="brand-name" style={{ fontSize: '1.1rem' }}>KoringaApp</span>
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* ===== MOBILE DRAWER OVERLAY ===== */}
      {isMobileMenuOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ===== MOBILE DRAWER ===== */}
      <aside className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="sidebar-brand" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
            <div className="brand-logo">
              <img src={logo} alt="KoringaApp Logo" />
            </div>
            <div>
              <span className="brand-name">KoringaApp</span>
              <span className="brand-status">Painel de Controle</span>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav" style={{ marginTop: '24px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p className="footer-title">KoringaApp v1.0</p>
            <p className="footer-subtitle">Banco de Dados Local</p>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <style>{`
        /* ===== DESKTOP SIDEBAR ===== */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          background: rgba(15, 18, 27, 0.95);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 24px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 10;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-logo {
          background: #000000;
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(127, 86, 218, 0.3);
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .brand-name {
          display: block;
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff 40%, var(--accent-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-status {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          text-align: left;
          transition: var(--transition-smooth);
          width: 100%;
        }

        .nav-link:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-link.active {
          color: white;
          background: linear-gradient(135deg, rgba(127, 86, 218, 0.25) 0%, rgba(0, 242, 254, 0.05) 100%);
          border-left: 3px solid var(--accent-purple);
          box-shadow: inset 5px 0 15px rgba(127, 86, 218, 0.05);
        }

        .nav-link.active .nav-icon {
          color: var(--accent-cyan);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: rgba(255, 71, 126, 0.08);
          border: 1px solid rgba(255, 71, 126, 0.15);
          color: var(--accent-danger);
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .logout-btn:hover {
          background: rgba(255, 71, 126, 0.2);
          border-color: rgba(255, 71, 126, 0.3);
          color: #ff6b9d;
          box-shadow: 0 0 12px rgba(255, 71, 126, 0.25);
        }

        .footer-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .footer-subtitle {
          font-size: 0.75rem;
          color: var(--accent-neon);
          margin-top: 2px;
        }

        /* ===== MOBILE TOP BAR ===== */
        .mobile-topbar {
          display: none;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 100;
          background: rgba(9, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          padding: 12px 16px;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-brand-logo {
          width: 34px;
          height: 34px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .mobile-brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hamburger-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-main);
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          flex-shrink: 0;
        }

        .hamburger-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-purple);
        }

        /* ===== MOBILE DRAWER ===== */
        .drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 200;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          max-width: 85vw;
          background: rgba(10, 12, 20, 0.98);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border-color);
          z-index: 300;
          flex-direction: column;
          padding: 24px 20px;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 4px;
        }

        .drawer-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          flex-shrink: 0;
        }

        .drawer-close-btn:hover {
          background: rgba(255, 71, 126, 0.1);
          border-color: var(--accent-danger);
          color: var(--accent-danger);
        }

        /* ===== RESPONSIVE VISIBILITY ===== */
        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none !important;
          }

          .mobile-topbar {
            display: flex;
          }

          .drawer-overlay {
            display: block;
          }

          .mobile-drawer {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .mobile-topbar {
            display: none !important;
          }

          .mobile-drawer {
            display: none !important;
          }

          .drawer-overlay {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
