'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { fetchAPI } from '../../lib/api';

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');

    const handlePayment = async () => {
        if (!address) return alert('Preencha seu endereço');
        setLoading(true);
        try {
            const res = await fetchAPI('/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    address,
                    payment_method: 'pagseguro'
                }),
            });
            // Redirect to PagSeguro (in real app) or show success
            if (res.payment_url) {
                alert(`Pedido criado! ID: ${res.order_id}\nRedirecionando para PagSeguro... (Simulação)`);
                window.location.href = res.payment_url;
            }
        } catch (err: any) {
            alert('Erro no checkout: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 max-w-xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Endereço de Entrega</label>
                        <textarea
                            className="w-full border p-3 rounded-lg"
                            rows={3}
                            placeholder="Rua, Número, Bairro, Cidade - CEP"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : 'Pagar com PagSeguro'}
                    </button>
                </div>
            </div>
        </div>
    );
}
