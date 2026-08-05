import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    if (method !== 'POST') return jsonResponse({ error: 'Método não suportado' }, 405);

    const { studentId } = body as { studentId: string };
    if (!studentId) return jsonResponse({ error: 'studentId é obrigatório' }, 400);

    // Busca o aluno
    const [student] = await sql`
      SELECT id, nome, plano, valor_mensalidade AS "valorMensalidade", status
      FROM students
      WHERE id = ${studentId}
    `;

    if (!student) {
      return jsonResponse({ success: false, message: 'Aluno não encontrado!' }, 404);
    }

    const today = new Date().toISOString().split('T')[0];

    // Atualiza aluno: data do último pagamento e status → Ativo
    await sql`
      UPDATE students
      SET data_ultimo_pagamento = ${today},
          status = 'Ativo',
          updated_at = NOW()
      WHERE id = ${studentId}
    `;

    // Lança transação financeira
    const txId = `t_${Date.now()}`;
    await sql`
      INSERT INTO transactions (id, tipo, categoria, descricao, valor, data, detalhes)
      VALUES (
        ${txId},
        'Receita',
        'Mensalidade',
        ${'Mensalidade paga - ' + student.nome},
        ${student.valorMensalidade},
        ${today},
        ${'Aluno: ' + student.nome + ' (' + student.id + ') | Plano: ' + student.plano}
      )
    `;

    return jsonResponse({
      success: true,
      message: `Pagamento de R$ ${Number(student.valorMensalidade).toFixed(2)} registrado para ${student.nome}!`,
    });
  } catch (err) {
    console.error('[payment]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
