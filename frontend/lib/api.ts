// URL do backend no Render (Produção)
const PRODUCTION_URL = 'https://drop-api-p4u3.onrender.com/api';

// Garante que a URL seja absoluta, especialmente para chamadas no Servidor (SSR)
// Se a variável de ambiente não começar com http, usamos a URL de produção.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http'))
    ? process.env.NEXT_PUBLIC_API_URL
    : PRODUCTION_URL;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Adiciona token se existir no localStorage (apenas no lado do cliente)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Garante que o endpoint comece com /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        let errorMessage = 'Erro na requisição';
        try {
            const error = await res.json();
            errorMessage = error.error || errorMessage;
        } catch (e) {
            // Ignora erro de parse
        }
        throw new Error(errorMessage);
    }

    return res.json();
}
