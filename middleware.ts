import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/api"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificamos si la ruta es pública o es una ruta de API
  const isApiRoute = path.startsWith("/api");
  const isPublicRoute = publicRoutes.includes(path) || isApiRoute;

  const sessionToken = request.cookies.get("session")?.value;
  let isAuthenticated = false;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no está definido en el entorno");
  }

  if (sessionToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(sessionToken, secret);

      // Extra: podés validar roles u otros claims aquí
      isAuthenticated = !!payload?.uid;
    } catch (err) {
      console.warn("Token inválido o expirado en middleware:", err);
    }
  }

  // Log de ayuda en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Ruta: ${path} | Auth: ${isAuthenticated}`);
  }

  // Redirigir si NO está autenticado y accede a ruta privada
  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURIComponent(request.url));
    return NextResponse.redirect(url);
  }

  // Redirigir si YA está autenticado y entra a /login o /register
  if ((path === "/login" || path === "/register") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Excluir archivos estáticos y rutas internas de Next.js
export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|robots.txt|manifest.json).*)"],
};
