'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { API_URL } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

const PRODUCTS_PER_PAGE = 12;

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = useCallback(async (pageNum: number, append = false) => {
        const categoria = searchParams.get('categoria');
        const q = searchParams.get('q');

        const params = new URLSearchParams();
        if (categoria) params.append('categoria', categoria);
        if (q) params.append('q', q);
        params.append('page', pageNum.toString());
        params.append('limit', PRODUCTS_PER_PAGE.toString());

        const url = `${API_URL}/products?${params.toString()}`;

        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return [];
            const data = await res.json();

            if (data.length < PRODUCTS_PER_PAGE) {
                setHasMore(false);
            }

            if (append) {
                setProducts(prev => [...prev, ...data]);
            } else {
                setProducts(data);
                setHasMore(data.length === PRODUCTS_PER_PAGE);
            }

            return data;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            return [];
        }
    }, [searchParams]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setPage(1);
            await fetchProducts(1, false);
            setLoading(false);
        };
        load();
    }, [searchParams, fetchProducts]);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        await fetchProducts(nextPage, true);
        setPage(nextPage);
        setLoadingMore(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) params.set('q', searchQuery);
        else params.delete('q');
        router.push(`/products?${params.toString()}`);
    };

    const handleCategoryChange = (categoria: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoria) params.set('categoria', categoria);
        else params.delete('categoria');
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Nosso Catálogo</h1>
                        <p className="text-gray-500 mt-2">Explore nossa seleção exclusiva de produtos premium.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                            />
                            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </form>

                        <select
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            defaultValue={searchParams.get('categoria') || ''}
                            className="bg-white border border-gray-200 rounded-full px-6 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                        >
                            <option value="">Todas Categorias</option>
                            <option value="Eletrônicos">Eletrônicos</option>
                            <option value="Acessórios">Acessórios</option>
                            <option value="Casa">Casa</option>
                            <option value="Moda">Moda</option>
                            <option value="Beleza">Beleza</option>
                            <option value="Pets">Pets</option>
                            <option value="Decoração">Decoração</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                            {products.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-16">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-10 py-4 bg-black text-white rounded-full font-bold text-lg shadow-xl hover:bg-gray-800 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                >
                                    {loadingMore ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            Carregar Mais Produtos
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {!hasMore && products.length > 0 && (
                            <div className="text-center mt-16 text-gray-400 text-sm">
                                🎉 Você viu todos os {products.length} produtos!
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900">Nenhum produto encontrado</h3>
                        <p className="text-gray-500 mt-2">Não encontramos nada para "{searchQuery || searchParams.get('categoria')}".</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                router.push('/products');
                            }}
                            className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; 2026 DropStore. Qualidade garantida para você.
                </div>
            </footer>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProductsContent />
        </Suspense>
    );
}
