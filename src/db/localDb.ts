/**
 * src/db/localDb.ts
 *
 * Define as interfaces TypeScript do domínio e funções auxiliares puras.
 * Toda a lógica de persistência foi movida para src/db/api.ts.
 */

export interface Student {
  id: string; // matrícula (ex: "1001")
  nome: string;
  telefone: string;
  dataCadastro: string; // YYYY-MM-DD
  plano: 'Mensal' | 'Trimestral' | 'Anual';
  valorMensalidade: number;
  diaVencimento: number;
  dataUltimoPagamento: string | null; // YYYY-MM-DD
  status: 'Ativo' | 'Inativo' | 'Pendente';
  modalidades: string[];
}

export interface Attendance {
  id: string;
  studentId: string;
  studentNome: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
}

export interface Product {
  id: string;
  nome: string;
  preco: number;
  custo: number;
  estoque: number;
  categoria: 'Suplementos' | 'Equipamentos' | 'Vestuário' | 'Outros';
}

export interface Transaction {
  id: string;
  tipo: 'Receita' | 'Despesa';
  categoria:
    | 'Mensalidade'
    | 'Venda de Produto'
    | 'Material'
    | 'Agua'
    | 'Luz'
    | 'Internet'
    | 'Aluguel'
    | 'Roupas'
    | 'Suplementos'
    | 'Venenos'
    | 'Salários'
    | 'Manutenção'
    | 'Outros';
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
  detalhes?: string;
}

export interface MonthlyClosing {
  id: string; // YYYY-MM
  anoMes: string; // YYYY-MM
  receitaMensalidades: number;
  receitaVendas: number;
  receitasOutras: number;
  despesasTotais: number;
  lucroLiquido: number;
  dataFechamento: string; // YYYY-MM-DD
  totalPresencas: number;
  totalVendas: number;
}

// ─── Helpers puros (sem side-effects) ──────────────────────────────────────

/** Retorna a data de hoje no formato YYYY-MM-DD no fuso local */
export const getLocalDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Calcula a data de vencimento seguinte com base no último pagamento e plano */
export const calculateNextDueDate = (student: Student): Date => {
  const baseDateStr = student.dataUltimoPagamento || student.dataCadastro;
  const baseDate = new Date(baseDateStr + 'T12:00:00');

  let monthsToAdd = 1;
  if (student.plano === 'Trimestral') monthsToAdd = 3;
  if (student.plano === 'Anual') monthsToAdd = 12;

  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  nextDate.setDate(student.diaVencimento);

  return nextDate;
};

/** Calcula o status do aluno dinamicamente (Ativo, Pendente, Inativo) */
export const getStudentStatus = (student: Student): 'Ativo' | 'Inativo' | 'Pendente' => {
  if (student.status === 'Inativo') return 'Inativo';

  if (!student.dataUltimoPagamento) {
    const cadastro = new Date(student.dataCadastro + 'T12:00:00');
    const hoje = new Date();
    const diffDays = Math.ceil(
      Math.abs(hoje.getTime() - cadastro.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 3 ? 'Pendente' : 'Ativo';
  }

  const nextDueDate = calculateNextDueDate(student);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const nextDueZero = new Date(nextDueDate);
  nextDueZero.setHours(0, 0, 0, 0);

  return hoje > nextDueZero ? 'Pendente' : 'Ativo';
};
