import React, { useState, useEffect } from 'react';
import {
  getStudents,
  getAttendance,
  getTransactions,
  getProducts,
  addAttendance,
} from '../db/api';
import { getLocalDateString, type Student, type Attendance, type Transaction, type Product } from '../db/localDb';
import { StatCard } from '../components/StatCard';
import { SVGChart } from '../components/SVGChart';

interface DashboardProps {
  showToast: (message: string, isError?: boolean) => void;
  triggerRefresh: boolean;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ showToast, triggerRefresh, onRefresh }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkInInput, setCheckInInput] = useState('');

  // Carrega dados da API
  const loadData = async () => {
    try {
      const [s, a, t, p] = await Promise.all([
        getStudents(),
        getAttendance(),
        getTransactions(),
        getProducts(),
      ]);
      setStudents(s);
      setAttendance(a);
      setTransactions(t);
      setProducts(p);
    } catch {
      showToast('Erro ao carregar dados do dashboard.', true);
    }
  };

  useEffect(() => {
    void loadData();
  }, [triggerRefresh]);

  const todayStr = getLocalDateString();

  // Filtragem de métricas
  const activeCount = students.filter(s => s.status === 'Ativo').length;
  const overdueCount = students.filter(s => s.status === 'Pendente').length;
  const todayAttendance = attendance.filter(a => a.data === todayStr);

  // Calcula receita do mês atual
  const currentMonthYear = todayStr.substring(0, 7); // YYYY-MM
  const monthlyRevenue = transactions
    .filter(t => t.tipo === 'Receita' && t.data.startsWith(currentMonthYear))
    .reduce((sum, t) => sum + t.valor, 0);

  // Manipula check-in rápido
  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInInput.trim()) return;

    const searchTerm = checkInInput.trim().toLowerCase();
    const foundStudent = students.find(
      s => s.id === searchTerm || s.nome.toLowerCase().includes(searchTerm)
    );

    if (!foundStudent) {
      showToast('Aluno não encontrado com essa matrícula ou nome!', true);
      return;
    }

    try {
      const result = await addAttendance(foundStudent.id);
      if (result.success) {
        showToast(result.message);
        setCheckInInput('');
        onRefresh();
      } else {
        showToast(result.message, true);
      }
    } catch {
      showToast('Erro ao registrar presença. Tente novamente.', true);
    }
  };

  // Prepara dados para o gráfico de presença (Últimos 7 dias)
  const getWeeklyAttendanceData = () => {
    const dataPoints = [];
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = daysOfWeek[d.getDay()];
      const count = attendance.filter(a => a.data === dateStr).length;
      
      dataPoints.push({
        label: dayName,
        value: count
      });
    }
    return dataPoints;
  };

  const weeklyAttendanceData = getWeeklyAttendanceData();

  // Alertas de Estoque Baixo
  const lowStockProducts = products.filter(p => p.estoque < 3);

  // Últimas Transações Financeiras (limite de 4)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 4);

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="view-header">
        <h1>Painel Inicial</h1>
        <p className="section-subtitle">Informações gerais e check-ins do dia ({todayStr.split('-').reverse().join('/')})</p>
      </div>

      {/* Grid de Estatísticas */}
      <div className="dashboard-grid">
        <StatCard
          title="Alunos Ativos"
          value={activeCount}
          color="green"
          footer="Matrículas ativas"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M17 11l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          title="Presenças Hoje"
          value={todayAttendance.length}
          color="cyan"
          footer="Check-ins realizados hoje"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          title="Faturamento Mensal"
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="purple"
          footer={`Mês de ${currentMonthYear.split('-')[1]}/${currentMonthYear.split('-')[0]}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="Pendências Atrasadas"
          value={overdueCount}
          color="danger"
          footer="Mensalidades pendentes"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* Layout Split */}
      <div className="layout-split">
        {/* Coluna da Esquerda: Gráfico e Presenças de Hoje */}
        <div className="left-column">
          <div className="form-checkin-wrapper glass-card">
            <h3>Check-in Rápido</h3>
            <form onSubmit={handleQuickCheckIn} className="checkin-form">
              <input
                type="text"
                className="form-control"
                placeholder="Matrícula (ex: 1001) ou Nome do Aluno..."
                value={checkInInput}
                onChange={e => setCheckInInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Registrar Presença
              </button>
            </form>
          </div>

          <div style={{ marginTop: '24px' }}>
            <SVGChart
              title="Frequência de Alunos (Últimos 7 Dias)"
              data={weeklyAttendanceData}
              type="bar"
              color="cyan"
              height={220}
            />
          </div>

          <div className="glass-card" style={{ marginTop: '24px' }}>
            <h3>Check-ins de Hoje</h3>
            {todayAttendance.length === 0 ? (
              <p className="no-data">Nenhuma presença registrada hoje.</p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Aluno</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.map(att => (
                      <tr key={att.id}>
                        <td><code>#{att.studentId}</code></td>
                        <td><strong>{att.studentNome}</strong></td>
                        <td>{att.hora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Coluna da Direita: Alertas e Últimas Transações */}
        <div className="right-column">
          {/* Caixa de Alertas */}
          <div className="glass-card alerts-card">
            <h3>Alertas e Avisos</h3>
            <div className="alerts-container">
              {/* Alerta de Alunos Pendentes */}
              {overdueCount > 0 && (
                <div className="alert-item alert-danger-border">
                  <div className="alert-icon text-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="alert-body">
                    <p className="alert-title">Mensalidades Vencidas</p>
                    <p className="alert-desc">Existem <strong>{overdueCount}</strong> alunos pendentes de pagamento.</p>
                  </div>
                </div>
              )}

              {/* Alerta de Estoque Baixo */}
              {lowStockProducts.length > 0 && (
                <div className="alert-item alert-warning-border">
                  <div className="alert-icon text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="alert-body">
                    <p className="alert-title">Estoque Baixo</p>
                    <p className="alert-desc">Os seguintes produtos estão acabando:
                      {lowStockProducts.map(p => (
                        <span key={p.id} className="block-product-warning">
                          • {p.nome} ({p.estoque} un)
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )}

              {overdueCount === 0 && lowStockProducts.length === 0 && (
                <p className="no-data" style={{ padding: 0 }}>Nenhum alerta ativo. Tudo funcionando perfeitamente!</p>
              )}
            </div>
          </div>

          {/* Últimas Transações */}
          <div className="glass-card transactions-card" style={{ marginTop: '24px' }}>
            <h3>Finanças Recentes</h3>
            <div className="transactions-list">
              {recentTransactions.length === 0 ? (
                <p className="no-data">Nenhuma transação registrada.</p>
              ) : (
                recentTransactions.map(t => (
                  <div key={t.id} className="transaction-item">
                    <div className="transaction-info">
                      <p className="t-desc">{t.descricao}</p>
                      <p className="t-meta">{t.data.split('-').reverse().join('/')} | {t.categoria}</p>
                    </div>
                    <span className={`transaction-val ${t.tipo === 'Receita' ? 'text-success' : 'text-danger'}`}>
                      {t.tipo === 'Receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkin-form {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .checkin-form .form-control {
          flex: 1;
        }

        .no-data {
          color: var(--text-muted);
          font-size: 0.9rem;
          padding: 12px 0;
          text-align: center;
        }

        /* Alertas */
        .alerts-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 8px;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid transparent;
          padding: 12px 16px;
          border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
        }

        .alert-danger-border {
          border-color: var(--accent-danger);
          background: rgba(255, 71, 126, 0.03);
        }

        .alert-warning-border {
          border-color: var(--accent-warning);
          background: rgba(255, 184, 48, 0.03);
        }

        .alert-icon {
          display: flex;
          align-items: center;
        }

        .text-danger {
          color: var(--accent-danger);
        }

        .text-warning {
          color: var(--accent-warning);
        }

        .alert-title {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .alert-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .block-product-warning {
          display: block;
          font-size: 0.8rem;
          margin-top: 2px;
          color: var(--accent-warning);
        }

        /* Transações */
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .t-desc {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .t-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .transaction-val {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .text-success {
          color: var(--accent-neon);
        }
      `}</style>
    </div>
  );
};
