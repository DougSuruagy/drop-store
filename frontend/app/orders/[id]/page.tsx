'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '../../../components/Navbar';
import { fetchAPI } from '../../../lib/api';
import Link from 'next/link';

interface OrderDetail {
    order: {
        id: number;
        total: number;
        status: string;
        created_at: string;
    };
    items: Array<{
        product_id: number;
        titulo: string;
        imagens: string[];
        quantidade: number;
        preco_unitario: number;
    }>;
}

export default function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [details, setDetails] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await fetchAPI(`/orders/${params.id}`);
                setDetails(data);
            } catch (err) {
                console.error('Failed to load order', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [params.id]);

    const statusMap: any = {
        pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
        paid: { label: 'Pago', class: 'bg-green-100 text-green-800' },
        shipped: { label: 'Enviado', class: 'bg-blue-100 text-blue-800' },
        delivered: { label: 'Entregue', class: 'bg-purple-100 text-purple-800' },
        canceled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-32 text-center">
                    <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
                    <Link href="/orders" className="text-blue-600 underline mt-4 block">Voltar para Pedidos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/orders" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Detalhes do Pedido #{details.order.id}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4">Itens Comprados</h2>
                            <div className="divide-y divide-gray-50">
                                {details.items.map((item, idx) => (
                                    <div key={idx} className="py-4 flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 relative">
                                            <img
                                                src={item.imagens?.[0] || 'https://via.placeholder.com/100'}
                                                alt={item.titulo}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 line-clamp-1">{item.titulo}</p>
                                            <p className="text-sm text-gray-500">Qtd: {item.quantidade} x R$ {Number(item.preco_unitario).toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">R$ {(item.quantidade * Number(item.preco_unitario)).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4">Status & Resumo</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusMap[details.order.status]?.class || 'bg-gray-100'}`}>
                                        {statusMap[details.order.status]?.label || details.order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Data:</span>
                                    <span className="text-sm font-medium">{new Date(details.order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-blue-600">R$ {Number(details.order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </section>

                        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Precisando de Ajuda?
                            </h3>
                            <p className="text-sm text-blue-100 mb-4 font-light">
                                Se tiver qualquer dúvida sobre sua entrega, entre em contato pelo nosso WhatsApp de suporte.
                            </p>
                            <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition">
                                Suporte WhatsApp
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
