'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({
    product
}: {
    product: { id: number; titulo: string; preco: number; imagens: string[]; estoque: number }
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isOutOfStock = product.estoque <= 0;

    const buyNow = () => {
        setLoading(true);

        // PERFORMANCE CRÍTICA: Salvamos os dados completos no localStorage 
        // para que o Checkout carregue INSTANTANEAMENTE sem esperar o backend.
        const cartItem = {
            product_id: product.id,
            quantidade: 1,
            titulo: product.titulo,
            preco: product.preco,
            imagens: product.imagens
        };

        try {
            localStorage.setItem('direct_buy', JSON.stringify(cartItem));
            router.push('/checkout');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={buyNow}
            disabled={loading || isOutOfStock}
            className={`w-full py-6 px-10 rounded-[2rem] font-black text-2xl transition-all duration-300 shadow-[0_20px_50px_rgba(37,99,235,0.4)] ${isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.03] active:scale-100'
                } disabled:opacity-50`}
        >
            {loading ? 'PREPARANDO...' : isOutOfStock ? 'ESGOTADO' : 'RESERVAR AGORA'}
        </button>
    );
}
