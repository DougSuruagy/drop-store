'use client';

import { useState } from 'react';
import { fetchAPI } from '../lib/api';

export default function AddToCartButton({ productId }: { productId: number }) {
    const [loading, setLoading] = useState(false);

    const addToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redireciona para login mas salva onde o usuário estava
            window.location.href = `/login?redirect=${window.location.pathname}`;
            return;
        }

        setLoading(true);
        try {
            await fetchAPI('/cart', {
                method: 'POST',
                body: JSON.stringify({ product_id: productId, quantidade: 1 }),
            });
            alert('Produto adicionado ao carrinho com sucesso!');
        } catch (err: any) {
            alert('Erro ao adicionar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={addToCart}
            disabled={loading}
            className="flex-1 bg-black text-white py-4 px-8 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'Processando...' : 'Adicionar ao Carrinho'}
        </button>
    );
}
