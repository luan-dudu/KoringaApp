import React, { useState, useEffect } from 'react';
import { 
  getTransactions, 
  saveTransaction, 
  getClosings, 
  closeMonth, 
  getLocalDateString,
  type Transaction,
  type MonthlyClosing
} from '../db/localDb';
import { StatCard } from '../components/StatCard';
import { SVGChart } from '../components/SVGChart';
import { Modal } from '../components/Modal';

interface FinanceiroProps {
  showToast: (message: string, isError?: boolean) => void;
  triggerRefresh: boolean;
  onRefresh: () => void;
}

export const Financeiro: React.FC<FinanceiroProps> = ({ showToast, triggerRefresh, onRefresh }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  
  // Controle de Mês/Ano selecionado para o fluxo de caixa
  const [selectedMonth, setSelectedMonth] = useState(getLocalDateString().substring(0, 7)); // YYYY-MM

  // Modal de Transação Manual
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txTipo, setTxTipo] = useState<'Receita' | 'Despesa'>('Despesa');
  const [txCategoria, setTxCategoria] = useState<Transaction['categoria']>('Outros');
  const [txDescricao, setTxDescricao] = useState('');
  const [txValor, setTxValor] = useState(0);
  const [txData, setTxData] = useState(getLocalDateString());

  // Estado para visualização de relatórios de fechamento
  const [activeClosingReport, setActiveClosingReport] = useState<MonthlyClosing | null>(null);

  const loadData = () => {
    setTransactions(getTransactions());
    setClosings(getClosings());
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  // Transações filtradas pelo mês selecionado
  const monthlyTransactions = transactions.filter(t => t.data.startsWith(selectedMonth));

  // Cálculo de receitas, despesas e lucro líquido do mês selecionado
  const monthlyIncomes = monthlyTransactions
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  const monthlyNet = monthlyIncomes - monthlyExpenses;

  // Lida com salvamento de transação manual
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescricao.trim()) {
      showToast('A descrição da transação é obrigatória!', true);
      return;
    }
    if (txValor <= 0) {
      showToast('O valor deve ser maior que zero!', true);
      return;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      tipo: txTipo,
      categoria: txCategoria,
      descricao: txDescricao.trim(),
      valor: Number(txValor),
      data: txData
    };

    saveTransaction(newTx);
    showToast(`${txTipo} de R$ ${txValor.toFixed(2)} cadastrada com sucesso!`);
    setIsTxModalOpen(false);
    
    // Limpa campos
    setTxDescricao('');
    setTxValor(0);
    setTxData(getLocalDateString());
    
    onRefresh();
  };

  // Executa fechamento do mês selecionado
  const handleCloseMonth = () => {
    if (confirm(`Deseja realmente realizar o fechamento financeiro de ${selectedMonth.split('-').reverse().join('/')}? Isso salvará um relatório consolidado.`)) {
      const result = closeMonth(selectedMonth);
      if (result.success) {
        showToast(result.message);
        onRefresh();
      } else {
        showToast(result.message, true);
      }
    }
  };

  // Prepara dados de faturamento/despesa anual para o gráfico (Últimos 5 meses)
  const getFinancialChartData = () => {
    const dataPoints: { label: string; value: number; value2?: number }[] = [];
    const months = [];
    const d = new Date();
    
    // Pega os últimos 5 meses
    for (let i = 4; i >= 0; i--) {
      const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const yearMonth = pastDate.toISOString().substring(0, 7); // YYYY-MM
      months.push(yearMonth);
    }

    months.forEach(ym => {
      const monthTxs = transactions.filter(t => t.data.startsWith(ym));
      const inc = monthTxs.filter(t => t.tipo === 'Receita').reduce((sum, t) => sum + t.valor, 0);
      const exp = monthTxs.filter(t => t.tipo === 'Despesa').reduce((sum, t) => sum + t.valor, 0);
      
      const labelParts = ym.split('-');
      dataPoints.push({
        label: `${labelParts[1]}/${labelParts[0].substring(2)}`,
        value: inc, // Receitas (Linha Verde/Cyan)
        value2: exp, // Despesas (Linha Vermelha)
      });
    });

    return dataPoints;
  };

  const chartData = getFinancialChartData();

  // Verifica se o mês atual já está fechado
  const isMonthClosed = closings.some(c => c.anoMes === selectedMonth);

  return (
    <div className="finance-view animate-fade-in">
      <div className="view-header flex-header">
        <div>
          <h1>Financeiro & Fechamentos</h1>
          <p className="section-subtitle">Fluxo de caixa da academia e fechamentos contábeis mensais</p>
        </div>
        <button onClick={() => setIsTxModalOpen(true)} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Registrar Transação
        </button>
      </div>

      {/* Grid de Resumo de Caixa do Mês Selecionado */}
      <div className="dashboard-grid">
        <StatCard
          title="Receitas"
          value={`R$ ${monthlyIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="cyan"
          footer={`Mensalidades & Vendas em ${selectedMonth.split('-').reverse().join('/')}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <StatCard
          title="Despesas"
          value={`R$ ${monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="danger"
          footer={`Salários, aluguel & custos em ${selectedMonth.split('-').reverse().join('/')}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          }
        />
        <StatCard
          title="Lucro Líquido"
          value={`R$ ${monthlyNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color={monthlyNet >= 0 ? 'green' : 'danger'}
          footer="Saldo do mês corrente"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      {/* Gráfico Comparativo */}
      <div style={{ marginBottom: '32px' }}>
        <SVGChart
          title="Histórico Financeiro (Receitas em Azul vs Despesas em Vermelho)"
          data={chartData}
          type="line"
          color="mixed"
          height={240}
        />
      </div>

      {/* Split Layout */}
      <div className="layout-split">
        {/* Fluxo de Caixa (Esquerda) */}
        <div className="left-column">
          <div className="glass-card">
            <div className="list-header-flex">
              <h3>Livro de Caixa</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="month"
                  className="form-control"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  style={{ width: '170px' }}
                />
                {!isMonthClosed ? (
                  <button onClick={handleCloseMonth} className="btn btn-success btn-sm-action">
                    Fechar Mês
                  </button>
                ) : (
                  <span className="badge badge-inactive">Mês Consolidado</span>
                )}
              </div>
            </div>

            {monthlyTransactions.length === 0 ? (
              <p className="no-data" style={{ marginTop: '20px' }}>Nenhuma transação financeira registrada neste mês.</p>
            ) : (
              <div className="table-container" style={{ marginTop: '20px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTransactions.map(t => (
                      <tr key={t.id}>
                        <td>{t.data.split('-').reverse().join('/')}</td>
                        <td>
                          <span className={`badge ${t.tipo === 'Receita' ? 'badge-active' : 'badge-danger'}`}>
                            {t.tipo}
                          </span>
                        </td>
                        <td>{t.categoria}</td>
                        <td>
                          <strong>{t.descricao}</strong>
                          {t.detalhes && <span className="tx-details-sub">{t.detalhes}</span>}
                        </td>
                        <td className={t.tipo === 'Receita' ? 'text-success' : 'text-danger'}>
                          <strong>R$ {t.valor.toFixed(2)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Relatórios de Fechamentos Anteriores (Direita) */}
        <div className="right-column">
          <div className="glass-card">
            <h3>Fechamentos Históricos</h3>
            <p className="section-subtitle" style={{ marginBottom: '16px' }}>Demonstrativos arquivados</p>
            
            {closings.length === 0 ? (
              <p className="no-data">Nenhum mês fechado no sistema.</p>
            ) : (
              <div className="closings-history-list">
                {closings.map(c => (
                  <button
                    key={c.id}
                    className="closing-item-btn glass-card"
                    onClick={() => setActiveClosingReport(c)}
                  >
                    <div>
                      <span className="c-month">{c.anoMes.split('-').reverse().join('/')}</span>
                      <span className="c-meta">Fechado em: {c.dataFechamento.split('-').reverse().join('/')}</span>
                    </div>
                    <span className={`c-net ${c.lucroLiquido >= 0 ? 'text-success' : 'text-danger'}`}>
                      R$ {c.lucroLiquido.toFixed(0)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Transação Manual */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Registrar Transação"
        footerButtons={
          <>
            <button className="btn btn-secondary" onClick={() => setIsTxModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSaveTransaction}>
              Lançar Transação
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTransaction}>
          <div className="form-row-2">
            <div className="form-group">
              <label>Tipo de Transação</label>
              <select
                className="form-control"
                value={txTipo}
                onChange={e => setTxTipo(e.target.value as any)}
              >
                <option value="Despesa">Despesa (Saída)</option>
                <option value="Receita">Receita (Entrada)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select
                className="form-control"
                value={txCategoria}
                onChange={e => setTxCategoria(e.target.value as any)}
              >
                {txTipo === 'Despesa' ? (
                  <>
                    <option value="Material">Material</option>
                    <option value="Agua">Água</option>
                    <option value="Luz">Luz</option>
                    <option value="Internet">Internet</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Roupas">Roupas</option>
                    <option value="Suplementos">Suplementos</option>
                    <option value="Venenos">Venenos</option>
                    <option value="Salários">Salários</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="Mensalidade">Mensalidade</option>
                    <option value="Venda de Produto">Venda de Produto</option>
                    <option value="Outros">Outras Receitas</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Pagamento conta de luz, Venda avulsa suplemento..."
              value={txDescricao}
              onChange={e => setTxDescricao(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Valor (R$)</label>
              <input
                type="number"
                className="form-control"
                value={txValor}
                onChange={e => setTxValor(Number(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                className="form-control"
                value={txData}
                onChange={e => setTxData(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalhes Fechamento Histórico */}
      <Modal
        isOpen={activeClosingReport !== null}
        onClose={() => setActiveClosingReport(null)}
        title={activeClosingReport ? `Fechamento de Mês Consolidado - ${activeClosingReport.anoMes.split('-').reverse().join('/')}` : ''}
        footerButtons={
          <button className="btn btn-secondary" onClick={() => setActiveClosingReport(null)}>
            Fechar Relatório
          </button>
        }
      >
        {activeClosingReport && (
          <div className="closing-report-details">
            <div className="report-row report-highlight">
              <span>Resultado Líquido</span>
              <strong className={activeClosingReport.lucroLiquido >= 0 ? 'text-success' : 'text-danger'}>
                R$ {activeClosingReport.lucroLiquido.toFixed(2)}
              </strong>
            </div>

            <div className="report-section-title">Demonstrativo de Receitas</div>
            <div className="report-row">
              <span>Mensalidades Recebidas:</span>
              <span>R$ {activeClosingReport.receitaMensalidades.toFixed(2)}</span>
            </div>
            <div className="report-row">
              <span>Vendas da Loja:</span>
              <span>R$ {activeClosingReport.receitaVendas.toFixed(2)}</span>
            </div>
            <div className="report-row">
              <span>Outras Receitas:</span>
              <span>R$ {activeClosingReport.receitasOutras.toFixed(2)}</span>
            </div>
            <div className="report-row total-row-sub">
              <span>Receita Total:</span>
              <strong>R$ {(activeClosingReport.receitaMensalidades + activeClosingReport.receitaVendas + activeClosingReport.receitasOutras).toFixed(2)}</strong>
            </div>

            <div className="report-section-title">Demonstrativo de Despesas</div>
            <div className="report-row">
              <span>Despesas Totais Pagas:</span>
              <span className="text-danger">R$ {activeClosingReport.despesasTotais.toFixed(2)}</span>
            </div>

            <div className="report-section-title">Estatísticas Operacionais</div>
            <div className="report-row">
              <span>Total de Check-ins (Presenças):</span>
              <span>{activeClosingReport.totalPresencas} check-ins</span>
            </div>
            <div className="report-row">
              <span>Número de Transações de Loja:</span>
              <span>{activeClosingReport.totalVendas} vendas</span>
            </div>

            <div className="closing-report-meta" style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Relatório gerado em: {activeClosingReport.dataFechamento.split('-').reverse().join('/')}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .tx-details-sub {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .closings-history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }

        .closing-item-btn {
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.01) !important;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px !important;
        }

        .closing-item-btn:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: var(--accent-cyan) !important;
        }

        .c-month {
          display: block;
          font-weight: 600;
          font-size: 1rem;
        }

        .c-meta {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .c-net {
          font-weight: 700;
          font-size: 1.1rem;
        }

        /* Relatório de Fechamento Detalhado */
        .closing-report-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .report-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .report-row:last-child {
          border-bottom: none;
        }

        .report-highlight {
          font-size: 1.2rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 12px;
          margin-bottom: 8px;
        }

        .report-section-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-purple);
          font-weight: 600;
          margin-top: 12px;
        }

        .total-row-sub {
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 10px;
        }
      `}</style>
    </div>
  );
};
export default Financeiro;
