import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

// Dynamic import with SSR disabled to ensure client-only rendering
const ProductsClient = dynamicImport(() => import('./ProductsClient'), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
});

// Force dynamic rendering to skip static generation (prerendering) entirely.
export const dynamic = 'force-dynamic';

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProductsClient />
        </Suspense>
    );
}
