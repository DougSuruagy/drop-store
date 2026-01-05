'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TrustBadge from '../../../components/TrustBadge';
import { API_URL } from '../../../lib/api';

export default function SuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('loading'); // loading, ready, failed_checkout
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const pollStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/checkout/status/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.payment_url) {
                        setPaymentUrl(data.payment_url);
                        setStatus('ready');
                        // Opcional: Redirecionamento automático
                        // window.location.href = data.payment_url;
                    } else if (data.status === 'failed_checkout') {
                        setStatus('failed');
                    }
                }
            } catch (error) {
                console.error('Polling error', error);
            }
        };

        // Poll a cada 2 segundos
        const interval = setInterval(pollStatus, 2000);
        pollStatus(); // Executa imediatamente

        return () => clearInterval(interval);
    }, [orderId]);

    if (status === 'loading') {
        return (
            <main className="pt-40 pb-20 max-w-4xl mx-auto px-4 text-center min-h-screen">
                <div className="bg-white p-16 rounded-[3rem] shadow-xl border border-slate-100">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-8"></div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">Gerando link de pagamento...</h1>
                    <p className="text-slate-500">Aguarde um momento enquanto conectamos com o Mercado Pago.</p>
                </div>
            </main>
        );
    }

    if (status === 'failed') {
        return (
            <main className="pt-40 pb-20 max-w-4xl mx-auto px-4 text-center">
                <div className="bg-red-50 p-16 rounded-[3rem] border border-red-100">
                    <h1 className="text-4xl font-black text-red-600 mb-4">Erro no Processamento</h1>
                    <p className="text-slate-600 mb-8">Houve um problema ao gerar seu pagamento. O estoque foi revertido.</p>
                    <Link href="/checkout" className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition">
                        Tentar Novamente
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="pt-40 pb-20 max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white p-16 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-green-400/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <div className="w-28 h-28 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-xl shadow-green-500/10 border border-green-100 animate-bounce">
                        ✓
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9] italic">
                        Pagamento <br /> Pronto!
                    </h1>

                    <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-lg mx-auto italic">
                        Seu pedido <span className="text-slate-900 font-black">#{orderId}</span> foi registrado.
                        Clique abaixo para finalizar o pagamento.
                    </p>

                    <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
                        {paymentUrl && (
                            <a
                                href={paymentUrl}
                                className="flex items-center justify-center p-6 bg-green-600 text-white rounded-[2rem] font-black text-2xl shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:bg-green-700 hover:scale-[1.03] transition-all animate-pulse"
                            >
                                ABRIR PAGAMENTO AGORA ➔
                            </a>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Link
                                href="/"
                                className="flex items-center justify-center p-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                Voltar à Loja
                            </Link>
                            <Link
                                href={`/orders/${orderId}`}
                                className="flex items-center justify-center p-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                Detalhes do Pedido
                            </Link>
                        </div>
                    </div>

                    <div className="mt-20 pt-12 border-t border-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Intermediação Protegida por Aurum Tech</p>
                        <TrustBadge />
                    </div>
                </div>
            </div>
        </main>
    );
}
