import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    // GET /api/telegram-config — retorna a config salva
    if (method === 'GET') {
      const [row] = await sql`
        SELECT bot_token AS "botToken", chat_id AS "chatId", enabled
        FROM telegram_config
        WHERE id = 1
      `;
      return jsonResponse(row ?? null);
    }

    // POST /api/telegram-config — salva (upsert) a config
    if (method === 'POST') {
      const { botToken, chatId, enabled } = body as {
        botToken: string;
        chatId: string;
        enabled: boolean;
      };

      await sql`
        INSERT INTO telegram_config (id, bot_token, chat_id, enabled, updated_at)
        VALUES (1, ${botToken}, ${chatId}, ${enabled}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          bot_token  = EXCLUDED.bot_token,
          chat_id    = EXCLUDED.chat_id,
          enabled    = EXCLUDED.enabled,
          updated_at = NOW()
      `;

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Método não suportado' }, 405);
  } catch (err) {
    console.error('[telegram-config]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
