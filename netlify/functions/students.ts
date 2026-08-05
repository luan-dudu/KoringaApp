import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    // GET /api/students — lista todos os alunos
    if (method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          nome,
          telefone,
          data_cadastro::text         AS "dataCadastro",
          plano,
          valor_mensalidade::float    AS "valorMensalidade",
          dia_vencimento              AS "diaVencimento",
          data_ultimo_pagamento::text AS "dataUltimoPagamento",
          status,
          modalidades
        FROM students
        ORDER BY nome ASC
      `;
      return jsonResponse(rows);
    }

    // POST /api/students — cria ou atualiza (upsert) um aluno
    if (method === 'POST') {
      const s = body as {
        id: string;
        nome: string;
        telefone: string;
        dataCadastro: string;
        plano: string;
        valorMensalidade: number;
        diaVencimento: number;
        dataUltimoPagamento: string | null;
        status: string;
        modalidades: string[];
      };

      await sql`
        INSERT INTO students
          (id, nome, telefone, data_cadastro, plano, valor_mensalidade,
           dia_vencimento, data_ultimo_pagamento, status, modalidades, updated_at)
        VALUES (
          ${s.id}, ${s.nome}, ${s.telefone}, ${s.dataCadastro},
          ${s.plano}, ${s.valorMensalidade}, ${s.diaVencimento},
          ${s.dataUltimoPagamento ?? null}, ${s.status},
          ${s.modalidades}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          nome                  = EXCLUDED.nome,
          telefone              = EXCLUDED.telefone,
          data_cadastro         = EXCLUDED.data_cadastro,
          plano                 = EXCLUDED.plano,
          valor_mensalidade     = EXCLUDED.valor_mensalidade,
          dia_vencimento        = EXCLUDED.dia_vencimento,
          data_ultimo_pagamento = EXCLUDED.data_ultimo_pagamento,
          status                = EXCLUDED.status,
          modalidades           = EXCLUDED.modalidades,
          updated_at            = NOW()
      `;

      return jsonResponse({ success: true });
    }

    // DELETE /api/students?id=1001 — remove um aluno
    if (method === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return jsonResponse({ error: 'id é obrigatório' }, 400);

      await sql`DELETE FROM students WHERE id = ${id}`;
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Método não suportado' }, 405);
  } catch (err) {
    console.error('[students]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
