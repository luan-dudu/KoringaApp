import React from 'react';
import logo from '../assets/logo.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
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

  return (
    <aside className="sidebar">
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
            onClick={() => setActiveTab(item.id)}
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

      <style>{`
        .sidebar {
          width: 280px;
          background: rgba(15, 18, 27, 0.95);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 24px;
          min-height: 100vh;
          position: sticky;
          top: 0;
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

        @media (max-width: 1024px) {
          .sidebar {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            padding: 16px 20px;
          }

          .sidebar-brand {
            margin-bottom: 16px;
            padding-bottom: 12px;
          }

          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
            gap: 12px;
          }

          .nav-link {
            padding: 10px 14px;
            white-space: nowrap;
            font-size: 0.85rem;
          }

          .sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};
