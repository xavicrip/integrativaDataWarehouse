// API route para inicializar la base de datos
import { NextResponse } from 'next/server';
import { connectToDatabase, createIndexes } from '@/lib/db';

export async function POST() {
  try {
    await connectToDatabase();
    await createIndexes();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos inicializada correctamente' 
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
