import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: string;
  trend?: {
    type: 'up' | 'down' | 'neutral';
    text: string;
  };
  color?: 'purple' | 'green' | 'cyan' | 'danger' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  footer,
  trend,
  color = 'purple',
}) => {
  const getGlowColor = () => {
    switch (color) {
      case 'green':
        return 'var(--accent-neon-glow)';
      case 'cyan':
        return 'rgba(0, 242, 254, 0.25)';
      case 'danger':
        return 'var(--accent-danger-glow)';
      case 'warning':
        return 'rgba(255, 184, 48, 0.2)';
      default:
        return 'var(--accent-purple-glow)';
    }
  };

  const getBorderColor = () => {
    switch (color) {
      case 'green':
        return 'var(--accent-neon)';
      case 'cyan':
        return 'var(--accent-cyan)';
      case 'danger':
        return 'var(--accent-danger)';
      case 'warning':
        return 'var(--accent-warning)';
      default:
        return 'var(--accent-purple)';
    }
  };

  return (
    <div className={`glass-card stat-card color-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
      </div>
      {(footer || trend) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-trend trend-${trend.type}`}>
              {trend.type === 'up' && '↑ '}
              {trend.type === 'down' && '↓ '}
              {trend.text}
            </span>
          )}
          {footer && <span className="stat-footer-text">{footer}</span>}
        </div>
      )}

      <style>{`
        .stat-card {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: ${getBorderColor()};
          box-shadow: 0 0 10px ${getGlowColor()};
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-card-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card-icon {
          color: ${getBorderColor()};
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          width: 36px;
          height: 36px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .stat-card-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .stat-card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
          margin-top: 4px;
        }

        .stat-trend {
          font-weight: 600;
        }

        .trend-up {
          color: var(--accent-neon);
        }

        .trend-down {
          color: var(--accent-danger);
        }

        .trend-neutral {
          color: var(--text-muted);
        }

        .stat-footer-text {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
