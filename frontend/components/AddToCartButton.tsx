'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ productId }: { productId: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const buyNow = () => {
        setLoading(true);

        // Em um modelo "Essential", quanto menos etapas melhor.
        // Adicionamos ao localStorage para que o checkout leia, independente de estar logado.
        const cartItem = { product_id: productId, quantidade: 1 };

        // Simulamos uma adição rápida
        try {
            // No futuro aqui podemos chamar o backend se estiver logado, 
            // mas para GUEST vamos direto para o checkout com a intenção de compra.
            localStorage.setItem('direct_buy', JSON.stringify(cartItem));

            // Redireciona imediatamente para o Checkout (Regra 4)
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
