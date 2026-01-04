import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: number;
    titulo: string;
    preco: number;
    imagens: string[];
    ai_analysis?: {
        approved: boolean;
        analysis?: {
            score: number;
            margin: string;
        }
    };
}

export default function ProductCard({ product }: { product: Product }) {
    const image = product.imagens && product.imagens.length > 0 ? product.imagens[0] : 'https://via.placeholder.com/300';

    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                <Image
                    src={image}
                    alt={product.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-700 ease-in-out"
                />

                {/* AI Analysis Badge */}
                {product.ai_analysis?.approved && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-blue-600/90 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-xl backdrop-blur-md italic">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        IA CURATED: {product.ai_analysis.analysis?.score}%
                    </div>
                )}

                <div className="absolute bottom-4 right-4 bg-white/95 px-4 py-2 rounded-xl text-[10px] font-black shadow-lg border border-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition duration-300 uppercase italic tracking-widest">
                    Detalhes
                </div>
            </div>

            <div className="mt-6 space-y-3 px-2">
                <h3 className="text-slate-900 font-extrabold text-xl group-hover:text-blue-600 transition tracking-tighter leading-tight italic">
                    {product.titulo}
                </h3>

                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900 italic">R$ {Number(product.preco).toFixed(2)}</p>
                    <span className="text-xs text-slate-400 line-through font-bold">R$ {Number(Number(product.preco) * 1.45).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Estoque Ok</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase italic opacity-60">Aurum Tech</span>
                </div>
            </div>
        </Link>
    );
}
