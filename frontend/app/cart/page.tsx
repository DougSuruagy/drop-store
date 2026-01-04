'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { fetchAPI } from '../../lib/api';

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
        } catch (err) {
            console.error('Failed to load cart', err);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId: number) => {
        if (!confirm('Remover este item?')) return;
        try {
            await fetchAPI(`/cart/${itemId}`, { method: 'DELETE' });
            loadCart(); // Reload to update UI
        } catch (err) {
            alert('Erro ao remover item');
        }
    };

    const handleCheckout = async () => {
        window.location.href = '/checkout';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-medium text-gray-900 mb-2">Seu carrinho está vazio</h2>
                        <p className="text-gray-500 mb-6">Aproveite nossas ofertas e frete grátis.</p>
                        <Link href="/" className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition">
                            Ver Produtos
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        {/* Simple image fallback */}
                                        <img
                                            src={item.imagens && item.imagens.length > 0 ? item.imagens[0] : 'https://via.placeholder.com/150'}
                                            alt={item.titulo}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Link href={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
                                            {item.titulo}
                                        </Link>
                                        <p className="text-sm text-gray-500">Qtd: {item.quantidade}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</p>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium mt-1"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary / Totals */}
                        <div className="lg:w-96">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="text-lg font-bold mb-4">Resumo do Pedido</h3>
                                <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>R$ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Frete</span>
                                        <span>Grátis</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                                    <span>Total</span>
                                    <span>R$ {total.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Finalizar Compra
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    Compra 100% Segura
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
