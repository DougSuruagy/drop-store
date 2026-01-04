'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({
    product
}: {
    product: { id: number; titulo: string; preco: number; imagens: string[] }
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            disabled={loading}
            className="w-full bg-blue-600 text-white py-6 px-10 rounded-[2rem] font-black text-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-[1.03] active:scale-100 transition-all duration-300 disabled:opacity-50"
        >
            {loading ? 'PREPARANDO...' : 'RESERVAR AGORA'}
        </button>
    );
}
