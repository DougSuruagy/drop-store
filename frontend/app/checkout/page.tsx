'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import TrustBadge from '../../components/TrustBadge';
import { fetchAPI } from '../../lib/api';

interface CartItem {
    id: number;
    product_id: number;
    titulo: string;
    preco: number;
    imagens: string[];
    quantidade: number;
}

interface CheckoutBody {
    address: string;
    guest_info: { nome: string; email: string };
    cart_items?: { product_id: number; quantidade: number }[];
}

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [address, setAddress] = useState('');

    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const directBuyData = localStorage.getItem('direct_buy');
                if (directBuyData) {
                    const item = JSON.parse(directBuyData);
                    // PERFORMANCE CRÍTICA: Carregamos os dados salvos localmente
                    // Evita o fetchAPI(/products/id), carregando a página NA HORA.
                    const cartItem: CartItem = {
                        id: Date.now(),
                        product_id: item.product_id,
                        titulo: item.titulo,
                        preco: item.preco,
                        imagens: item.imagens,
                        quantidade: item.quantidade
                    };
                    setItems([cartItem]);
                    setTotal(Number(item.preco) * item.quantidade);
                    setInitializing(false);
                    return;
                }

                const data = await fetchAPI('/cart');
                if (data.items && data.items.length > 0) {
                    setItems(data.items);
                    const calcTotal = data.items.reduce((acc: number, item: CartItem) => {
                        return acc + (Number(item.preco) * item.quantidade);
                    }, 0);
                    setTotal(calcTotal);
                } else {
                    router.push('/');
                }
            } catch (err) {
                console.log('Checkout load error:', err);
                router.push('/');
            } finally {
                setInitializing(false);
            }
        };

        loadCheckoutData();
    }, [router]);

    const handlePayment = async () => {
        if (!nome || !email || !address) {
            return alert('Por favor, preencha todos os campos obrigatórios.');
        }

        setLoading(true);
        try {
            const body: CheckoutBody & { total_visualizado: number } = {
                address,
                guest_info: { nome, email },
                total_visualizado: total
            };

            const directBuyData = localStorage.getItem('direct_buy');
            if (directBuyData) {
                body.cart_items = items.map(i => ({
                    product_id: i.product_id,
                    quantidade: i.quantidade
                }));
            }

            const res = await fetchAPI('/checkout', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            if (res.payment_url) {
                if (directBuyData) localStorage.removeItem('direct_buy');
                window.location.href = res.payment_url;
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert('Erro ao processar pedido: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Form Section */}
                    <div className="flex-1 space-y-8">

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                            <h2 className="text-3xl font-black mb-8 tracking-tighter flex items-center gap-4 text-slate-900">
                                <span className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg shadow-lg">1</span>
                                Dados de Entrega
                            </h2>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900"
                                        placeholder="Como devemos te chamar?"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">E-mail para confirmação</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Endereço Completo</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900"
                                        rows={3}
                                        placeholder="Rua, Número, Bairro, Cidade e CEP"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                            <h2 className="text-3xl font-black mb-8 tracking-tighter flex items-center gap-4 text-slate-900">
                                <span className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg shadow-lg">2</span>
                                Pagamento Seguro
                            </h2>
                            <div className="p-8 rounded-[2rem] bg-indigo-50 border-2 border-blue-600 flex items-center justify-between group overflow-hidden relative">
                                <div className="relative z-10">
                                    <p className="font-black text-2xl text-blue-900 italic">PIX ou Cartão</p>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1 opacity-80">Aprovação em Segundos</p>
                                </div>
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-blue-100 relative z-10 transition group-hover:scale-110">
                                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                </div>
                                <div className="absolute right-[-20%] top-[-10%] w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black text-3xl shadow-[0_30px_60px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Sincronizando...' : `FINALIZAR — R$ ${total.toFixed(2)}`}
                            </button>
                            <div className="mt-16 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 opacity-50">Auditoria de Segurança</p>
                                <TrustBadge />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <aside className="lg:w-[400px]">
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-3xl sticky top-32 border border-white/5">
                            <h3 className="text-xl font-black mb-10 tracking-tight italic">Resumo</h3>
                            <div className="space-y-8 mb-12 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center group">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden flex-shrink-0 relative border border-white/5">
                                            <Image
                                                src={item.imagens?.[0] || 'https://via.placeholder.com/100'}
                                                alt={item.titulo}
                                                fill
                                                className="object-cover opacity-60 group-hover:opacity-100 transition duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate italic">{item.titulo}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Qtd: {item.quantidade}</p>
                                        </div>
                                        <p className="text-sm font-black text-blue-400 italic">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5 pt-10 border-t border-white/10">
                                <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-white">R$ {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-400 text-xs font-bold uppercase tracking-widest">
                                    <span>Entrega</span>
                                    <span className="px-3 py-1 bg-green-400/10 rounded-full text-[10px]">Grátis</span>
                                </div>
                                <div className="flex justify-between items-center pt-8">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Total Final</span>
                                    <span className="text-5xl font-black text-white tracking-tighter">R$ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
