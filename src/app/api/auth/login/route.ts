import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/firebase/db";
import { SignJWT } from "jose";

// Cookie session expiry - 14 días (en segundos)
const SESSION_EXPIRY = 60 * 60 * 24 * 14;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "No ID token provided" },
        { status: 400 }
      );
    }

    // Verificar el token de Firebase y obtener info del usuario
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Extra info desde Firestore (opcional)
    const userData = await getUserProfile(uid);

    // Crear JWT personalizado con jose
    const jwt = await new SignJWT({ uid }) // podés meter más info si querés
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_EXPIRY}s`)
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Setear cookie personalizada
    (await cookies()).set({
      name: "session",
      value: jwt,
      maxAge: SESSION_EXPIRY,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error during login",
      },
      { status: 401 }
    );
  }
}
