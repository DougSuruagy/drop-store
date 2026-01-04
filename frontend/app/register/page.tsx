'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '../../lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            // AUTO-LOGIN: Armazenar token e usuário vindos do registro
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirecionar para Dashboard ou Home como logado
            router.push('/');
            router.refresh();
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="text-center">
                    <Link href="/" className="group inline-flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition shadow-lg shadow-blue-200">
                            <span className="text-white font-black text-xl italic">A</span>
                        </div>
                        <span className="font-black text-2xl text-slate-900 tracking-tighter">
                            AURUM<span className="text-blue-600">TECH</span>
                        </span>
                    </Link>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Nova Conta</h2>
                    <p className="mt-4 text-sm text-slate-500 font-medium">
                        Já é cliente? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">Fazer login</Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="João Silva"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
                            <input
                                id="telefone"
                                name="telefone"
                                type="tel"
                                value={formData.telefone}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div>
                            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input
                                id="senha"
                                name="senha"
                                type="password"
                                required
                                value={formData.senha}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition disabled:opacity-70"
                        >
                            {loading ? 'Criando conta...' : 'Cadastrar'}
                        </button>
                        <p className="mt-4 text-xs text-center text-gray-500">
                            Ao clicar em Cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
