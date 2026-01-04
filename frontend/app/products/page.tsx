import dynamicImport from 'next/dynamic';

// Dynamic import with SSR disabled ensures this component is only rendered on the client side,
// completely bypassing the build-time prerendering checks for useSearchParams.
const ProductsClient = dynamicImport(() => import('./ProductsClient'), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
});

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
    return <ProductsClient />;
}
