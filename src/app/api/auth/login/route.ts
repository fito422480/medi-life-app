import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/firebase/db";

// Cookie session expiry - 14 días (en segundos)
const SESSION_EXPIRY = 60 * 60 * 24 * 14;

/**
 * API endpoint para iniciar sesión y generar cookie de sesión
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener el idToken desde el cliente (generado por Firebase Auth en el cliente)
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          message: "No ID token provided",
        },
        {
          status: 400,
        }
      );
    }

    // Verificar el idToken y crear cookie de sesión
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY * 1000, // Firebase usa milisegundos
    });

    // Obtener la información del usuario desde el token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Obtener datos adicionales del usuario desde Firestore
    const userData = await getUserProfile(uid);

    // Configurar la cookie de sesión
    cookies().set({
      name: "session",
      value: sessionCookie,
      maxAge: SESSION_EXPIRY,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Responder con éxito
    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Login API error:", error);

    // Responder con error
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error during login",
      },
      {
        status: 401,
      }
    );
  }
}
