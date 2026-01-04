export default function Benefits() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:shadow-xl hover:shadow-blue-500/5 transition duration-500 group">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-6 transition">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 leading-tight">Envio em 24h</h4>
                            <p className="text-sm text-slate-500 font-medium">Processamento ultra-rápido</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:shadow-xl hover:shadow-blue-500/5 transition duration-500 group">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-6 transition">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 leading-tight">Compra Segura</h4>
                            <p className="text-sm text-slate-500 font-medium">Via Mercado Pago</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:shadow-xl hover:shadow-blue-500/5 transition duration-500 group">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-6 transition">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 leading-tight">Suporte IA</h4>
                            <p className="text-sm text-slate-500 font-medium">Ajuda 24/7 p/ pedidos</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
