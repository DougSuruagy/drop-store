'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '../../lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        senha: '',
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
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            // Armazenar token (simples)
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirecionar para Dashboard ou Home
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
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Acesso Restrito</h2>
                    <p className="mt-4 text-sm text-slate-500 font-medium">
                        Novo por aqui? <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500">Criar conta rápida</Link>
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
                            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input
                                id="senha"
                                name="senha"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.senha}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Sua senha"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Esqueceu a senha?</a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition disabled:opacity-70"
                        >
                            {loading ? 'Acessando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
