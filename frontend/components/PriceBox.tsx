'use client';

import AddToCartButton from './AddToCartButton';

interface PriceBoxProps {
    product: {
        id: number;
        titulo: string;
        preco: number;
        imagens: string[];
    };
}

export default function PriceBox({ product }: PriceBoxProps) {
    const discountedPrice = Number(product.preco);
    const originalPrice = discountedPrice * 1.45;

    return (
        <div className="p-8 rounded-[2.5rem] bg-slate-950 text-white shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">Oferta do Dia</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estoque Limitado</span>
                </div>

                <div className="mb-8">
                    <p className="text-sm font-bold text-slate-500 line-through mb-1">De R$ {originalPrice.toFixed(2)}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-blue-500 tracking-tighter italic">Por</span>
                        <p className="text-6xl font-black tracking-tighter">R$ {discountedPrice.toFixed(2)}</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Ou 12x de R$ {(discountedPrice / 12 * 1.15).toFixed(2)}</p>
                </div>

                <div className="space-y-4">
                    <AddToCartButton product={product} />
                    <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pt-2">
                        ⚡ APROVAÇÃO INSTANTÂNEA VIA PIX
                    </p>
                </div>
            </div>
        </div>
    );
}
