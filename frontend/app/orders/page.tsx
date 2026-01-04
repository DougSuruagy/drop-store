'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { fetchAPI } from '../../lib/api';
import Link from 'next/link';

interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchAPI('/orders');
                setOrders(data);
            } catch (err) {
                console.error('Failed to load orders', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header />
            <main className="pt-40 pb-20 max-w-4xl mx-auto px-4">
                <h1 className="text-5xl font-black mb-12 tracking-tighter italic">Seu Histórico</h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-16 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] text-center border border-slate-100 px-6">
                        <div className="text-7xl mb-8 animate-pulse">🛰️</div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter italic text-slate-900">Nenhum Registro.</h2>
                        <p className="text-slate-500 mb-10 font-medium italic">Nossa IA ainda não detectou pedidos vinculados a este usuário.</p>
                        <Link href="/" className="inline-block bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all">
                            EXPLORAR SOLUÇÕES
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">#{order.id}</p>
                                    <p className="text-lg font-bold text-gray-900">Total: R$ {Number(order.total).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">
                                        Data: {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${statusMap[order.status]?.class || 'bg-gray-100'}`}>
                                        {statusMap[order.status]?.label || order.status}
                                    </span>
                                    <Link
                                        href={`/orders/${order.id}`}
                                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                                    >
                                        Detalhes
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
