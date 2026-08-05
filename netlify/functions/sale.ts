import type { Handler } from '@netlify/functions';
import { sql, ensureTables, jsonResponse, parseRequest } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse({});

  try {
    await ensureTables();
    const { method, body } = parseRequest(event);

    if (method !== 'POST') return jsonResponse({ error: 'Método não suportado' }, 405);

    const {
      productId,
      quantity,
      studentId,
      buyerName,
    } = body as {
      productId: string;
      quantity: number;
      studentId?: string;
      buyerName?: string;
    };

    if (!productId || !quantity) {
      return jsonResponse({ error: 'productId e quantity são obrigatórios' }, 400);
    }

    // Busca produto
    const [product] = await sql`
      SELECT id, nome, preco::float AS preco, estoque
      FROM products
      WHERE id = ${productId}
    `;

    if (!product) {
      return jsonResponse({ success: false, message: 'Produto não encontrado!' }, 404);
    }

    if (product.estoque < quantity) {
      return jsonResponse({
        success: false,
        message: `Estoque insuficiente! Apenas ${product.estoque} unidades disponíveis.`,
      });
    }

    // Reduz estoque
    await sql`
      UPDATE products
      SET estoque = estoque - ${quantity}, updated_at = NOW()
      WHERE id = ${productId}
    `;

    // Determina comprador
    let finalBuyer = buyerName || 'Cliente Avulso';
    if (studentId) {
      const [student] = await sql`
        SELECT nome FROM students WHERE id = ${studentId}
      `;
      if (student) finalBuyer = `${student.nome} (${studentId})`;
    }

    const totalValue = product.preco * quantity;
    const today = new Date().toISOString().split('T')[0];
    const txId = `t_${Date.now()}`;

    await sql`
      INSERT INTO transactions (id, tipo, categoria, descricao, valor, data, detalhes)
      VALUES (
        ${txId},
        'Receita',
        'Venda de Produto',
        ${'Venda de ' + quantity + 'x ' + product.nome},
        ${totalValue},
        ${today},
        ${'Comprador: ' + finalBuyer + ' | Preço Unitário: R$ ' + product.preco.toFixed(2)}
      )
    `;

    return jsonResponse({
      success: true,
      message: `Venda de R$ ${totalValue.toFixed(2)} (${quantity}x ${product.nome}) realizada com sucesso!`,
    });
  } catch (err) {
    console.error('[sale]', err);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
};
