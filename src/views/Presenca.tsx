import React, { useState, useEffect } from 'react';
import { 
  getStudents, 
  getAttendance, 
  addAttendance, 
  getLocalDateString,
  type Student,
  type Attendance
} from '../db/localDb';

interface PresencaProps {
  showToast: (message: string, isError?: boolean) => void;
  triggerRefresh: boolean;
  onRefresh: () => void;
}

export const Presenca: React.FC<PresencaProps> = ({ showToast, triggerRefresh, onRefresh }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  
  // Controle de data para a listagem diária
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  
  // Controle de busca de aluno para check-in manual
  const [checkInStudentId, setCheckInStudentId] = useState('');

  // Controle de busca individual para frequência histórica
  const [searchStudentId, setSearchStudentId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getLocalDateString().substring(0, 7)); // YYYY-MM

  const loadData = () => {
    setStudents(getStudents().filter(s => s.status !== 'Inativo'));
    setAttendance(getAttendance());
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  // Check-ins do dia selecionado
  const filteredDailyAttendance = attendance.filter(a => a.data === selectedDate);

  // Histórico de presença do aluno selecionado no mês selecionado
  const selectedStudent = students.find(s => s.id === searchStudentId);
  const studentMonthlyAttendance = attendance.filter(
    a => a.studentId === searchStudentId && a.data.startsWith(selectedMonth)
  ).sort((a, b) => b.data.localeCompare(a.data));

  // Lida com o registro manual de presença
  const handleRegisterAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInStudentId) {
      showToast('Selecione um aluno para registrar a presença!', true);
      return;
    }

    const result = addAttendance(checkInStudentId);
    if (result.success) {
      showToast(result.message);
      setCheckInStudentId('');
      onRefresh();
    } else {
      showToast(result.message, true);
    }
  };

  return (
    <div className="attendance-view animate-fade-in">
      <div className="view-header">
        <h1>Presenças & Treinos</h1>
        <p className="section-subtitle">Frequência diária dos alunos e histórico individual de treinos</p>
      </div>

      <div className="layout-split">
        {/* Lado Esquerdo: Presença Diária */}
        <div className="left-column">
          {/* Seção Registrar Check-in Manual */}
          <div className="glass-card">
            <h3>Registrar Presença Manual</h3>
            <form onSubmit={handleRegisterAttendance} className="manual-checkin-form">
              <div className="form-group flex-1">
                <select
                  className="form-control"
                  value={checkInStudentId}
                  onChange={e => setCheckInStudentId(e.target.value)}
                >
                  <option value="">Selecione um aluno ativo...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.id} - {s.nome} ({s.status === 'Pendente' ? 'Mensalidade Vencida' : 'Em dia'})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '45px', marginTop: '8px' }}>
                Confirmar Check-in
              </button>
            </form>
          </div>

          {/* Listagem de Presença por Data */}
          <div className="glass-card" style={{ marginTop: '24px' }}>
            <div className="list-header-flex">
              <h3>Frequência no Dia</h3>
              <input
                type="date"
                className="form-control date-selector"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            {filteredDailyAttendance.length === 0 ? (
              <p className="no-data">Nenhuma presença registrada em {selectedDate.split('-').reverse().join('/')}.</p>
            ) : (
              <div className="table-container" style={{ marginTop: '16px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Aluno</th>
                      <th>Hora Check-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDailyAttendance.map(att => (
                      <tr key={att.id}>
                        <td><code>#{att.studentId}</code></td>
                        <td><strong>{att.studentNome}</strong></td>
                        <td>
                          <span className="time-badge">{att.hora}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Histórico de Aluno */}
        <div className="right-column">
          <div className="glass-card history-card">
            <h3>Histórico do Aluno</h3>
            
            <div className="history-filters">
              <div className="form-group">
                <label>Selecionar Aluno</label>
                <select
                  className="form-control"
                  value={searchStudentId}
                  onChange={e => setSearchStudentId(e.target.value)}
                >
                  <option value="">Escolha um aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome} (#{s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mês / Ano</label>
                <input
                  type="month"
                  className="form-control"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            {searchStudentId ? (
              selectedStudent ? (
                <div className="student-stats-wrapper">
                  <div className="frequency-counter">
                    <span className="freq-value">{studentMonthlyAttendance.length}</span>
                    <span className="freq-label">Treinos em {selectedMonth.split('-').reverse().join('/')}</span>
                  </div>

                  <div className="history-logs-container">
                    <h4>Histórico de Datas</h4>
                    {studentMonthlyAttendance.length === 0 ? (
                      <p className="no-data" style={{ padding: '10px 0' }}>Nenhum treino registrado neste mês.</p>
                    ) : (
                      <ul className="history-list">
                        {studentMonthlyAttendance.map(att => (
                          <li key={att.id} className="history-item">
                            <span className="h-date">{att.data.split('-').reverse().join('/')}</span>
                            <span className="h-time">Horário: {att.hora}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null
            ) : (
              <p className="no-data" style={{ marginTop: '20px' }}>Selecione um aluno acima para verificar o histórico de frequência.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .manual-checkin-form {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .flex-1 {
          flex: 1;
          min-width: 250px;
        }

        .list-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .date-selector {
          width: 170px;
        }

        .time-badge {
          background: rgba(0, 242, 254, 0.1);
          color: var(--accent-cyan);
          border: 1px solid rgba(0, 242, 254, 0.2);
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        /* Histórico de Frequência */
        .history-filters {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 12px;
          margin-top: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .student-stats-wrapper {
          margin-top: 20px;
          animation: slideUp 0.25s ease-out;
        }

        .frequency-counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(127, 86, 218, 0.1) 0%, rgba(0, 255, 135, 0.05) 100%);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 20px;
          text-align: center;
        }

        .freq-value {
          font-size: 3rem;
          font-weight: 800;
          color: var(--accent-neon);
          line-height: 1;
        }

        .freq-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .history-logs-container {
          margin-top: 24px;
        }

        .history-logs-container h4 {
          font-size: 0.95rem;
          color: var(--text-main);
          margin-bottom: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .history-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 0.9rem;
        }

        .h-date {
          font-weight: 600;
          color: var(--text-main);
        }

        .h-time {
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .history-filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
export default Presenca;
