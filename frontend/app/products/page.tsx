import dynamic from 'next/dynamic';

// Importação dinâmica com SSR desabilitado.
// Isso garante que o componente e seus hooks (useSearchParams) só sejam executados no navegador.
const ProductsClient = dynamic(() => import('./ProductsClient'), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
});

export default function ProductsPage() {
    return <ProductsClient />;
}
