/**
 * AURUM TECH - SupplierBridge
 * Sistema de integração com fornecedores para dropshipping.
 * 
 * FLUXO:
 * 1. Pagamento aprovado (Webhook Mercado Pago)
 * 2. Sistema busca dados do pedido
 * 3. Envia pedido ao fornecedor (email/API/WhatsApp)
 * 4. Registra tracking no banco
 * 5. Notifica cliente
 */

const knex = require('../db');

// Configuração dos fornecedores
const FORNECEDORES = {
    1: {
        nome: 'Fornecedor Principal',
        tipo: 'email', // 'email', 'api', 'whatsapp'
        contato: process.env.FORNECEDOR_EMAIL || 'fornecedor@exemplo.com',
        template: 'padrao'
    },
    2: {
        nome: 'Fornecedor Backup',
        tipo: 'whatsapp',
        contato: process.env.FORNECEDOR_WHATSAPP || '5511999999999',
        template: 'whatsapp'
    }
};

/**
 * Processa um pedido aprovado e encaminha ao fornecedor
 * @param {number} orderId - ID do pedido no banco
 * @returns {Object} Resultado do encaminhamento
 */
async function processarPedidoAprovado(orderId) {
    try {
        // 1. Busca dados completos do pedido (Snapshots garantem integridade)
        const order = await knex('orders').where({ id: orderId }).first();
        if (!order) throw new Error('Pedido não encontrado');

        const items = await knex('order_items').where({ order_id: orderId });

        // 2. Agrupa itens por fornecedor (Usa o Snapshot para evitar erros logísticos)
        const itensPorFornecedor = {};
        for (const item of items) {
            const fornecedorId = item.fornecedor_id_snapshot || 1;
            if (!itensPorFornecedor[fornecedorId]) {
                itensPorFornecedor[fornecedorId] = [];
            }
            itensPorFornecedor[fornecedorId].push(item);
        }

        // 3. Envia para cada fornecedor (EM PARALELO - Perfomance Critical)
        const entries = Object.entries(itensPorFornecedor);
        const dispatchPromises = entries.map(async ([fornecedorId, itensDoFornecedor]) => {
            const fornecedor = FORNECEDORES[fornecedorId] || FORNECEDORES[1];

            const dadosPedido = {
                pedido_id: orderId,
                cliente: {
                    nome: order.nome_cliente || 'Cliente',
                    email: order.email_cliente,
                    endereco: order.endereco_entrega
                },
                itens: itensDoFornecedor.map(i => ({
                    produto: i.titulo_snapshot || 'Produto',
                    quantidade: i.quantidade,
                    observacao: ''
                })),
                data: new Date().toISOString()
            };

            const resultado = await enviarParaFornecedor(fornecedor, dadosPedido);

            // Registra log detalhado no banco (Audit Trail)
            await knex('order_logs').insert({
                order_id: orderId,
                tipo: resultado.success ? 'ENVIADO_FORNECEDOR' : 'ERRO_FORNECEDOR',
                detalhes: JSON.stringify({
                    fornecedor: fornecedor.nome,
                    metodo: fornecedor.tipo,
                    status: resultado.success ? 'SUCESSO' : 'FALHA',
                    payload: dadosPedido
                })
            }).catch(e => console.error('Log error:', e));

            return resultado;
        });

        const resultados = await Promise.all(dispatchPromises);

        // 4. Lógica de Atualização de Status Robusta
        // Só avança para 'processing' se pelo menos um envio teve sucesso.
        // Se todos falharam, mantém 'paid' para revisão manual.
        const algumSucesso = resultados.some(r => r.success);

        if (algumSucesso) {
            await knex('orders').where({ id: orderId }).update({
                status: 'processing',
                updated_at: new Date()
            });
        } else {
            console.error(`❌ [SupplierBridge] Falha crítica: Pedido #${orderId} não pôde ser enviado a nenhum fornecedor.`);
            // Opcional: Notificar Admin via Telegram/Email aqui
        }

        return { success: algumSucesso, resultados };

    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Envia pedido para o fornecedor pelo método configurado
 */
async function enviarParaFornecedor(fornecedor, dadosPedido) {
    console.log(`📦 [SupplierBridge] Enviando pedido #${dadosPedido.pedido_id} para ${fornecedor.nome}`);

    switch (fornecedor.tipo) {
        case 'email':
            return await enviarEmail(fornecedor.contato, dadosPedido);
        case 'whatsapp':
            return await enviarWhatsApp(fornecedor.contato, dadosPedido);
        case 'api':
            return await enviarAPI(fornecedor.contato, dadosPedido);
        default:
            // Fallback: apenas loga (para desenvolvimento)
            console.log('📋 Pedido para encaminhamento manual:', JSON.stringify(dadosPedido, null, 2));
            return { success: true, metodo: 'manual' };
    }
}

/**
 * Envia pedido por email (simulado - implementar com SendGrid/Nodemailer)
 */
async function enviarEmail(email, dados) {
    // TODO: Implementar com SendGrid (grátis até 100 emails/dia)
    console.log(`📧 [EMAIL] Enviando para ${email}:`, dados);

    // Simulação de envio bem-sucedido
    return {
        success: true,
        metodo: 'email',
        destino: email,
        timestamp: new Date().toISOString()
    };
}

/**
 * Envia pedido por WhatsApp (via API gratuita ou Evolution API)
 */
async function enviarWhatsApp(numero, dados) {
    // TODO: Implementar com Evolution API (self-hosted, grátis)
    const mensagem = `
🛒 *NOVO PEDIDO #${dados.pedido_id}*

👤 Cliente: ${dados.cliente.nome}
📍 Endereço: ${dados.cliente.endereco}

📦 Produtos:
${dados.itens.map(i => `• ${i.quantidade}x ${i.produto}`).join('\n')}

_Pedido recebido em ${new Date().toLocaleString('pt-BR')}_
    `.trim();

    console.log(`📱 [WHATSAPP] Enviando para ${numero}:`, mensagem);

    return {
        success: true,
        metodo: 'whatsapp',
        destino: numero,
        timestamp: new Date().toISOString()
    };
}

/**
 * Envia pedido via API do fornecedor
 */
async function enviarAPI(endpoint, dados) {
    // TODO: Implementar chamada HTTP para API do fornecedor
    console.log(`🔌 [API] Enviando para ${endpoint}:`, dados);

    return {
        success: true,
        metodo: 'api',
        destino: endpoint,
        timestamp: new Date().toISOString()
    };
}

/**
 * Atualiza código de rastreio do pedido
 */
async function atualizarRastreio(orderId, codigoRastreio, transportadora = 'Correios') {
    await knex('orders').where({ id: orderId }).update({
        tracking_code: codigoRastreio,
        tracking_carrier: transportadora,
        status: 'shipped',
        updated_at: new Date()
    });

    // TODO: Notificar cliente por email/WhatsApp
    console.log(`📬 Rastreio atualizado: Pedido #${orderId} - ${codigoRastreio}`);

    return { success: true };
}

module.exports = {
    processarPedidoAprovado,
    atualizarRastreio,
    FORNECEDORES
};
