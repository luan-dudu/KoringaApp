import React, { useState, useEffect } from 'react';
import {
  getStudents,
  saveStudent,
  deleteStudent,
  recordPayment,
} from '../db/api';
import { getLocalDateString, type Student } from '../db/localDb';
import { Modal } from '../components/Modal';

interface AlunosProps {
  showToast: (message: string, isError?: boolean) => void;
  triggerRefresh: boolean;
  onRefresh: () => void;
}

export const Alunos: React.FC<AlunosProps> = ({ showToast, triggerRefresh, onRefresh }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Pendente' | 'Inativo'>('Todos');
  
  // Estados do Modal de Cadastro/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Campos do formulário
  const [formId, setFormId] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formPlano, setFormPlano] = useState<'Mensal' | 'Trimestral' | 'Anual'>('Mensal');
  const [formValor, setFormValor] = useState(120);
  const [formVencimento, setFormVencimento] = useState(10);
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formModalidades, setFormModalidades] = useState<string[]>([]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch {
      showToast('Erro ao carregar alunos. Verifique a conexão.', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, [triggerRefresh]);

  // Atualiza valor padrão da mensalidade ao mudar o plano no formulário
  useEffect(() => {
    if (!editingStudent) {
      if (formPlano === 'Mensal') setFormValor(120);
      else if (formPlano === 'Trimestral') setFormValor(300);
      else if (formPlano === 'Anual') setFormValor(1000);
    }
  }, [formPlano, editingStudent]);

  // Filtros
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.includes(searchTerm) ||
                          student.telefone.includes(searchTerm) ||
                          (student.modalidades && student.modalidades.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'Todos' ? true : student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Abre modal de cadastro
  const handleOpenRegisterModal = () => {
    setEditingStudent(null);
    // Gera matrícula automática incremental
    const activeIds = students.map(s => parseInt(s.id)).filter(id => !isNaN(id));
    const nextId = activeIds.length > 0 ? Math.max(...activeIds) + 1 : 1001;
    
    setFormId(String(nextId));
    setFormNome('');
    setFormTelefone('');
    setFormPlano('Mensal');
    setFormValor(120);
    setFormVencimento(10);
    setFormStatus('Ativo');
    setFormModalidades([]);
    setIsModalOpen(true);
  };

  // Abre modal de edição
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormId(student.id);
    setFormNome(student.nome);
    setFormTelefone(student.telefone);
    setFormPlano(student.plano);
    setFormValor(student.valorMensalidade);
    setFormVencimento(student.diaVencimento);
    setFormStatus(student.status === 'Inativo' ? 'Inativo' : 'Ativo');
    setFormModalidades(student.modalidades || []);
    setIsModalOpen(true);
  };

  // Salva cadastro/edição
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      showToast('O nome do aluno é obrigatório!', true);
      return;
    }

    const today = getLocalDateString();
    const studentData: Student = {
      id: formId,
      nome: formNome.trim(),
      telefone: formTelefone.trim() || 'Sem Telefone',
      dataCadastro: editingStudent ? editingStudent.dataCadastro : today,
      plano: formPlano,
      valorMensalidade: Number(formValor),
      diaVencimento: Number(formVencimento),
      dataUltimoPagamento: editingStudent ? editingStudent.dataUltimoPagamento : null,
      status: formStatus === 'Inativo' ? 'Inativo' : 'Ativo',
      modalidades: formModalidades,
    };

    try {
      await saveStudent(studentData);
      showToast(editingStudent ? 'Dados do aluno atualizados!' : 'Aluno cadastrado com sucesso!');
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showToast('Erro ao salvar aluno. Tente novamente.', true);
    }
  };

  // Confirmação de Pagamento
  const handleConfirmPayment = async (id: string) => {
    try {
      const result = await recordPayment(id);
      if (result.success) {
        showToast(result.message);
        onRefresh();
      } else {
        showToast(result.message, true);
      }
    } catch {
      showToast('Erro ao registrar pagamento. Tente novamente.', true);
    }
  };

  // Alterna status de Atividade
  const handleToggleActive = async (student: Student) => {
    const updated: Student = {
      ...student,
      status: student.status === 'Inativo' ? 'Ativo' : 'Inativo',
    };
    try {
      await saveStudent(updated);
      showToast(`Aluno ${student.nome} foi ${updated.status === 'Inativo' ? 'inativado' : 'reativado'}!`);
      onRefresh();
    } catch {
      showToast('Erro ao atualizar status do aluno.', true);
    }
  };

  // Excluir Aluno
  const handleDelete = async (student: Student) => {
    if (confirm(`Tem certeza que deseja excluir o aluno ${student.nome}? Esta ação é permanente.`)) {
      try {
        await deleteStudent(student.id);
        showToast(`Aluno ${student.nome} excluído.`);
        onRefresh();
      } catch {
        showToast('Erro ao excluir aluno.', true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="students-view animate-fade-in">
        <p className="no-data">Carregando alunos...</p>
      </div>
    );
  }

  return (
    <div className="students-view animate-fade-in">
      <div className="view-header flex-header">
        <div>
          <h1>Gestão de Alunos</h1>
          <p className="section-subtitle">Matrículas, planos e controle de pagamentos</p>
        </div>
        <button onClick={handleOpenRegisterModal} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Cadastrar Aluno
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="filter-bar glass-card">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Buscar por nome, matrícula ou telefone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        
        <div className="filter-selects">
          <label style={{ marginRight: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status:</label>
          <select 
            className="form-control" 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            style={{ width: '150px' }}
          >
            <option value="Todos">Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Pendente">Pendentes</option>
            <option value="Inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <div className="glass-card">
        {filteredStudents.length === 0 ? (
          <p className="no-data">Nenhum aluno encontrado para os filtros selecionados.</p>
        ) : (
          <>
            {/* Tabela — visível apenas em desktop */}
            <div className="table-container desktop-table">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Plano</th>
                    <th>Valor</th>
                    <th>Venc.</th>
                    <th>Últ. Pagto</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td><code>#{student.id}</code></td>
                      <td>
                        <strong>{student.nome}</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {student.modalidades && student.modalidades.map(m => (
                            <span key={m} style={{
                              fontSize: '0.65rem',
                              background: 'rgba(0, 242, 254, 0.08)',
                              color: 'var(--accent-cyan)',
                              border: '1px solid rgba(0, 242, 254, 0.15)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{student.telefone}</td>
                      <td><span className="plan-badge">{student.plano}</span></td>
                      <td>R$ {student.valorMensalidade.toFixed(2)}</td>
                      <td>Dia {student.diaVencimento}</td>
                      <td>{student.dataUltimoPagamento ? student.dataUltimoPagamento.split('-').reverse().join('/') : '-'}</td>
                      <td>
                        <span className={`badge badge-${student.status.toLowerCase()}`}>
                          {student.status === 'Pendente' ? 'Vencido' : student.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          {(student.status === 'Pendente' || student.status === 'Ativo') && (
                            <button onClick={() => handleConfirmPayment(student.id)} className="btn btn-success btn-sm-action" title="Confirmar Pagamento">
                              R$ Receber
                            </button>
                          )}
                          <button onClick={() => handleOpenEditModal(student)} className="btn-icon" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleToggleActive(student)} className={`btn-icon ${student.status === 'Inativo' ? 'reactivate-btn' : 'deactivate-btn'}`} title={student.status === 'Inativo' ? 'Reativar' : 'Inativar'}>
                            {student.status === 'Inativo' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            )}
                          </button>
                          <button onClick={() => handleDelete(student)} className="btn-icon delete-btn" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — visível apenas em mobile */}
            <div className="mobile-cards-list">
              {filteredStudents.map(student => (
                <div key={student.id} className="student-mobile-card">
                  <div className="smc-header">
                    <div className="smc-info">
                      <strong className="smc-name">{student.nome}</strong>
                      <code className="smc-id">#{student.id} · {student.telefone}</code>
                    </div>
                    <span className={`badge badge-${student.status.toLowerCase()}`}>
                      {student.status === 'Pendente' ? 'Vencido' : student.status}
                    </span>
                  </div>

                  {student.modalidades && student.modalidades.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {student.modalidades.map(m => (
                        <span key={m} style={{ fontSize: '0.65rem', background: 'rgba(0,242,254,0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,242,254,0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>{m}</span>
                      ))}
                    </div>
                  )}

                  <div className="smc-details">
                    <div className="smc-detail-row"><span className="smc-label">Plano</span><span className="plan-badge">{student.plano}</span></div>
                    <div className="smc-detail-row"><span className="smc-label">Mensalidade</span><span className="smc-value">R$ {student.valorMensalidade.toFixed(2)}</span></div>
                    <div className="smc-detail-row"><span className="smc-label">Vencimento</span><span className="smc-value">Dia {student.diaVencimento}</span></div>
                    <div className="smc-detail-row"><span className="smc-label">Últ. Pagamento</span><span className="smc-value">{student.dataUltimoPagamento ? student.dataUltimoPagamento.split('-').reverse().join('/') : '—'}</span></div>
                  </div>

                  <div className="smc-actions">
                    {(student.status === 'Pendente' || student.status === 'Ativo') && (
                      <button onClick={() => handleConfirmPayment(student.id)} className="btn btn-success btn-sm-action" style={{ flex: 1 }}>💰 Receber</button>
                    )}
                    <button onClick={() => handleOpenEditModal(student)} className="btn-icon" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleToggleActive(student)} className={`btn-icon ${student.status === 'Inativo' ? 'reactivate-btn' : 'deactivate-btn'}`}>
                      {student.status === 'Inativo' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      )}
                    </button>
                    <button onClick={() => handleDelete(student)} className="btn-icon delete-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Cadastro e Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Editar Aluno - Matrícula #${formId}` : 'Cadastrar Novo Aluno'}
        footerButtons={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingStudent ? 'Salvar Alterações' : 'Concluir Cadastro'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Matrícula (Código)</label>
              <input
                type="text"
                className="form-control"
                value={formId}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Status do Aluno</label>
              <select
                className="form-control"
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as any)}
              >
                <option value="Ativo">Ativo (Gera cobrança)</option>
                <option value="Inativo">Inativo (Bloqueado/Sem treino)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Nome Completo do Aluno</label>
            <input
              type="text"
              className="form-control"
              placeholder="Digite o nome completo..."
              value={formNome}
              onChange={e => setFormNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone / WhatsApp</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: (11) 99999-9999"
              value={formTelefone}
              onChange={e => setFormTelefone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Modalidades Praticadas</label>
            <div className="modalidades-checkboxes-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
              padding: '12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              marginTop: '4px'
            }}>
              {['MMA', 'Muay Thai', 'Boxe', 'Jiu-Jitsu', 'Muay Thai Feminino', 'Muay Thai Kids', 'Preparação Física', 'Capoeira'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={formModalidades.includes(m)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormModalidades([...formModalidades, m]);
                      } else {
                        setFormModalidades(formModalidades.filter(x => x !== m));
                      }
                    }}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Plano</label>
              <select
                className="form-control"
                value={formPlano}
                onChange={e => setFormPlano(e.target.value as any)}
              >
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valor Mensalidade (R$)</label>
              <input
                type="number"
                className="form-control"
                value={formValor}
                onChange={e => setFormValor(Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Dia de Vencimento</label>
              <select
                className="form-control"
                value={formVencimento}
                onChange={e => setFormVencimento(Number(e.target.value))}
              >
                {[1, 5, 10, 15, 20, 25, 28].map(day => (
                  <option key={day} value={day}>Dia {day}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <style>{`
        .flex-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .filter-selects {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .plan-badge {
          background: rgba(127, 86, 218, 0.12);
          color: #a5b4fc;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .actions-cell {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .btn-sm-action {
          padding: 6px 10px;
          font-size: 0.78rem;
          border-radius: var(--border-radius-sm);
        }

        .delete-btn:hover {
          color: var(--accent-danger) !important;
          border-color: rgba(255, 71, 126, 0.3) !important;
          background: rgba(255, 71, 126, 0.05) !important;
        }

        .deactivate-btn:hover {
          color: var(--accent-warning) !important;
          border-color: rgba(255, 184, 48, 0.3) !important;
        }

        .reactivate-btn:hover {
          color: var(--accent-neon) !important;
          border-color: rgba(0, 255, 135, 0.3) !important;
        }

        /* Formulários do Modal */
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 16px;
        }

        /* Mobile card list */
        .mobile-cards-list {
          display: none;
          flex-direction: column;
          gap: 12px;
        }

        .student-mobile-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .smc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .smc-info { display: flex; flex-direction: column; gap: 2px; }
        .smc-name { font-size: 1rem; font-weight: 700; }
        .smc-id { font-size: 0.75rem; color: var(--text-muted); }

        .smc-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(0,0,0,0.15);
          border-radius: 8px;
          padding: 10px;
        }

        .smc-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .smc-label { color: var(--text-muted); font-size: 0.8rem; }
        .smc-value { color: var(--text-main); font-weight: 500; }

        .smc-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .flex-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .flex-header .btn {
            width: 100%;
            justify-content: center;
          }
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
          }
          .desktop-table {
            display: none;
          }
          .mobile-cards-list {
            display: flex;
          }
          .filter-selects {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
export default Alunos;
