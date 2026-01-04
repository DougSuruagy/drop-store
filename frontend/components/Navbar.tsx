import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        DropStore
                    </Link>

                    <div className="hidden md:flex space-x-8 text-gray-600 text-sm font-medium">
                        <Link href="/" className="hover:text-blue-600 transition">Início</Link>
                        <Link href="/products" className="hover:text-blue-600 transition">Produtos</Link>
                        <Link href="/blog" className="hover:text-blue-600 transition">Blog</Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition relative group">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </Link>
                        <Link href="/login" className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition">
                            Entrar
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
