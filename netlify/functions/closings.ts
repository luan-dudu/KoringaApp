import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    // GET /api/closings
    if (method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          ano_mes                    AS "anoMes",
          receita_mensalidades::float AS "receitaMensalidades",
          receita_vendas::float       AS "receitaVendas",
          receitas_outras::float      AS "receitasOutras",
          despesas_totais::float      AS "despesasTotais",
          lucro_liquido::float        AS "lucroLiquido",
          data_fechamento::text       AS "dataFechamento",
          total_presencas             AS "totalPresencas",
          total_vendas                AS "totalVendas"
        FROM monthly_closings
        ORDER BY ano_mes DESC
      `;
      return jsonResponse(rows);
    }

    // POST /api/closings — fecha um mês calculando a partir das transações
    if (method === 'POST') {
      const { anoMes } = body as { anoMes: string };
      if (!anoMes) return jsonResponse({ error: 'anoMes é obrigatório' }, 400);

      // Verifica se já existe
      const [existing] = await sql`
        SELECT id FROM monthly_closings WHERE ano_mes = ${anoMes}
      `;
      if (existing) {
        return jsonResponse({ success: false, message: `O mês ${anoMes} já está fechado!` });
      }

      // Agrega transações do mês
      const [agg] = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN tipo = 'Receita' AND categoria = 'Mensalidade'     THEN valor ELSE 0 END), 0)::float AS receita_mensalidades,
          COALESCE(SUM(CASE WHEN tipo = 'Receita' AND categoria = 'Venda de Produto' THEN valor ELSE 0 END), 0)::float AS receita_vendas,
          COALESCE(SUM(CASE WHEN tipo = 'Receita' AND categoria NOT IN ('Mensalidade','Venda de Produto') THEN valor ELSE 0 END), 0)::float AS receitas_outras,
          COALESCE(SUM(CASE WHEN tipo = 'Despesa' THEN valor ELSE 0 END), 0)::float AS despesas_totais,
          COUNT(CASE WHEN tipo = 'Receita' AND categoria = 'Venda de Produto' THEN 1 END)::int AS total_vendas
        FROM transactions
        WHERE data >= (${anoMes} || '-01')::date
          AND data <  ((${anoMes} || '-01')::date + INTERVAL '1 month')
      `;

      // Conta presenças do mês
      const [presAgg] = await sql`
        SELECT COUNT(*)::int AS total_presencas
        FROM attendance
        WHERE data >= (${anoMes} || '-01')::date
          AND data <  ((${anoMes} || '-01')::date + INTERVAL '1 month')
      `;

      const lucroLiquido =
        agg.receita_mensalidades + agg.receita_vendas + agg.receitas_outras - agg.despesas_totais;

      const today = new Date().toISOString().split('T')[0];

      await sql`
        INSERT INTO monthly_closings
          (id, ano_mes, receita_mensalidades, receita_vendas, receitas_outras,
           despesas_totais, lucro_liquido, data_fechamento, total_presencas, total_vendas)
        VALUES (
          ${anoMes}, ${anoMes},
          ${agg.receita_mensalidades}, ${agg.receita_vendas}, ${agg.receitas_outras},
          ${agg.despesas_totais}, ${lucroLiquido}, ${today},
          ${presAgg.total_presencas}, ${agg.total_vendas}
        )
      `;

      return jsonResponse({
        success: true,
        message: `Fechamento do mês ${anoMes} realizado! Lucro Líquido: R$ ${lucroLiquido.toFixed(2)}`,
        lucroLiquido,
      });
    }

    return jsonResponse({ error: 'Método não suportado' }, 405);
  } catch (err) {
    console.error('[closings]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
