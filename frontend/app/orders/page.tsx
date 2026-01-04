'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-extrabold mb-10 tracking-tight">Meus Pedidos</h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100">
                        <div className="text-5xl mb-4">📦</div>
                        <h2 className="text-xl font-bold mb-2">Você ainda não tem pedidos</h2>
                        <p className="text-gray-500 mb-8">Comece a comprar e seus pedidos aparecerão aqui.</p>
                        <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg">
                            Explorar Produtos
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
