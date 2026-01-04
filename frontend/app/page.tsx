import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../lib/api';

// Fetch data on the server
async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) {
      console.error(`Status check failed: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[10%] right-[20%] w-[30rem] h-[30rem] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm tracking-wide shadow-sm">
            🚀 Frete Grátis para todo o Brasil
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">
            Tecnologia & Estilo <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ao seu alcance.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Descubra uma seleção exclusiva de produtos que simplificam sua rotina e elevam seu lifestyle. Qualidade garantida e entrega rastreada.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/products" className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition transform duration-200">
              Ver Ofertas
            </a>
            <a href="/vip" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition">
              Clube VIP
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Em Destaque</h2>
              <p className="text-gray-500 mt-2 text-lg">Os itens mais vendidos e desejados da semana.</p>
            </div>
            <a href="/products" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline flex items-center gap-1">
              Ver catálogo completo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.length > 0 ? (
              products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mt-1">Verifique se o backend está rodando em :5000</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 block">DropStore</span>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sua loja favorita para encontrar as melhores novidades do mercado global com preço justo.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600">Sobre nós</a></li>
              <li><a href="#" className="hover:text-blue-600">Contato</a></li>
              <li><a href="#" className="hover:text-blue-600">Rastrear Pedido</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Políticas</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-blue-600">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Pagamento Seguro</h4>
            <div className="flex gap-2 opacity-70">
              {/* Icons placeholders using bg colors */}
              <div className="w-10 h-6 bg-gray-200 rounded text-[10px] flex items-center justify-center">Visa</div>
              <div className="w-10 h-6 bg-gray-200 rounded text-[10px] flex items-center justify-center">Master</div>
              <div className="w-10 h-6 bg-gray-200 rounded text-[10px] flex items-center justify-center">Pix</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-50 text-center text-gray-400 text-sm">
          &copy; 2026 DropStore. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
