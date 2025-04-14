import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Rutas que no requieren autenticación
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/api"];

// Middleware que se ejecuta en cada petición
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Verificar si el usuario está autenticado (mediante cookie de sesión)
  const session = request.cookies.get("session")?.value;
  const isAuthenticated = !!session;

  // Si es una ruta protegida y el usuario no está autenticado, redirigir al login
  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Si es una ruta de auth (/login, /register) y el usuario está autenticado, redirigir al dashboard
  if ((path === "/login" || path === "/register") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continuar con la solicitud normal
  return NextResponse.next();
}

// Configurar paths en los que se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /_next (recursos estáticos de Next.js)
     * 2. /api (rutas API que manejan su propia autenticación)
     * 3. /static (archivos estáticos)
     * 4. /_vercel (archivos internos de Vercel)
     * 5. /favicon.ico, /robots.txt, etc.
     */
    "/((?!_next|static|_vercel|favicon.ico|robots.txt|manifest.json).*)",
  ],
};
