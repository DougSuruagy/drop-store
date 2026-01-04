import { Suspense } from 'react';
import ProductListClient from './ProductListClient';

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 pt-40 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <ProductListClient />
        </Suspense>
    );
}
