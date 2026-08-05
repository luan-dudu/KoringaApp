import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    // GET /api/attendance — lista todas as presenças
    if (method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          student_id   AS "studentId",
          student_nome AS "studentNome",
          data::text,
          hora
        FROM attendance
        ORDER BY data DESC, hora DESC
      `;
      return jsonResponse(rows);
    }

    // POST /api/attendance — registra check-in
    if (method === 'POST') {
      const { studentId } = body as { studentId: string };
      if (!studentId) return jsonResponse({ error: 'studentId é obrigatório' }, 400);

      // Busca aluno
      const [student] = await sql`
        SELECT id, nome, status FROM students WHERE id = ${studentId}
      `;

      if (!student) {
        return jsonResponse({ success: false, message: 'Aluno não encontrado!' }, 404);
      }
      if (student.status === 'Inativo') {
        return jsonResponse({ success: false, message: 'Aluno inativo. Não é permitido check-in!' });
      }

      // Verifica se já fez check-in hoje
      const today = new Date().toISOString().split('T')[0];
      const [existing] = await sql`
        SELECT id FROM attendance
        WHERE student_id = ${studentId} AND data = ${today}
      `;

      if (existing) {
        return jsonResponse({ success: false, message: 'Aluno já registrou presença hoje!' });
      }

      const now = new Date();
      const hora =
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0');
      const id = `att_${Date.now()}`;

      await sql`
        INSERT INTO attendance (id, student_id, student_nome, data, hora)
        VALUES (${id}, ${studentId}, ${student.nome}, ${today}, ${hora})
      `;

      return jsonResponse({
        success: true,
        message: `Check-in realizado com sucesso para ${student.nome} às ${hora}!`,
      });
    }

    return jsonResponse({ error: 'Método não suportado' }, 405);
  } catch (err) {
    console.error('[attendance]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
