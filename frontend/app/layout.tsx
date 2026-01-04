import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// SEO OTIMIZADO - Aurum Tech
export const metadata: Metadata = {
  title: {
    default: "Aurum Tech | Gadgets e Tecnologia Premium",
    template: "%s | Aurum Tech"
  },
  description: "Loja de gadgets, organização e smart home com curadoria inteligente. Frete grátis, pagamento via Pix com aprovação instantânea. Entrega garantida.",
  keywords: [
    "gadgets",
    "tecnologia",
    "smart home",
    "organização",
    "produtividade",
    "fone bluetooth",
    "carregador portátil",
    "suporte notebook",
    "ring light",
    "hub usb-c"
  ],
  authors: [{ name: "Aurum Tech" }],
  creator: "Aurum Tech",
  publisher: "Aurum Tech",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://drop-store-rho.vercel.app",
    siteName: "Aurum Tech",
    title: "Aurum Tech | Gadgets e Tecnologia Premium",
    description: "Loja de gadgets com curadoria inteligente. Frete grátis e pagamento via Pix.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aurum Tech - Gadgets Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurum Tech | Gadgets Premium",
    description: "Gadgets e tecnologia com curadoria inteligente. Frete grátis!",
    images: ["/og-image.png"],
  },
  verification: {
    google: "google-site-verification-code", // Substituir pelo real
  },
  alternates: {
    canonical: "https://drop-store-rho.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Aurum Tech",
              "url": "https://drop-store-rho.vercel.app",
              "logo": "https://drop-store-rho.vercel.app/logo.png",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "Portuguese"
              }
            })
          }}
        />
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Aurum Tech",
              "url": "https://drop-store-rho.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://drop-store-rho.vercel.app/products?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
