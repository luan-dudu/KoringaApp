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
  categoria: 'Mensalidade' | 'Venda de Produto' | 'Material' | 'Agua' | 'Luz' | 'Internet' | 'Aluguel' | 'Roupas' | 'Suplementos' | 'Venenos' | 'Salários' | 'Manutenção' | 'Outros';
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
  detalhes?: string;
}

export interface MonthlyClosing {
  id: string; // YYYY-MM
  anoMes: string; // YYYY-MM (ex: "2026-07")
  receitaMensalidades: number;
  receitaVendas: number;
  receitasOutras: number;
  despesasTotais: number;
  lucroLiquido: number;
  dataFechamento: string; // YYYY-MM-DD
  totalPresencas: number;
  totalVendas: number;
}

// Chaves para LocalStorage
const KEYS = {
  STUDENTS: 'fitmanager_students',
  ATTENDANCE: 'fitmanager_attendance',
  PRODUCTS: 'fitmanager_products',
  TRANSACTIONS: 'fitmanager_transactions',
  CLOSINGS: 'fitmanager_closings',
};

// Auxiliar para obter data local ajustada para YYYY-MM-DD no fuso local
export const getLocalDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calcula a data de vencimento seguinte com base no último pagamento e dia de vencimento
export const calculateNextDueDate = (student: Student): Date => {
  const baseDateStr = student.dataUltimoPagamento || student.dataCadastro;
  const baseDate = new Date(baseDateStr + 'T12:00:00'); // Evita problemas de fuso horário
  
  let monthsToAdd = 1;
  if (student.plano === 'Trimestral') monthsToAdd = 3;
  if (student.plano === 'Anual') monthsToAdd = 12;

  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  nextDate.setDate(student.diaVencimento);

  return nextDate;
};

// Calcula dinamicamente o status do aluno (Ativo, Pendente, Inativo)
export const getStudentStatus = (student: Student): 'Ativo' | 'Inativo' | 'Pendente' => {
  if (student.status === 'Inativo') return 'Inativo';
  
  // Se nunca pagou e foi cadastrado há mais de 3 dias, está pendente
  if (!student.dataUltimoPagamento) {
    const cadastro = new Date(student.dataCadastro + 'T12:00:00');
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - cadastro.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3 ? 'Pendente' : 'Ativo';
  }

  const nextDueDate = calculateNextDueDate(student);
  const hoje = new Date();
  
  // Zera horas para comparação precisa de data
  hoje.setHours(0, 0, 0, 0);
  const nextDueZero = new Date(nextDueDate);
  nextDueZero.setHours(0, 0, 0, 0);

  return hoje > nextDueZero ? 'Pendente' : 'Ativo';
};

// Dados Iniciais Simulados (Seed Data)
const mockStudents: Student[] = [
  {
    id: '1001',
    nome: 'João Silva',
    telefone: '(11) 98765-4321',
    dataCadastro: '2026-05-10',
    plano: 'Mensal',
    valorMensalidade: 120.0,
    diaVencimento: 5,
    dataUltimoPagamento: '2026-07-05',
    status: 'Ativo',
    modalidades: ['Jiu-Jitsu', 'Muay Thai'],
  },
  {
    id: '1002',
    nome: 'Maria Oliveira',
    telefone: '(11) 91234-5678',
    dataCadastro: '2026-07-28',
    plano: 'Mensal',
    valorMensalidade: 120.0,
    diaVencimento: 10,
    dataUltimoPagamento: null,
    status: 'Pendente',
    modalidades: ['Jiu-Jitsu'],
  },
  {
    id: '1003',
    nome: 'Carlos Souza',
    telefone: '(21) 99888-7766',
    dataCadastro: '2026-05-15',
    plano: 'Trimestral',
    valorMensalidade: 300.0,
    diaVencimento: 15,
    dataUltimoPagamento: '2026-05-15',
    status: 'Ativo',
    modalidades: ['Muay Thai'],
  },
  {
    id: '1004',
    nome: 'Ana Costa',
    telefone: '(31) 97777-8888',
    dataCadastro: '2026-04-20',
    plano: 'Mensal',
    valorMensalidade: 120.0,
    diaVencimento: 20,
    dataUltimoPagamento: '2026-06-20',
    status: 'Pendente',
    modalidades: ['Muay Thai', 'Boxe'],
  },
  {
    id: '1005',
    nome: 'Lucas Pereira',
    telefone: '(11) 96666-5555',
    dataCadastro: '2026-01-01',
    plano: 'Anual',
    valorMensalidade: 1000.0,
    diaVencimento: 1,
    dataUltimoPagamento: '2026-01-01',
    status: 'Ativo',
    modalidades: ['Jiu-Jitsu', 'MMA'],
  },
  {
    id: '1006',
    nome: 'Mariana Lima',
    telefone: '(11) 95555-4444',
    dataCadastro: '2026-07-25',
    plano: 'Mensal',
    valorMensalidade: 120.0,
    diaVencimento: 25,
    dataUltimoPagamento: '2026-07-25',
    status: 'Ativo',
    modalidades: ['Boxe'],
  },
  {
    id: '1007',
    nome: 'Roberto Dias',
    telefone: '(11) 94444-3333',
    dataCadastro: '2025-12-10',
    plano: 'Mensal',
    valorMensalidade: 110.0,
    diaVencimento: 10,
    dataUltimoPagamento: '2026-02-10',
    status: 'Inativo',
    modalidades: ['Jiu-Jitsu'],
  }
];

