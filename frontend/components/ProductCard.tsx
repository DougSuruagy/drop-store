import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: number;
    titulo: string;
    preco: number;
    imagens: string[];
}

export default function ProductCard({ product }: { product: Product }) {
    // Handle case where specific image might be missing or placeholder needed
    const image =
        product.imagens && product.imagens.length > 0
            ? product.imagens[0]
            : 'https://via.placeholder.com/300';

    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-100 shadow-sm transition hover:shadow-md">
                <Image
                    src={image}
                    alt={product.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Badge example */}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm backdrop-blur-sm">
                    Novo
                </div>
            </div>
            <div className="mt-4 space-y-1">
                <h3 className="text-gray-900 font-medium group-hover:text-blue-600 transition truncate">{product.titulo}</h3>
                <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">R$ {Number(product.preco).toFixed(2)}</p>
                    <span className="text-xs text-gray-400 line-through">R$ {Number(Number(product.preco) * 1.5).toFixed(2)}</span>
                </div>
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                    Frete Grátis
                </p>
            </div>
        </Link>
    );
}
