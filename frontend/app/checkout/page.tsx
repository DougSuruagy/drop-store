'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
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

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [address, setAddress] = useState('');
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login?redirect=/checkout');
                    return;
                }

                const data = await fetchAPI('/cart');
                if (!data.items || data.items.length === 0) {
                    router.push('/cart');
                    return;
                }

                setItems(data.items);
                const calcTotal = data.items.reduce((acc: number, item: CartItem) => {
                    return acc + (Number(item.preco) * item.quantidade);
                }, 0);
                setTotal(calcTotal);
            } catch (err) {
                console.error('Checkout load error:', err);
            } finally {
                setInitializing(false);
            }
        };

        loadCheckoutData();
    }, [router]);

    const handlePayment = async () => {
        if (!address) return alert('Por favor, preencha o endereço de entrega.');

        setLoading(true);
        try {
            const res = await fetchAPI('/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    address,
                    payment_method: 'pagseguro'
                }),
            });

            if (res.payment_url) {
                // Em um cenário real, redirecionaríamos. Aqui simulamos o sucesso.
                localStorage.removeItem('last_order_id');
                window.location.href = `/checkout/success?order_id=${res.order_id}`;
            }
        } catch (err: any) {
            alert('Erro ao processar pedido: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Form Section */}
                    <div className="flex-1 space-y-8">
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Endereço de Entrega
                            </h2>
                            <textarea
                                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                rows={4}
                                placeholder="Rua, Número, Complemento, Bairro, Cidade, Estado e CEP"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </section>

                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Pagamento
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border-2 border-blue-600 bg-blue-50 p-4 rounded-xl cursor-not-allowed opacity-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold">PagSeguro</span>
                                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">Cartão de Crédito, Pix ou Boleto</p>
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-gray-800 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
                        </button>
                    </div>

                    {/* Order Summary Section */}
                    <aside className="lg:w-96">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Resumo da Compra</h3>
                            <div className="max-h-80 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-100">
                                            <img
                                                src={item.imagens?.[0] || 'https://via.placeholder.com/100'}
                                                alt={item.titulo}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.titulo}</p>
                                            <p className="text-xs text-gray-500">Qtd: {item.quantidade}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Produtos</span>
                                    <span>R$ {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Frete</span>
                                    <span>Grátis</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-50">
                                    <span>Total</span>
                                    <span>R$ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