const mockProducts: Product[] = [
  {
    id: 'P1',
    nome: 'Whey Protein Concentrado 900g',
    preco: 160.0,
    custo: 95.0,
    estoque: 15,
    categoria: 'Suplementos',
  },
  {
    id: 'P2',
    nome: 'Creatina Monohidratada 250g',
    preco: 90.0,
    custo: 50.0,
    estoque: 22,
    categoria: 'Suplementos',
  },
  {
    id: 'P3',
    nome: 'Luvas de Musculação Profissional',
    preco: 55.0,
    custo: 25.0,
    estoque: 8,
    categoria: 'Equipamentos',
  },
  {
    id: 'P4',
    nome: 'Coqueteleira Inox 700ml',
    preco: 40.0,
    custo: 18.0,
    estoque: 12,
    categoria: 'Equipamentos',
  },
  {
    id: 'P5',
    nome: 'Camiseta Dry Fit Koringa',
    preco: 70.0,
    custo: 30.0,
    estoque: 2, // Estoque baixo para testar avisos
    categoria: 'Vestuário',
  },
];

const mockAttendance: Attendance[] = [
  // Presenças de Ontem (01/08)
  { id: 'att1', studentId: '1001', studentNome: 'João Silva', data: '2026-08-01', hora: '07:15' },
  { id: 'att2', studentId: '1003', studentNome: 'Carlos Souza', data: '2026-08-01', hora: '08:30' },
  { id: 'att3', studentId: '1005', studentNome: 'Lucas Pereira', data: '2026-08-01', hora: '18:45' },
  { id: 'att4', studentId: '1006', studentNome: 'Mariana Lima', data: '2026-08-01', hora: '19:20' },
  // Presenças de Hoje (02/08)
  { id: 'att5', studentId: '1001', studentNome: 'João Silva', data: '2026-08-02', hora: '07:05' },
  { id: 'att6', studentId: '1005', studentNome: 'Lucas Pereira', data: '2026-08-02', hora: '17:30' },
];

const mockTransactions: Transaction[] = [
  // Transações de Junho
  { id: 't1', tipo: 'Despesa', categoria: 'Aluguel', descricao: 'Aluguel do Salão Junho', valor: 2200.0, data: '2026-06-05' },
  { id: 't2', tipo: 'Despesa', categoria: 'Salários', descricao: 'Salários da Equipe Junho', valor: 3500.0, data: '2026-06-01' },
  { id: 't3', tipo: 'Despesa', categoria: 'Manutenção', descricao: 'Reparo esteira 3', valor: 250.0, data: '2026-06-12' },
  { id: 't4', tipo: 'Receita', categoria: 'Mensalidade', descricao: 'Mensalidade João Silva', valor: 120.0, data: '2026-06-05', detalhes: 'Aluno: João Silva (1001)' },
  { id: 't5', tipo: 'Receita', categoria: 'Mensalidade', descricao: 'Mensalidade Carlos Souza', valor: 300.0, data: '2026-06-15', detalhes: 'Aluno: Carlos Souza (1003)' },
  { id: 't6', tipo: 'Receita', categoria: 'Venda de Produto', descricao: 'Venda: Whey Protein + Creatina', valor: 250.0, data: '2026-06-20', detalhes: 'Venda Balcão' },
  
  // Transações de Julho
  { id: 't7', tipo: 'Despesa', categoria: 'Aluguel', descricao: 'Aluguel do Salão Julho', valor: 2200.0, data: '2026-07-05' },
  { id: 't8', tipo: 'Despesa', categoria: 'Salários', descricao: 'Salários da Equipe Julho', valor: 3500.0, data: '2026-07-01' },
  { id: 't9', tipo: 'Despesa', categoria: 'Outros', descricao: 'Conta de Energia + Água', valor: 480.0, data: '2026-07-10' },
  { id: 't10', tipo: 'Receita', categoria: 'Mensalidade', descricao: 'Mensalidade João Silva', valor: 120.0, data: '2026-07-05', detalhes: 'Aluno: João Silva (1001)' },
  { id: 't11', tipo: 'Receita', categoria: 'Mensalidade', descricao: 'Mensalidade Mariana Lima', valor: 120.0, data: '2026-07-25', detalhes: 'Aluno: Mariana Lima (1006)' },
  { id: 't12', tipo: 'Receita', categoria: 'Venda de Produto', descricao: 'Venda: 1x Creatina', valor: 90.0, data: '2026-07-12', detalhes: 'Venda Balcão' },
  { id: 't13', tipo: 'Receita', categoria: 'Venda de Produto', descricao: 'Venda: 1x Luvas de Musculação', valor: 55.0, data: '2026-07-18', detalhes: 'Aluno: João Silva (1001)' },
];

