'use client';

import Link from 'next/link';

export default function Header() {
    return (
        <header className="fixed w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
                            <span className="text-white font-black text-xl italic">A</span>
                        </div>
                        <span className="font-black text-2xl text-slate-900 tracking-tighter">
                            AURUM<span className="text-blue-600">TECH</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 translate-x-12">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operação 100% On-line</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-slate-400 leading-none">Checkout Seguro</span>
                            <span className="text-xs font-bold text-slate-900">Mercado Pago</span>
                        </div>
                        <Link href="/cart" className="relative p-2.5 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 transition shadow-sm border border-slate-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
