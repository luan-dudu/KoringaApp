import React, { useState } from 'react';
import logo from '../assets/logo.png';

interface LoginProps {
  onLogin: () => void;
  showToast: (message: string, isError?: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula tempo de resposta do servidor
    setTimeout(() => {
      if (email.trim() === 'admin@koringa.co' && password === 'admin123') {
        showToast('Login realizado com sucesso!', false);
        onLogin();
      } else {
        showToast('E-mail ou senha incorretos!', true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-wrapper">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <img src={logo} alt="CT Koringa Fight Logo" className="login-logo" />
          </div>
          <h1 className="login-title">KoringaApp</h1>
          <p className="login-subtitle">Acesso Restrito ao Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                required
                placeholder="admin@koringa.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>CT KORINGA FIGHT</p>
          <span className="restricted-badge">Área do Administrador</span>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-dark);
          z-index: 9999;
          overflow: hidden;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          background: rgba(22, 25, 35, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          text-align: center;
          position: relative;
          z-index: 10;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          margin: 16px;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          margin-bottom: 32px;
        }

        .login-logo-container {
          width: 90px;
          height: 90px;
          background: #000000;
          border-radius: 18px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(127, 86, 218, 0.25),
                      0 0 0 1px rgba(255, 255, 255, 0.1);
          padding: 0;
        }

        .login-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff 40%, var(--accent-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: var(--transition-smooth);
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          color: var(--text-main);
          font-size: 0.95rem;
          font-weight: 500;
          outline: none;
          transition: var(--transition-smooth);
        }

        .input-wrapper input:focus {
          border-color: var(--accent-purple);
          box-shadow: 0 0 15px rgba(127, 86, 218, 0.2);
          background: rgba(19, 22, 32, 0.9);
        }

        .input-wrapper input:focus + .input-icon,
        .input-wrapper input:focus ~ .input-icon {
          color: var(--accent-cyan);
        }

        .login-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent-purple) 0%, #6336c5 100%);
          border: none;
          border-radius: var(--border-radius-md);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 20px rgba(127, 86, 218, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #8d66e2 0%, var(--accent-purple) 100%);
          box-shadow: 0 6px 25px rgba(127, 86, 218, 0.5);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .login-footer {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .login-footer p {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .restricted-badge {
          background: rgba(0, 255, 135, 0.1);
          border: 1px solid rgba(0, 255, 135, 0.25);
          color: var(--accent-neon);
          padding: 4px 8px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 20px;
            border-radius: 16px;
          }
          .login-title {
            font-size: 1.7rem;
          }
          .login-logo-container {
            width: 72px;
            height: 72px;
          }
        }
      `}</style>
    </div>
  );
};
