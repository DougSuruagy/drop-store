'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <main className="pt-32 pb-20 max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
                    ✓
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Pedido Realizado!</h1>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                    Seu pedido <b>#{orderId}</b> foi recebido com sucesso. Você receberá um e-mail com os detalhes do rastreamento assim que ele for enviado.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/orders"
                        className="block w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg"
                    >
                        Acompanhar Pedido
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-white text-gray-700 border border-gray-200 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition"
                    >
                        Voltar para a Loja
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-50 flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition duration-500">
                    {/* Placeholder logos for trust badges */}
                    <div className="w-12 h-8 bg-gray-200 rounded"></div>
                    <div className="w-12 h-8 bg-gray-200 rounded"></div>
                    <div className="w-12 h-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        </main>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <Suspense fallback={<div className="pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
