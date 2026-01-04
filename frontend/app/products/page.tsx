import ProductsClient from './ProductsClient';

// Esta página agora é um Server Component simples.
// O arquivo loading.tsx ao lado cuida do Suspense Boundary necessário para o useSearchParams funcionar no ProductsClient.

export default function ProductsPage() {
    return <ProductsClient />;
}
