import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('meca-dashboard-secret-key-2026');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Permite archivos estáticos, imágenes y API de autenticación siempre
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('/api/auth') ||
        pathname === '/favicon.ico' ||
        pathname === '/meca-logo.png'
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth-token')?.value;

    // 2. Si intenta ir a /login pero ya tiene token válido, al dashboard
    if (pathname === '/login' && token) {
        try {
            await jwtVerify(token, SECRET_KEY);
            return NextResponse.redirect(new URL('/', request.url));
        } catch (e) {
            // Token inválido, deja que vaya a login
            return NextResponse.next();
        }
    }

    // 3. Permite ir a /login si no tiene token
    if (pathname === '/login') {
        return NextResponse.next();
    }

    // 4. Protección para el resto de rutas
    if (!token) {
        console.log("Middleware: No token found, redirecting to /login");
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
    }

    try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.next();
    } catch (err) {
        console.error("Middleware: Token verification failed", err);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token'); // Limpia token corrupto
        return response;
    }
}

// IMPORTANTE: Matcher simplificado para asegurar que atrape todo excepto lo explícitamente excluido
export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|meca-logo.png).*)'],
};
