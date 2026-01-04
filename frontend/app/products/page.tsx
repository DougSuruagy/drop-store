'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import { API_URL } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface Product {
    id: number;
    titulo: string;
    preco: number;
    imagens: string[];
    categoria: string;
}

interface FetchParams {
    categoria?: string | null;
    q?: string | null;
}

async function fetchProducts(searchParams: FetchParams) {
    const { categoria, q } = searchParams;
    let url = `${API_URL}/products`;

    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (q) params.append('q', q);

    if (params.toString()) url += `?${params.toString()}`;

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

import { Suspense } from 'react';

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchProducts({
                categoria: searchParams.get('categoria'),
                q: searchParams.get('q')
            });
            setProducts(data);
            setLoading(false);
        };
        load();
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) params.set('q', searchQuery);
        else params.delete('q');
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header />

            <main className="pt-40 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Catálogo Completo</h1>
                        <p className="text-slate-500 mt-2 font-medium">Soluções curadas por IA para o seu cotidiano.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 sm:w-80">
                            <input
                                type="text"
                                placeholder="O que você precisa hoje?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition shadow-sm font-bold"
                            />
                            <button type="submit" className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </form>

                        <select
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams.toString());
                                if (e.target.value) params.set('categoria', e.target.value);
                                else params.delete('categoria');
                                router.push(`/products?${params.toString()}`);
                            }}
                            defaultValue={searchParams.get('categoria') || ''}
                            className="bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm cursor-pointer font-bold appearance-none"
                        >
                            <option value="">Todas Soluções</option>
                            <option value="Eletrônicos">Eletrônicos</option>
                            <option value="Acessórios">Acessórios</option>
                            <option value="Casa">Casa</option>
                            <option value="Moda">Moda</option>
                            <option value="Beleza">Beleza</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm px-4">
                        <div className="text-7xl mb-8">🔭</div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">Nenhum resultado</h3>
                        <p className="text-slate-500 mt-4 font-medium max-w-md mx-auto">
                            Não encontramos nada para &quot;{searchQuery || searchParams.get('categoria')}&quot;.
                            Tente um termo mais simples ou limpe os filtros.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                router.push('/products');
                            }}
                            className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                    &copy; 2026 Aurum Tech. Intermediação de Alta Performance.
                </div>
            </footer>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 pt-40 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProductsContent />
        </Suspense>
    );
}
