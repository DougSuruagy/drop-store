import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Benefits from '../components/Benefits';
import TrustBadge from '../components/TrustBadge';
import { API_URL } from '../lib/api';

// Fetch data on the server
async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

interface Product {
  id: number;
  titulo: string;
  preco: number;
  imagens: string[];
  categoria: string;
}

export default async function Home() {
  const products: Product[] = await getProducts();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      <Header />

      {/* 🏠 1. PÁGINA INICIAL (Regra: Landing Page) */}
      <main>
        {/* HERO: HEADLINE CLARA (PROBLEMA + SOLUÇÃO) */}
        <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100/50">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
              Plataforma Aurum Tech
            </div>

            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] text-slate-900">
              Resolva Agora. <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Pague Depois.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Curadoria de gadgets que resolvem problemas reais do seu dia a dia. Simples, rápido e com intermediação garantida.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="#catalogo" className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:scale-105 transition-all duration-300">
                VER SOLUÇÕES
              </a>
            </div>
          </div>

          {/* Background Blur Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none opacity-40">
            <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] bg-indigo-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
            <div className="absolute top-[10%] right-[15%] w-[40rem] h-[40rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
          </div>
        </section>

        {/* BENEFÍCIOS RÁPIDOS */}
        <Benefits />

        {/* PRODUTOS ÂNCORA (Regra: Cards Simples) */}
        <section id="catalogo" className="py-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Escolha sua Solução</h2>
              <p className="text-slate-500 text-lg font-medium">Itens selecionados por IA para alta performance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* PROVA SOCIAL & CONFIANÇA */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-12">
              <p className="text-slate-900 font-black text-3xl tracking-tight leading-tight mb-4">
                &quot;A curadoria da Aurum Tech é imbatível. Recebi meu Projetor Cinematic em 8 dias e a qualidade é surpreendente.&quot;
              </p>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">— Douglas S., Cliente Verificado</span>
            </div>
            <TrustBadge />
          </div>
        </section>
      </main>

      {/* FOOTER TRANSPARENTE */}
      <footer className="bg-slate-900 text-slate-500 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <span className="font-black text-2xl text-white mb-6 block tracking-tighter">AURUM<span className="text-blue-500">TECH</span></span>
            <p className="text-xs font-bold leading-relaxed uppercase tracking-widest italic">
              Operação Plaintext Zero. <br /> Intermediação Premium.
            </p>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Jurídico</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Ajuda</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition">Rastrear Pedido</a></li>
              <li><a href="#" className="hover:text-white transition">Falar Conosco</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 leading-relaxed uppercase tracking-widest">
              &copy; 2026 Aurum Tech. <br /> CNPJ sob demanda. <br /> São Paulo - SP.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
