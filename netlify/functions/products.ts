import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    // GET /api/products
    if (method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          nome,
          preco::float,
          custo::float,
          estoque,
          categoria
        FROM products
        ORDER BY categoria ASC, nome ASC
      `;
      return jsonResponse(rows);
    }

    // POST /api/products — cria ou atualiza produto
    if (method === 'POST') {
      const p = body as {
        id: string;
        nome: string;
        preco: number;
        custo: number;
        estoque: number;
        categoria: string;
      };

      await sql`
        INSERT INTO products (id, nome, preco, custo, estoque, categoria, updated_at)
        VALUES (${p.id}, ${p.nome}, ${p.preco}, ${p.custo}, ${p.estoque}, ${p.categoria}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          nome       = EXCLUDED.nome,
          preco      = EXCLUDED.preco,
          custo      = EXCLUDED.custo,
          estoque    = EXCLUDED.estoque,
          categoria  = EXCLUDED.categoria,
          updated_at = NOW()
      `;

      return jsonResponse({ success: true });
    }

    // DELETE /api/products?id=P1
    if (method === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return jsonResponse({ error: 'id é obrigatório' }, 400);

      await sql`DELETE FROM products WHERE id = ${id}`;
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Método não suportado' }, 405);
  } catch (err) {
    console.error('[products]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