const mockClosings: MonthlyClosing[] = [
  {
    id: '2026-06',
    anoMes: '2026-06',
    receitaMensalidades: 420.0,
    receitaVendas: 250.0,
    receitasOutras: 0,
    despesasTotais: 5950.0,
    lucroLiquido: -5280.0,
    dataFechamento: '2026-06-30',
    totalPresencas: 84,
    totalVendas: 3,
  }
];

// Funções de Inicialização e manipulação do DB no LocalStorage
export const initializeDb = (): void => {
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(mockStudents));
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(mockProducts));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(mockAttendance));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(mockTransactions));
  }
  if (!localStorage.getItem(KEYS.CLOSINGS)) {
    localStorage.setItem(KEYS.CLOSINGS, JSON.stringify(mockClosings));
  }
};

// Funções genéricas de get/set
export const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// API Alunos
export const getStudents = (): Student[] => {
  initializeDb();
  const students = getFromStorage<Student>(KEYS.STUDENTS);
  
  // Atualiza dinamicamente os status de todos os alunos ao carregar e migra dados antigos
  let changed = false;
  const updatedStudents = students.map((student) => {
    if (!student.modalidades) {
      if (student.id === '1001') student.modalidades = ['Jiu-Jitsu', 'Muay Thai'];
      else if (student.id === '1003') student.modalidades = ['Muay Thai'];
      else if (student.id === '1004') student.modalidades = ['Muay Thai', 'Boxe'];
      else if (student.id === '1005') student.modalidades = ['Jiu-Jitsu', 'MMA'];
      else if (student.id === '1006') student.modalidades = ['Boxe'];
      else student.modalidades = ['Jiu-Jitsu'];
      changed = true;
    }
    const calculatedStatus = getStudentStatus(student);
    if (student.status !== calculatedStatus) {
      changed = true;
      return { ...student, status: calculatedStatus };
    }
    return student;
  });

  if (changed) {
    setToStorage(KEYS.STUDENTS, updatedStudents);
  }

  return updatedStudents;
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === student.id);
  
  // Garante que o status inicial está correto
  student.status = getStudentStatus(student);

  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  setToStorage(KEYS.STUDENTS, students);
};

export const deleteStudent = (id: string): void => {
  const students = getStudents();
  const filtered = students.filter((s) => s.id !== id);
  setToStorage(KEYS.STUDENTS, filtered);
};

// API Presença
export const getAttendance = (): Attendance[] => {
  initializeDb();
  return getFromStorage<Attendance>(KEYS.ATTENDANCE);
};

export const addAttendance = (studentId: string): { success: boolean; message: string } => {
  const students = getStudents();
  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return { success: false, message: 'Aluno não encontrado!' };
  }

  if (student.status === 'Inativo') {
    return { success: false, message: 'Aluno inativo. Não é permitido check-in!' };
  }

  const today = getLocalDateString();
  const currentAttendance = getAttendance();
  
  // Verifica se o aluno já fez check-in hoje
  const alreadyCheckedIn = currentAttendance.some(
    (att) => att.studentId === studentId && att.data === today
  );

  if (alreadyCheckedIn) {
    return { success: false, message: 'Aluno já registrou presença hoje!' };
  }

  const now = new Date();
  const hora = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const newAttendance: Attendance = {
    id: `att_${Date.now()}`,
    studentId: student.id,
    studentNome: student.nome,
    data: today,
    hora: hora,
  };

  currentAttendance.push(newAttendance);
  setToStorage(KEYS.ATTENDANCE, currentAttendance);

  return { success: true, message: `Check-in realizado com sucesso para ${student.nome} às ${hora}!` };
};

// API Produtos
export const getProducts = (): Product[] => {
  initializeDb();
  return getFromStorage<Product>(KEYS.PRODUCTS);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);

  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  setToStorage(KEYS.PRODUCTS, products);
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  setToStorage(KEYS.PRODUCTS, filtered);
};

// API Transações
export const getTransactions = (): Transaction[] => {
  initializeDb();
  return getFromStorage<Transaction>(KEYS.TRANSACTIONS);
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  setToStorage(KEYS.TRANSACTIONS, transactions);
};

