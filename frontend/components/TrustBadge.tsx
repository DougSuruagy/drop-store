export default function TrustBadge() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-6 bg-slate-50/50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition opacity-60 hover:opacity-100">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Mercado Pago</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition opacity-60 hover:opacity-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Certificado SSL</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition opacity-60 hover:opacity-100">
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Garantia 7 Dias</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition opacity-60 hover:opacity-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Servidores Cloud</span>
            </div>
        </div>
    );
}
