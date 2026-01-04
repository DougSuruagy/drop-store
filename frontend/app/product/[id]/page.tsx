import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../../components/Header';
import PriceBox from '../../../components/PriceBox';
import TrustBadge from '../../../components/TrustBadge';
import { API_URL } from '../../../lib/api';

async function getProduct(id: string) {
    try {
        const res = await fetch(`${API_URL} /products/${id} `, {
            next: { revalidate: 3600 } // PERFORMANCE: Cache de 1 hora para dados estáticos de produto
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const product = await getProduct(params.id);
    if (!product) return { title: 'Produto não encontrado' };
    return { title: `${product.titulo} | Aurum Tech` };
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const product = await getProduct(params.id);

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="pt-40 text-center px-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Produto Não Encontrado.</h1>
                    <Link href="/" className="mt-8 inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold">Voltar ao Início</Link>
                </div>
            </div>
        );
    }

    const image = product.imagens && product.imagens.length > 0 ? product.imagens[0] : 'https://via.placeholder.com/800';
    const beneficios = product.beneficios || ['Entrega Garantida', 'Suporte Especializado', 'Qualidade Premium'];
    const prova_social = product.prova_social || 'Item mais vendido da semana';

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Header />

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Minimalist Path */}
                <nav className="flex mb-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Link href="/" className="hover:text-blue-600 transition">Coleção</Link>
                    <span className="mx-4 opacity-20">/</span>
                    <span className="text-slate-900">{product.categoria}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                    {/* LEFT CLOUMN: VISUALS */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-3xl">
                            <Image
                                src={image}
                                alt={product.titulo}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Prova Social Integrada */}
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-2xl flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter italic">
                                        ⚡ {prova_social}
                                    </p>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SALES COPY (The "Essential" Flow) */}
                    <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32">
                        <section>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8 italic">
                                {product.titulo}
                            </h1>

                            {/* PROBLEMA QUE RESOLVE */}
                            <div className="p-6 bg-blue-50/50 rounded-2xl border-l-4 border-blue-600 mb-8">
                                <p className="text-lg font-bold text-slate-700 italic">
                                    &quot;A solução definitiva para quem busca performance sem complicações.&quot;
                                </p>
                            </div>

                            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                                {product.descricao}
                            </p>

                            {/* BENEFÍCIOS PRÁTICOS */}
                            <div className="space-y-4 mb-12">
                                {beneficios.map((b: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm italic">{b}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* PRICE & CTA (PriceBox) */}
                        <PriceBox price={product.preco} productId={product.id} />

                        {/* GARANTIA & SEGURANÇA */}
                        <div className="space-y-8">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Intermediação Protegida</p>
                                <TrustBadge />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-center">
                                <p className="text-xs font-bold text-slate-500 italic">
                                    Satisfação garantida ou seu dinheiro de volta. Intermediamos cada centavo com segurança via Mercado Pago.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