// Registrar Pagamento de Mensalidade
export const recordPayment = (studentId: string): { success: boolean; message: string } => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === studentId);

  if (index === -1) {
    return { success: false, message: 'Aluno não encontrado!' };
  }

  const student = students[index];
  const todayStr = getLocalDateString();

  // Atualiza último pagamento
  student.dataUltimoPagamento = todayStr;
  student.status = 'Ativo'; // Força ativo após pagar

  students[index] = student;
  setToStorage(KEYS.STUDENTS, students);

  // Lança a receita no financeiro
  const newTransaction: Transaction = {
    id: `t_${Date.now()}`,
    tipo: 'Receita',
    categoria: 'Mensalidade',
    descricao: `Mensalidade paga - ${student.nome}`,
    valor: student.valorMensalidade,
    data: todayStr,
    detalhes: `Aluno: ${student.nome} (${student.id}) | Plano: ${student.plano}`,
  };

  saveTransaction(newTransaction);

  return { success: true, message: `Pagamento de R$ ${student.valorMensalidade.toFixed(2)} registrado para ${student.nome}!` };
};

// Registrar Venda de Produto
export const recordSale = (
  productId: string,
  quantity: number,
  studentId?: string,
  buyerName?: string
): { success: boolean; message: string } => {
  const products = getProducts();
  const pIndex = products.findIndex((p) => p.id === productId);

  if (pIndex === -1) {
    return { success: false, message: 'Produto não encontrado!' };
  }

  const product = products[pIndex];

  if (product.estoque < quantity) {
    return { success: false, message: `Estoque insuficiente! Apenas ${product.estoque} unidades disponíveis.` };
  }

  // Reduz estoque
  product.estoque -= quantity;
  products[pIndex] = product;
  setToStorage(KEYS.PRODUCTS, products);

  // Identifica o comprador
  let finalBuyer = buyerName || 'Cliente Avulso';
  if (studentId) {
    const students = getStudents();
    const student = students.find((s) => s.id === studentId);
    if (student) {
      finalBuyer = `${student.nome} (${student.id})`;
    }
  }

  const totalValue = product.preco * quantity;
  const todayStr = getLocalDateString();

  // Lança transação financeira
  const newTransaction: Transaction = {
    id: `t_${Date.now()}`,
    tipo: 'Receita',
    categoria: 'Venda de Produto',
    descricao: `Venda de ${quantity}x ${product.nome}`,
    valor: totalValue,
    data: todayStr,
    detalhes: `Comprador: ${finalBuyer} | Preço Unitário: R$ ${product.preco.toFixed(2)}`,
  };

  saveTransaction(newTransaction);

  return {
    success: true,
    message: `Venda de R$ ${totalValue.toFixed(2)} (${quantity}x ${product.nome}) realizada com sucesso!`,
  };
};

// API Fechamentos Mensais
export const getClosings = (): MonthlyClosing[] => {
  initializeDb();
  return getFromStorage<MonthlyClosing>(KEYS.CLOSINGS);
};

export const closeMonth = (anoMes: string): { success: boolean; message: string } => {
  const closings = getClosings();
  const alreadyClosed = closings.some((c) => c.anoMes === anoMes);

  if (alreadyClosed) {
    return { success: false, message: `O mês ${anoMes} já está fechado!` };
  }

  const transactions = getTransactions();
  const attendance = getAttendance();

  // Filtra transações daquele mês
  const monthlyTransactions = transactions.filter((t) => t.data.startsWith(anoMes));
  
  let receitaMensalidades = 0;
  let receitaVendas = 0;
  let receitasOutras = 0;
  let despesasTotais = 0;
  let totalVendas = 0;

  monthlyTransactions.forEach((t) => {
    if (t.tipo === 'Receita') {
      if (t.categoria === 'Mensalidade') receitaMensalidades += t.valor;
      else if (t.categoria === 'Venda de Produto') {
        receitaVendas += t.valor;
        totalVendas += 1;
      }
      else receitasOutras += t.valor;
    } else {
      despesasTotais += t.valor;
    }
  });

  // Filtra presenças daquele mês
  const totalPresencas = attendance.filter((a) => a.data.startsWith(anoMes)).length;
  const lucroLiquido = (receitaMensalidades + receitaVendas + receitasOutras) - despesasTotais;

  const newClosing: MonthlyClosing = {
    id: anoMes,
    anoMes: anoMes,
    receitaMensalidades,
    receitaVendas,
    receitasOutras,
    despesasTotais,
    lucroLiquido,
    dataFechamento: getLocalDateString(),
    totalPresencas,
    totalVendas,
  };

  closings.push(newClosing);
  setToStorage(KEYS.CLOSINGS, closings);

  return {
    success: true,
    message: `Fechamento do mês ${anoMes} realizado com sucesso! Lucro Líquido: R$ ${lucroLiquido.toFixed(2)}`,
  };
};
