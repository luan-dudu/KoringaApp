import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

/**
 * Cria todas as tabelas se ainda não existirem.
 * Chamado no início de cada function para garantir
 * que o schema está atualizado (migration automática).
 */
export async function ensureTables(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id                    TEXT PRIMARY KEY,
      nome                  TEXT          NOT NULL,
      telefone              TEXT          NOT NULL,
      data_cadastro         DATE          NOT NULL,
      plano                 TEXT          NOT NULL,
      valor_mensalidade     NUMERIC(10,2) NOT NULL,
      dia_vencimento        SMALLINT      NOT NULL,
      data_ultimo_pagamento DATE,
      status                TEXT          NOT NULL DEFAULT 'Ativo',
      modalidades           TEXT[]        NOT NULL DEFAULT '{}',
      created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id           TEXT PRIMARY KEY,
      student_id   TEXT        NOT NULL,
      student_nome TEXT        NOT NULL,
      data         DATE        NOT NULL,
      hora         TEXT        NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id         TEXT          PRIMARY KEY,
      nome       TEXT          NOT NULL,
      preco      NUMERIC(10,2) NOT NULL,
      custo      NUMERIC(10,2) NOT NULL,
      estoque    INTEGER       NOT NULL DEFAULT 0,
      categoria  TEXT          NOT NULL,
      created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id         TEXT          PRIMARY KEY,
      tipo       TEXT          NOT NULL,
      categoria  TEXT          NOT NULL,
      descricao  TEXT          NOT NULL,
      valor      NUMERIC(10,2) NOT NULL,
      data       DATE          NOT NULL,
      detalhes   TEXT,
      created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS monthly_closings (
      id                   TEXT          PRIMARY KEY,
      ano_mes              TEXT          NOT NULL UNIQUE,
      receita_mensalidades NUMERIC(10,2) NOT NULL DEFAULT 0,
      receita_vendas       NUMERIC(10,2) NOT NULL DEFAULT 0,
      receitas_outras      NUMERIC(10,2) NOT NULL DEFAULT 0,
      despesas_totais      NUMERIC(10,2) NOT NULL DEFAULT 0,
      lucro_liquido        NUMERIC(10,2) NOT NULL DEFAULT 0,
      data_fechamento      DATE          NOT NULL,
      total_presencas      INTEGER       NOT NULL DEFAULT 0,
      total_vendas         INTEGER       NOT NULL DEFAULT 0,
      created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS telegram_config (
      id          INTEGER PRIMARY KEY DEFAULT 1,
      bot_token   TEXT,
      chat_id     TEXT,
      enabled     BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

/** Helper para construir respostas HTTP padronizadas */
export function jsonResponse(body: unknown, status = 200) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

/** Extrai o método HTTP e o body da request */
export function parseRequest(event: { httpMethod: string; body?: string | null }) {
  const method = event.httpMethod.toUpperCase();
  let body: Record<string, unknown> = {};
  try {
    if (event.body) body = JSON.parse(event.body);
  } catch {
    // body não é JSON válido
  }
  return { method, body };
}
