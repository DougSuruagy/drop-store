'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { fetchAPI } from '../../lib/api';
import Image from 'next/image';

interface CartItem {
    id: number;
    product_id: number;
    titulo: string;
    preco: number;
    imagens: string[];
    quantidade: number;
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            if (!localStorage.getItem('token')) {
                window.location.href = '/login';
                return;
            }
            const data = await fetchAPI('/cart');
            setItems(data.items || []);

            const calcTotal = (data.items || []).reduce((acc: number, item: CartItem) => {
                return acc + (Number(item.preco) * item.quantidade);
            }, 0);
            setTotal(calcTotal);
        } catch (error) {
            console.error('Failed to load cart', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        try {
            await fetchAPI(`/cart/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify({ quantidade: newQty })
            });
            loadCart();
        } catch (error: any) {
            console.error('Failed to update quantity', error);
            alert(error.message || 'Erro ao atualizar quantidade');
        }
    };

    const removeItem = async (itemId: number) => {
        if (!confirm('Remover este item?')) return;
        try {
            await fetchAPI(`/cart/${itemId}`, { method: 'DELETE' });
            loadCart();
        } catch (error) {
            console.error('Failed to remove item', error);
            alert('Erro ao remover item');
        }
    };

    const handleCheckout = async () => {
        window.location.href = '/checkout';
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
            <div className="pt-40 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-5xl font-black mb-12 tracking-tighter italic">Sua Seleção</h1>

                {items.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100 px-6">
                        <div className="text-7xl mb-8">🛒</div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter italic">Vazio por enquanto.</h2>
                        <p className="text-slate-500 mb-10 font-medium">Sua curadoria pessoal está aguardando novas soluções.</p>
                        <Link href="/" className="inline-block bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all">
                            VOLTAR À LOJA
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-6 items-center group">
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-100">
                                        <Image
                                            src={item.imagens && item.imagens.length > 0 ? item.imagens[0] : 'https://via.placeholder.com/150'}
                                            alt={item.titulo}
                                            fill
                                            className="object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Link href={`/product/${item.product_id}`} className="text-xl font-black text-slate-900 hover:text-blue-600 transition italic line-clamp-1">
                                            {item.titulo}
                                        </Link>

                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                                                    className="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition"
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center text-xs font-black text-slate-900">{item.quantidade}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                                                    className="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-2xl italic text-slate-900">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</p>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 mt-2 transition"
                                        >
                                            REMOVER ITEM
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary / Totals */}
                        <div className="lg:w-[400px]">
                            <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100 sticky top-32 text-center">
                                <h3 className="text-xl font-black mb-8 tracking-tight italic">Resumo da Operação</h3>
                                <div className="space-y-4 border-b border-slate-50 pb-8 mb-8">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <span>Subtotal Estimado</span>
                                        <span className="text-slate-900 font-bold">R$ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-green-500">
                                        <span>Logística Global</span>
                                        <span className="font-bold">BONIFICADA</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-3xl font-black italic text-slate-900 mb-10">
                                    <span>Total</span>
                                    <span className="text-blue-600">R$ {total.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all"
                                >
                                    FINALIZAR AGORA
                                </button>

                                <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    Ambiente Criptografado
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
