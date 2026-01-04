'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TrustBadge from '../../../components/TrustBadge';

export default function SuccessClient() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

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
                        Processado com <br /> Sucesso!
                    </h1>

                    <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium max-w-lg mx-auto italic">
                        Seu pedido <span className="text-slate-900 font-black">#{orderId || 'CONFIRMADO'}</span> foi recebido.
                        Nossa IA está preparando o encaminhamento ao fornecedor agora mesmo.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                        <Link
                            href="/"
                            className="flex items-center justify-center p-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:scale-[1.03] transition-all"
                        >
                            FECHAR E VOLTAR
                        </Link>
                        <Link
                            href={`/orders/${orderId}`}
                            className="flex items-center justify-center p-6 bg-slate-100 text-slate-700 rounded-[2rem] font-black text-lg hover:bg-slate-200 transition-all"
                        >
                            RASTREAR AGORA
                        </Link>
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
