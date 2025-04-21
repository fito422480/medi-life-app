import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

/**
 * API endpoint para verificar la sesión del usuario
 * Utilizado por el middleware y el cliente para validar tokens
 */
export async function POST(_request: NextRequest) {
  try {
    // Obtener el token de la sesión desde las cookies
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "No session cookie found",
        },
        {
          status: 401,
        }
      );
    }

    // Verificar el token con Firebase Admin
    const decodedClaim = await auth.verifySessionCookie(sessionCookie, true);

    // Retornar la información del usuario autenticado
    return NextResponse.json({
      success: true,
      user: {
        uid: decodedClaim.uid,
        email: decodedClaim.email,
        role: decodedClaim.role,
      },
    });
  } catch (err: unknown) {
    console.error("Session verification error:", err);
    // En caso de error, el token es inválido o ha expirado
    return NextResponse.json(
      {
        success: false,
        message: "Invalid session",
      },
      {
        status: 401,
      }
    );
  }
}

/**
 * Verificar si una sesión es válida (GET para chequeos desde el cliente)
 */
export async function GET() {
  try {
    // Obtener el token de la sesión desde las cookies
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ isValid: false });
    }

    // Verificar el token con Firebase Admin
    await auth.verifySessionCookie(sessionCookie, true);

    // Si no hay errores, la sesión es válida
    return NextResponse.json({ isValid: true });
  } catch (err: unknown) {
    console.error("Session check error:", err);
    // Si hay un error, la sesión es inválida
    return NextResponse.json({ isValid: false });
  }
}
