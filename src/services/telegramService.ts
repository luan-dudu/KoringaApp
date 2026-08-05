/**
 * src/services/telegramService.ts
 *
 * Integração com Telegram Bot API.
 * - Config do bot é persistida no Neon via /api/telegram-config
 * - Controle de "já notificou hoje" permanece em localStorage (dado volátil de sessão)
 * - Envio de mensagens é sempre direto para api.telegram.org (externo)
 */

import { getTelegramConfig, saveTelegramConfig } from '../db/api';

const TELEGRAM_LAST_NOTIFY_KEY = 'koringa_telegram_last_notify';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

// Re-exporta as funções de config para manter compatibilidade com os componentes
export { getTelegramConfig, saveTelegramConfig };

/** Remove a configuração do Telegram do banco */
export const clearTelegramConfig = async (): Promise<void> => {
  await saveTelegramConfig({ botToken: '', chatId: '', enabled: false });
  localStorage.removeItem(TELEGRAM_LAST_NOTIFY_KEY);
};

/** Envia uma mensagem genérica via Telegram Bot API */
export const sendTelegramMessage = async (
  text: string,
  configOverride?: TelegramConfig
): Promise<{ success: boolean; message: string }> => {
  const config = configOverride ?? (await getTelegramConfig());

  if (!config || !config.botToken || !config.chatId) {
    return {
      success: false,
      message: 'Configuração do Telegram não encontrada! Preencha o Bot Token e Chat ID.',
    };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'Mensagem enviada com sucesso!' };
    }
    return { success: false, message: `Erro da API Telegram: ${data.description}` };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Erro de conexão: ${errorMsg}` };
  }
};

/** Verifica e envia notificações de vencimento do dia */
export const checkAndNotifyDuePayments = async (): Promise<{
  success: boolean;
  message: string;
  count: number;
}> => {
  const config = await getTelegramConfig();

  if (!config || !config.enabled) {
    return { success: false, message: 'Notificações do Telegram desativadas.', count: 0 };
  }

  // Evita reenvio no mesmo dia (localStorage — dado de sessão local)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const lastNotify = localStorage.getItem(TELEGRAM_LAST_NOTIFY_KEY);

  if (lastNotify === todayStr) {
    return { success: true, message: 'Notificações já foram enviadas hoje.', count: 0 };
  }

  // Busca alunos da API
  let students: Array<{
    id: string;
    nome: string;
    telefone: string;
    plano: string;
    valorMensalidade: number;
    diaVencimento: number;
    status: string;
  }>;

  try {
    const res = await fetch('/api/students');
    students = await res.json();
  } catch {
    return { success: false, message: 'Erro ao buscar alunos.', count: 0 };
  }

  const diaHoje = today.getDate();
  const dueStudents = students.filter(
    (s) => s.diaVencimento === diaHoje && s.status !== 'Inativo'
  );

  if (dueStudents.length === 0) {
    localStorage.setItem(TELEGRAM_LAST_NOTIFY_KEY, todayStr);
    return { success: true, message: 'Nenhum vencimento para hoje.', count: 0 };
  }

  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  let totalValue = 0;
  let message = `🔔 <b>KORINGA FIGHT TEAM - Cobranças do Dia</b>\n\n`;
  message += `📅 Data: ${formattedDate}\n`;
  message += `${'─'.repeat(30)}\n\n`;

  dueStudents.forEach((s) => {
    totalValue += s.valorMensalidade;
    message += `👤 <b>${s.nome}</b>\n`;
    message += `📋 Plano: ${s.plano} | Valor: R$ ${s.valorMensalidade.toFixed(2)}\n`;
    message += `📱 Tel: ${s.telefone}\n\n`;
  });

  message += `${'─'.repeat(30)}\n`;
  message += `💰 <b>Total a receber: R$ ${totalValue.toFixed(2)}</b>\n`;
  message += `📊 Total de cobranças: ${dueStudents.length}`;

  const result = await sendTelegramMessage(message);

  if (result.success) {
    localStorage.setItem(TELEGRAM_LAST_NOTIFY_KEY, todayStr);
  }

  return { ...result, count: dueStudents.length };
};

/** Envia cobranças manualmente (ignora verificação diária) */
export const forceSendDuePayments = async (): Promise<{
  success: boolean;
  message: string;
  count: number;
}> => {
  localStorage.removeItem(TELEGRAM_LAST_NOTIFY_KEY);
  return checkAndNotifyDuePayments();
};

/** Envia mensagem de teste para validar a configuração */
export const sendTestMessage = async (
  config: TelegramConfig
): Promise<{ success: boolean; message: string }> => {
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const testMsg =
    `✅ <b>KoringaApp - Teste de Conexão</b>\n\n` +
    `A integração com o Telegram está funcionando corretamente!\n\n` +
    `⏰ Data/Hora: ${formattedDate}\n` +
    `🤖 Bot conectado com sucesso.`;

  return sendTelegramMessage(testMsg, config);
};
