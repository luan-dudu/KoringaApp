import React, { useState, useEffect } from 'react';
import {
  getTelegramConfig,
  saveTelegramConfig,
  sendTestMessage,
  forceSendDuePayments,
  type TelegramConfig as TelegramConfigType,
} from '../services/telegramService';

interface TelegramConfigProps {
  showToast: (message: string, isError?: boolean) => void;
}

export const TelegramConfig: React.FC<TelegramConfigProps> = ({ showToast }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Carrega configuração existente
  useEffect(() => {
    const config = getTelegramConfig();
    if (config) {
      setBotToken(config.botToken);
      setChatId(config.chatId);
      setEnabled(config.enabled);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (!botToken.trim() || !chatId.trim()) {
      showToast('Preencha o Bot Token e o Chat ID!', true);
      return;
    }

    const config: TelegramConfigType = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled,
    };

    saveTelegramConfig(config);
    setIsConfigured(true);
    showToast('Configuração do Telegram salva com sucesso!');
  };

  const handleTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      showToast('Preencha o Bot Token e o Chat ID primeiro!', true);
      return;
    }

    setIsTesting(true);
    const config: TelegramConfigType = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled,
    };

    const result = await sendTestMessage(config);
    setIsTesting(false);

    if (result.success) {
      showToast('✅ Mensagem de teste enviada! Verifique o Telegram.');
    } else {
      showToast(result.message, true);
    }
  };

  const handleForceSend = async () => {
    if (!isConfigured) {
      showToast('Salve a configuração primeiro!', true);
      return;
    }

    setIsSending(true);
    const result = await forceSendDuePayments();
    setIsSending(false);

    if (result.success) {
      if (result.count > 0) {
        showToast(`📨 ${result.count} cobrança(s) enviada(s) com sucesso!`);
      } else {
        showToast('Nenhum aluno com vencimento hoje.');
      }
    } else {
      showToast(result.message, true);
    }
  };

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    if (isConfigured) {
      const config: TelegramConfigType = {
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        enabled: newEnabled,
      };
      saveTelegramConfig(config);
      showToast(
        newEnabled
          ? 'Notificações automáticas ativadas!'
          : 'Notificações automáticas desativadas.'
      );
    }
  };

  return (
    <div className="telegram-config-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="title-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l4.7 1.567 1.567 4.7a2.25 2.25 0 0 0 4.073.126l7.5-16.5a2.242 2.242 0 0 0-2.444-1.681z" />
                <path d="m10 14 4.5-4.5" />
              </svg>
            </span>
            Integração Telegram
          </h1>
          <p className="page-subtitle">Configure o envio automático de cobranças via Telegram</p>
        </div>
        <div className="header-badge">
          <span className={`status-badge ${isConfigured && enabled ? 'badge-active' : 'badge-inactive'}`}>
            <span className="badge-dot"></span>
            {isConfigured && enabled ? 'Ativo' : 'Desativado'}
          </span>
        </div>
      </div>

      <div className="telegram-grid">
        {/* Card de Configuração */}
        <div className="config-card">
          <div className="card-header">
            <h2 className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configuração do Bot
            </h2>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label htmlFor="botToken">Bot Token</label>
              <p className="field-description">Obtido ao criar um bot com o @BotFather no Telegram</p>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="botToken"
                  type={showToken ? 'text' : 'password'}
                  placeholder="7123456789:AAH..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
                <button
                  className="toggle-visibility"
                  onClick={() => setShowToken(!showToken)}
                  type="button"
                  title={showToken ? 'Ocultar token' : 'Mostrar token'}
                >
                  {showToken ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="chatId">Chat ID</label>
              <p className="field-description">ID do grupo ou chat onde as cobranças serão enviadas</p>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <input
                  id="chatId"
                  type="text"
                  placeholder="-1001234567890"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                />
              </div>
            </div>

            {/* Toggle de Notificações Automáticas */}
            <div className="toggle-group" onClick={handleToggleEnabled}>
              <div className="toggle-info">
                <span className="toggle-label">Notificações Automáticas</span>
                <span className="toggle-description">
                  Envia cobranças automaticamente ao abrir o app no dia do vencimento
                </span>
              </div>
              <div className={`toggle-switch ${enabled ? 'toggle-on' : ''}`}>
                <div className="toggle-knob"></div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="action-buttons">
              <button className="btn btn-save" onClick={handleSave}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Salvar Configuração
              </button>
              <button className="btn btn-test" onClick={handleTest} disabled={isTesting}>
                {isTesting ? (
                  <span className="spinner-small"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                )}
                Testar Conexão
              </button>
            </div>
          </div>
        </div>

        {/* Card de Envio Manual */}
        <div className="config-card send-card">
          <div className="card-header">
            <h2 className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Envio Manual
            </h2>
          </div>
          <div className="send-content">
            <p className="send-description">
              Clique no botão abaixo para enviar <strong>agora</strong> as cobranças de todos os alunos
              que vencem <strong>hoje (dia {new Date().getDate()})</strong>.
            </p>
            <div className="send-info-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>O envio automático acontece uma vez por dia ao abrir o app. Use este botão para forçar um reenvio.</span>
            </div>
            <button
              className="btn btn-send"
              onClick={handleForceSend}
              disabled={isSending || !isConfigured}
            >
              {isSending ? (
                <span className="spinner-small"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              Enviar Cobranças Agora
            </button>
            {!isConfigured && (
              <p className="send-warning">⚠️ Salve a configuração acima antes de enviar.</p>
            )}
          </div>
        </div>

        {/* Card de Tutorial */}
        <div className="config-card tutorial-card">
          <div className="card-header">
            <h2 className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Como Configurar
            </h2>
          </div>
          <div className="tutorial-content">
            <div className="tutorial-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Criar o Bot</h3>
                <p>Abra o Telegram, procure por <strong>@BotFather</strong> e envie <code>/newbot</code>. Escolha um nome e username. Copie o <strong>Token</strong> fornecido.</p>
              </div>
            </div>
            <div className="tutorial-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Obter o Chat ID</h3>
                <p>Crie ou use um <strong>grupo no Telegram</strong>, adicione o bot ao grupo. Envie uma mensagem e acesse:</p>
                <code className="url-code">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>
                <p>Procure por <code>"chat":{'"id":'}</code> — o número (geralmente negativo) é o Chat ID.</p>
              </div>
            </div>
            <div className="tutorial-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Configurar e Testar</h3>
                <p>Cole o <strong>Bot Token</strong> e <strong>Chat ID</strong> nos campos acima, clique em <strong>"Testar Conexão"</strong> e depois <strong>"Salvar"</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .telegram-config-page {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 40%, #00b4d8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .title-icon {
          display: flex;
          align-items: center;
          color: var(--accent-cyan);
          -webkit-text-fill-color: initial;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-left: 40px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .badge-active {
          background: rgba(0, 255, 135, 0.1);
          border: 1px solid rgba(0, 255, 135, 0.25);
          color: var(--accent-neon);
        }

        .badge-inactive {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .badge-active .badge-dot {
          background: var(--accent-neon);
          box-shadow: 0 0 8px rgba(0, 255, 135, 0.5);
          animation: pulse-dot 2s infinite;
        }

        .badge-inactive .badge-dot {
          background: var(--text-muted);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .telegram-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .config-card {
          background: rgba(22, 25, 35, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .config-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .config-card:first-child {
          grid-column: 1 / 2;
          grid-row: 1 / 3;
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-title svg {
          color: var(--accent-cyan);
        }

        .config-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .config-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .config-form .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .field-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .config-form .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .config-form .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .config-form .input-wrapper input {
          width: 100%;
          padding: 12px 42px 12px 42px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: var(--transition-smooth);
        }

        .config-form .input-wrapper input:focus {
          border-color: var(--accent-purple);
          box-shadow: 0 0 15px rgba(127, 86, 218, 0.2);
        }

        .toggle-visibility {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }

        .toggle-visibility:hover {
          color: var(--accent-cyan);
        }

        /* Toggle Switch */
        .toggle-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .toggle-group:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toggle-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .toggle-description {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .toggle-switch {
          width: 48px;
          height: 26px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .toggle-switch.toggle-on {
          background: var(--accent-purple);
          box-shadow: 0 0 15px rgba(127, 86, 218, 0.4);
        }

        .toggle-knob {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.toggle-on .toggle-knob {
          left: 25px;
        }

        /* Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: var(--border-radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-save {
          flex: 1;
          background: linear-gradient(135deg, var(--accent-purple) 0%, #6336c5 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(127, 86, 218, 0.3);
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(127, 86, 218, 0.5);
        }

        .btn-test {
          flex: 1;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.25);
          color: var(--accent-cyan);
        }

        .btn-test:hover:not(:disabled) {
          background: rgba(0, 242, 254, 0.2);
          border-color: rgba(0, 242, 254, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
        }

        .btn-send {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00c853 0%, #00b248 100%);
          color: white;
          font-size: 1rem;
          box-shadow: 0 4px 20px rgba(0, 200, 83, 0.3);
        }

        .btn-send:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 200, 83, 0.5);
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Send Card */
        .send-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .send-description {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .send-description strong {
          color: var(--text-main);
        }

        .send-info-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.12);
          border-radius: var(--border-radius-md);
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .send-info-box svg {
          color: var(--accent-cyan);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .send-warning {
          font-size: 0.82rem;
          color: #ffb74d;
          text-align: center;
        }

        /* Tutorial Card */
        .tutorial-card {
          grid-column: 1 / -1;
        }

        .tutorial-content {
          padding: 24px;
          display: flex;
          gap: 24px;
        }

        .tutorial-step {
          flex: 1;
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--border-radius-md);
          transition: var(--transition-smooth);
        }

        .tutorial-step:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(127, 86, 218, 0.2);
        }

        .step-number {
          width: 36px;
          height: 36px;
          min-width: 36px;
          background: linear-gradient(135deg, var(--accent-purple) 0%, rgba(0, 242, 254, 0.6) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 800;
          color: white;
        }

        .step-content h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .step-content p {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .step-content strong {
          color: var(--accent-cyan);
        }

        .step-content code {
          background: rgba(127, 86, 218, 0.15);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
          color: var(--accent-purple);
          font-family: 'JetBrains Mono', monospace;
        }

        .url-code {
          display: block;
          padding: 8px 12px !important;
          margin: 8px 0;
          background: rgba(0, 0, 0, 0.3) !important;
          border-radius: 6px !important;
          font-size: 0.72rem !important;
          color: var(--accent-cyan) !important;
          word-break: break-all;
        }

        @media (max-width: 1024px) {
          .telegram-grid {
            grid-template-columns: 1fr;
          }

          .config-card:first-child {
            grid-column: 1;
            grid-row: auto;
          }

          .tutorial-content {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
