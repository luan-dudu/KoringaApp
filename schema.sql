-- =============================================================
--  KORINGAAPP — Schema PostgreSQL para Neon
--  Execute este script no SQL Editor do painel do Neon:
--  https://console.neon.tech → seu projeto → SQL Editor
-- =============================================================


-- ─────────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE plano_type AS ENUM ('Mensal', 'Trimestral', 'Anual');

CREATE TYPE student_status AS ENUM ('Ativo', 'Inativo', 'Pendente');

CREATE TYPE product_categoria AS ENUM ('Suplementos', 'Equipamentos', 'Vestuário', 'Outros');

CREATE TYPE transaction_tipo AS ENUM ('Receita', 'Despesa');

CREATE TYPE transaction_categoria AS ENUM (
  'Mensalidade',
  'Venda de Produto',
  'Material',
  'Agua',
  'Luz',
  'Internet',
  'Aluguel',
  'Roupas',
  'Suplementos',
  'Venenos',
  'Salários',
  'Manutenção',
  'Outros'
);


-- ─────────────────────────────────────────────
--  TABELAS
-- ─────────────────────────────────────────────

-- Alunos
CREATE TABLE IF NOT EXISTS students (
  id                    TEXT PRIMARY KEY,            -- matrícula ex: "1001"
  nome                  TEXT        NOT NULL,
  telefone              TEXT        NOT NULL,
  data_cadastro         DATE        NOT NULL,
  plano                 plano_type  NOT NULL,
  valor_mensalidade     NUMERIC(10,2) NOT NULL,
  dia_vencimento        SMALLINT    NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  data_ultimo_pagamento DATE,                        -- NULL = nunca pagou
  status                student_status NOT NULL DEFAULT 'Ativo',
  modalidades           TEXT[]      NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Presença
CREATE TABLE IF NOT EXISTS attendance (
  id            TEXT PRIMARY KEY,                    -- ex: "att_1234567890"
  student_id    TEXT        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_nome  TEXT        NOT NULL,               -- desnormalizado para performance
  data          DATE        NOT NULL,
  hora          TEXT        NOT NULL,               -- "HH:MM"
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Produtos da loja
CREATE TABLE IF NOT EXISTS products (
  id         TEXT PRIMARY KEY,                       -- ex: "P1"
  nome       TEXT               NOT NULL,
  preco      NUMERIC(10,2)      NOT NULL,
  custo      NUMERIC(10,2)      NOT NULL,
  estoque    INTEGER            NOT NULL DEFAULT 0,
  categoria  product_categoria  NOT NULL,
  created_at TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id         TEXT                  PRIMARY KEY,      -- ex: "t_1234567890"
  tipo       transaction_tipo      NOT NULL,
  categoria  transaction_categoria NOT NULL,
  descricao  TEXT                  NOT NULL,
  valor      NUMERIC(10,2)         NOT NULL,
  data       DATE                  NOT NULL,
  detalhes   TEXT,
  created_at TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- Fechamentos mensais
CREATE TABLE IF NOT EXISTS monthly_closings (
  id                    TEXT PRIMARY KEY,            -- ex: "2026-06"
  ano_mes               TEXT        NOT NULL UNIQUE, -- "YYYY-MM"
  receita_mensalidades  NUMERIC(10,2) NOT NULL DEFAULT 0,
  receita_vendas        NUMERIC(10,2) NOT NULL DEFAULT 0,
  receitas_outras       NUMERIC(10,2) NOT NULL DEFAULT 0,
  despesas_totais       NUMERIC(10,2) NOT NULL DEFAULT 0,
  lucro_liquido         NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_fechamento       DATE          NOT NULL,
  total_presencas       INTEGER       NOT NULL DEFAULT 0,
  total_vendas          INTEGER       NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Configuração do Telegram (uma linha só — upsert sempre no id fixo)
CREATE TABLE IF NOT EXISTS telegram_config (
  id          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- garante só 1 linha
  bot_token   TEXT,
  chat_id     TEXT,
  enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
--  ÍNDICES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_data       ON attendance(data);
CREATE INDEX IF NOT EXISTS idx_transactions_data     ON transactions(data);
CREATE INDEX IF NOT EXISTS idx_transactions_tipo     ON transactions(tipo);
CREATE INDEX IF NOT EXISTS idx_students_status       ON students(status);


-- ─────────────────────────────────────────────
--  TRIGGER: atualiza updated_at automaticamente
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_telegram_updated_at
  BEFORE UPDATE ON telegram_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
--  SEED DATA — mesmos dados mock do localStorage atual
--  (pule esta seção se quiser começar com banco vazio)
-- =============================================================

-- Alunos
INSERT INTO students (id, nome, telefone, data_cadastro, plano, valor_mensalidade, dia_vencimento, data_ultimo_pagamento, status, modalidades)
VALUES
  ('1001', 'João Silva',    '(11) 98765-4321', '2026-05-10', 'Mensal',     120.00,  5, '2026-07-05', 'Ativo',    ARRAY['Jiu-Jitsu','Muay Thai']),
  ('1002', 'Maria Oliveira','(11) 91234-5678', '2026-07-28', 'Mensal',     120.00, 10,  NULL,        'Pendente', ARRAY['Jiu-Jitsu']),
  ('1003', 'Carlos Souza',  '(21) 99888-7766', '2026-05-15', 'Trimestral', 300.00, 15, '2026-05-15', 'Ativo',    ARRAY['Muay Thai']),
  ('1004', 'Ana Costa',     '(31) 97777-8888', '2026-04-20', 'Mensal',     120.00, 20, '2026-06-20', 'Pendente', ARRAY['Muay Thai','Boxe']),
  ('1005', 'Lucas Pereira', '(11) 96666-5555', '2026-01-01', 'Anual',     1000.00,  1, '2026-01-01', 'Ativo',    ARRAY['Jiu-Jitsu','MMA']),
  ('1006', 'Mariana Lima',  '(11) 95555-4444', '2026-07-25', 'Mensal',     120.00, 25, '2026-07-25', 'Ativo',    ARRAY['Boxe']),
  ('1007', 'Roberto Dias',  '(11) 94444-3333', '2025-12-10', 'Mensal',     110.00, 10, '2026-02-10', 'Inativo',  ARRAY['Jiu-Jitsu'])
ON CONFLICT (id) DO NOTHING;

-- Presenças
INSERT INTO attendance (id, student_id, student_nome, data, hora)
VALUES
  ('att1', '1001', 'João Silva',    '2026-08-01', '07:15'),
  ('att2', '1003', 'Carlos Souza',  '2026-08-01', '08:30'),
  ('att3', '1005', 'Lucas Pereira', '2026-08-01', '18:45'),
  ('att4', '1006', 'Mariana Lima',  '2026-08-01', '19:20'),
  ('att5', '1001', 'João Silva',    '2026-08-02', '07:05'),
  ('att6', '1005', 'Lucas Pereira', '2026-08-02', '17:30')
ON CONFLICT (id) DO NOTHING;

-- Produtos
INSERT INTO products (id, nome, preco, custo, estoque, categoria)
VALUES
  ('P1', 'Whey Protein Concentrado 900g',   160.00, 95.00, 15, 'Suplementos'),
  ('P2', 'Creatina Monohidratada 250g',      90.00, 50.00, 22, 'Suplementos'),
  ('P3', 'Luvas de Musculação Profissional', 55.00, 25.00,  8, 'Equipamentos'),
  ('P4', 'Coqueteleira Inox 700ml',          40.00, 18.00, 12, 'Equipamentos'),
  ('P5', 'Camiseta Dry Fit Koringa',         70.00, 30.00,  2, 'Vestuário')
ON CONFLICT (id) DO NOTHING;

-- Transações Financeiras
INSERT INTO transactions (id, tipo, categoria, descricao, valor, data, detalhes)
VALUES
  ('t1',  'Despesa', 'Aluguel',         'Aluguel do Salão Junho',         2200.00, '2026-06-05', NULL),
  ('t2',  'Despesa', 'Salários',        'Salários da Equipe Junho',       3500.00, '2026-06-01', NULL),
  ('t3',  'Despesa', 'Manutenção',      'Reparo esteira 3',                250.00, '2026-06-12', NULL),
  ('t4',  'Receita', 'Mensalidade',     'Mensalidade João Silva',          120.00, '2026-06-05', 'Aluno: João Silva (1001)'),
  ('t5',  'Receita', 'Mensalidade',     'Mensalidade Carlos Souza',        300.00, '2026-06-15', 'Aluno: Carlos Souza (1003)'),
  ('t6',  'Receita', 'Venda de Produto','Venda: Whey Protein + Creatina',  250.00, '2026-06-20', 'Venda Balcão'),
  ('t7',  'Despesa', 'Aluguel',         'Aluguel do Salão Julho',         2200.00, '2026-07-05', NULL),
  ('t8',  'Despesa', 'Salários',        'Salários da Equipe Julho',       3500.00, '2026-07-01', NULL),
  ('t9',  'Despesa', 'Outros',          'Conta de Energia + Água',         480.00, '2026-07-10', NULL),
  ('t10', 'Receita', 'Mensalidade',     'Mensalidade João Silva',          120.00, '2026-07-05', 'Aluno: João Silva (1001)'),
  ('t11', 'Receita', 'Mensalidade',     'Mensalidade Mariana Lima',        120.00, '2026-07-25', 'Aluno: Mariana Lima (1006)'),
  ('t12', 'Receita', 'Venda de Produto','Venda: 1x Creatina',              90.00, '2026-07-12', 'Venda Balcão'),
  ('t13', 'Receita', 'Venda de Produto','Venda: 1x Luvas de Musculação',   55.00, '2026-07-18', 'Aluno: João Silva (1001)')
ON CONFLICT (id) DO NOTHING;

-- Fechamento de Junho
INSERT INTO monthly_closings (id, ano_mes, receita_mensalidades, receita_vendas, receitas_outras, despesas_totais, lucro_liquido, data_fechamento, total_presencas, total_vendas)
VALUES
  ('2026-06', '2026-06', 420.00, 250.00, 0.00, 5950.00, -5280.00, '2026-06-30', 84, 3)
ON CONFLICT (id) DO NOTHING;
