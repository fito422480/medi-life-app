import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API endpoint para cerrar sesión eliminando la cookie de sesión
 */
export async function POST() {
  try {
    // Eliminar la cookie de sesión
    (await cookies()).delete('session');
    
    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Responder con error
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during logout' 
      }, 
      { 
        status: 500 
      }
    );
  }
}