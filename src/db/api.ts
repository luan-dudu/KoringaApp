/**
 * src/db/api.ts
 *
 * Camada de abstração que substitui as chamadas ao localStorage.
 * Todas as funções são assíncronas e fazem fetch para as Netlify Functions.
 *
 * As interfaces TypeScript continuam em localDb.ts (source of truth).
 */

import type {
  Student,
  Attendance,
  Product,
  Transaction,
  MonthlyClosing,
} from './localDb';
import type { TelegramConfig } from '../services/telegramService';

const BASE = '/api';

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Erro desconhecido na API');
  }

  return res.json() as Promise<T>;
}

// ─── Alunos ────────────────────────────────────────────────────────────────

export const getStudents = (): Promise<Student[]> =>
  apiFetch<Student[]>('students');

export const saveStudent = async (student: Student): Promise<void> => {
  await apiFetch<{ success: boolean }>('students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
};

export const deleteStudent = async (id: string): Promise<void> => {
  await apiFetch<{ success: boolean }>(`students?id=${id}`, {
    method: 'DELETE',
  });
};

// ─── Presença ──────────────────────────────────────────────────────────────

export const getAttendance = (): Promise<Attendance[]> =>
  apiFetch<Attendance[]>('attendance');

export const addAttendance = (
  studentId: string
): Promise<{ success: boolean; message: string }> =>
  apiFetch<{ success: boolean; message: string }>('attendance', {
    method: 'POST',
    body: JSON.stringify({ studentId }),
  });

// ─── Produtos ──────────────────────────────────────────────────────────────

export const getProducts = (): Promise<Product[]> =>
  apiFetch<Product[]>('products');

export const saveProduct = async (product: Product): Promise<void> => {
  await apiFetch<{ success: boolean }>('products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiFetch<{ success: boolean }>(`products?id=${id}`, {
    method: 'DELETE',
  });
};

// ─── Transações ────────────────────────────────────────────────────────────

export const getTransactions = (): Promise<Transaction[]> =>
  apiFetch<Transaction[]>('transactions');

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  await apiFetch<{ success: boolean }>('transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
};

// ─── Pagamento de Mensalidade ──────────────────────────────────────────────

export const recordPayment = (
  studentId: string
): Promise<{ success: boolean; message: string }> =>
  apiFetch<{ success: boolean; message: string }>('payment', {
    method: 'POST',
    body: JSON.stringify({ studentId }),
  });

// ─── Venda de Produto ──────────────────────────────────────────────────────

export const recordSale = (
  productId: string,
  quantity: number,
  studentId?: string,
  buyerName?: string
): Promise<{ success: boolean; message: string }> =>
  apiFetch<{ success: boolean; message: string }>('sale', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, studentId, buyerName }),
  });

// ─── Fechamentos Mensais ───────────────────────────────────────────────────

export const getClosings = (): Promise<MonthlyClosing[]> =>
  apiFetch<MonthlyClosing[]>('closings');

export const closeMonth = (
  anoMes: string
): Promise<{ success: boolean; message: string }> =>
  apiFetch<{ success: boolean; message: string }>('closings', {
    method: 'POST',
    body: JSON.stringify({ anoMes }),
  });

// ─── Configuração do Telegram ──────────────────────────────────────────────

export const getTelegramConfig = (): Promise<TelegramConfig | null> =>
  apiFetch<TelegramConfig | null>('telegram-config');

export const saveTelegramConfig = async (config: TelegramConfig): Promise<void> => {
  await apiFetch<{ success: boolean }>('telegram-config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
};
