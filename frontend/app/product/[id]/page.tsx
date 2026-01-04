import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import AddToCartButton from '../../../components/AddToCartButton';
import { API_URL } from '../../../lib/api';

async function getProduct(id: string) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const product = await getProduct(params.id);
    if (!product) return { title: 'Produto não encontrado' };
    return { title: `${product.titulo} | DropStore` };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 text-center">
                    <h1 className="text-2xl font-bold">Produto não encontrado</h1>
                    <a href="/" className="text-blue-600 underline mt-4 block">Voltar para Home</a>
                </div>
            </div>
        );
    }

    const image = product.imagens && product.imagens.length > 0 ? product.imagens[0] : 'https://via.placeholder.com/600';

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />
            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex mb-8 text-sm text-gray-500">
                    <a href="/" className="hover:text-black">Home</a>
                    <span className="mx-2">/</span>
                    <span className="text-black">{product.categoria}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Section */}
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
                        <Image
                            src={image}
                            alt={product.titulo}
                            fill
                            className="object-cover hover:scale-105 transition duration-500"
                            priority
                        />
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wide">
                                Em Estoque
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">{product.titulo}</h1>
                        <div className="flex items-end gap-3 mb-8">
                            <p className="text-4xl font-bold text-gray-900">R$ {Number(product.preco).toFixed(2)}</p>
                            <p className="text-lg text-gray-400 line-through mb-1">R$ {(Number(product.preco) * 1.5).toFixed(2)}</p>
                        </div>

                        <div className="prose prose-lg text-gray-600 mb-10">
                            <p>{product.descricao}</p>
                        </div>

                        <div className="flex gap-4">
                            <AddToCartButton productId={product.id} />
                        </div>

                        <div className="mt-8 border-t border-gray-100 pt-8 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Garantia de 30 dias para devolução</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Pagamento seguro via PagSeguro</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
