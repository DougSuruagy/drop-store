import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { API_URL } from '../../lib/api';

async function getProducts(searchParams: any) {
    const { categoria, q } = searchParams;
    let url = `${API_URL}/products`;

    // Constrói query string se necessário
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (q) params.append('q', q);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
    const products = await getProducts(searchParams);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Nosso Catálogo</h1>
                        <p className="text-gray-500 mt-2">Explore nossa seleção exclusiva de produtos premium.</p>
                    </div>

                    {/* Filtros simples (placeholder) */}
                    <div className="flex gap-4">
                        <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>Todos os Produtos</option>
                            <option>Eletrônicos</option>
                            <option>Acessórios</option>
                            <option>Casa Inteligente</option>
                        </select>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-300">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900">Nenhum produto encontrado</h3>
                        <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou busca.</p>
                        <a href="/products" className="mt-6 inline-block text-blue-600 font-semibold hover:underline">Limpar filtros</a>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; 2026 DropStore. Qualidade garantida.
                </div>
            </footer>
        </div>
    );
}
