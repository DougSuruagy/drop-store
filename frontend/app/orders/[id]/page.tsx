'use client';

import { useEffect, useState, use } from 'react';
import Header from '../../../components/Header';
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
        pending: { label: 'Pendente', class: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
        paid: { label: 'Pago', class: 'bg-green-50 text-green-700 border-green-100' },
        shipped: { label: 'Enviado', class: 'bg-blue-50 text-blue-700 border-blue-100' },
        delivered: { label: 'Entregue', class: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
        canceled: { label: 'Cancelado', class: 'bg-red-50 text-red-700 border-red-100' },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="pt-48 text-center px-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Pedido não encontrado</h1>
                    <Link href="/orders" className="text-blue-600 font-bold mt-8 block hover:underline transition">Voltar para Pedidos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header />
            <main className="pt-40 pb-20 max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <Link href="/orders" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 transition">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                        </Link>
                        <h1 className="text-5xl font-black tracking-tighter italic text-slate-900">Pedido <span className="text-blue-600">#{details.order.id}</span></h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        <section className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100">
                            <h2 className="text-xl font-black mb-8 tracking-tight italic">Itens Processados</h2>
                            <div className="divide-y divide-slate-50">
                                {details.items.map((item, idx) => (
                                    <div key={idx} className="py-6 flex gap-6 items-center group">
                                        <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                                            <img
                                                src={item.imagens?.[0] || 'https://via.placeholder.com/100'}
                                                alt={item.titulo}
                                                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition duration-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-lg italic line-clamp-1">{item.titulo}</p>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                                Qtd: {item.quantidade} <span className="mx-2">×</span> R$ {Number(item.preco_unitario).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-black text-slate-900 text-lg italic">R$ {(item.quantidade * Number(item.preco_unitario)).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="lg:col-span-4 space-y-8">
                        <section className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 text-center">
                            <h2 className="text-xl font-black mb-10 tracking-tight italic">Status da Operação</h2>
                            <div className="space-y-6">
                                <div className="inline-block px-6 py-2 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className={`text-xs font-black uppercase tracking-widest ${statusMap[details.order.status]?.class || 'text-slate-500'}`}>
                                        {statusMap[details.order.status]?.label || details.order.status}
                                    </span>
                                </div>

                                <div className="pt-8 border-t border-slate-50 space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <span>Data do Registro</span>
                                        <span className="text-slate-900">{new Date(details.order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-2xl font-black italic pt-4">
                                        <span className="text-slate-900">Total</span>
                                        <span className="text-blue-600">R$ {Number(details.order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-110 transition duration-700"></div>
                            <h3 className="font-black text-xl mb-6 flex items-center gap-3 relative z-10 italic">
                                <span className="text-blue-400 text-2xl animate-pulse">⚡</span>
                                Suporte IA
                            </h3>
                            <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed relative z-10">
                                Problemas com a entrega? Nossa IA de intermediação está pronta para resolver.
                            </p>
                            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-blue-700 transition relative z-10 shadow-lg shadow-blue-900/40 translate-y-0 active:translate-y-1 transition-all">
                                ACIONAR GARANTIA
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
