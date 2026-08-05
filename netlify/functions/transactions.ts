import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    // GET /api/transactions
    if (method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          tipo,
          categoria,
          descricao,
          valor::float,
          data::text,
          detalhes
        FROM transactions
        ORDER BY data DESC, created_at DESC
      `;
      return jsonResponse(rows);
    }

    // POST /api/transactions — cria nova transação
    if (method === 'POST') {
      const t = body as {
        id: string;
        tipo: string;
        categoria: string;
        descricao: string;
        valor: number;
        data: string;
        detalhes?: string;
      };

      await sql`
        INSERT INTO transactions (id, tipo, categoria, descricao, valor, data, detalhes)
        VALUES (
          ${t.id}, ${t.tipo}, ${t.categoria}, ${t.descricao},
          ${t.valor}, ${t.data}, ${t.detalhes ?? null}
        )
      `;

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Método não suportado' }, 405);
  } catch (err) {
    console.error('[transactions]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
