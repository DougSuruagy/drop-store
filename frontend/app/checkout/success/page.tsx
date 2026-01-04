import { Suspense } from 'react';
import Header from '../../../components/Header';
import SuccessClient from './SuccessClient';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />
            <Suspense fallback={
                <div className="pt-40 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            }>
                <SuccessClient />
            </Suspense>
        </div>
    );
}
