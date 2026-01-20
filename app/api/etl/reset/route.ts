// API route para resetear el proceso ETL
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, closeDatabase, createIndexes } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    
    // Lista de colecciones a limpiar
    const collections = ['products', 'customers', 'orders', 'salesReports', 'metadata'];
    
    // Obtener estado inicial
    const initialState: Record<string, number> = {};
    for (const collectionName of collections) {
      initialState[collectionName] = await db.collection(collectionName).countDocuments();
    }
    
    // Eliminar documentos de cada colección
    const deletedCounts: Record<string, number> = {};
    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      deletedCounts[collectionName] = result.deletedCount;
    }
    
    // Eliminar índices existentes (excepto _id_)
    const droppedIndexes: Record<string, string[]> = {};
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        const dropped: string[] = [];
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await db.collection(collectionName).dropIndex(index.name);
            dropped.push(index.name);
          }
        }
        if (dropped.length > 0) {
          droppedIndexes[collectionName] = dropped;
        }
      } catch (error) {
        // Ignorar errores si no hay índices
      }
    }
    
    // Recrear índices
    await createIndexes();
    
    // Obtener estado final
    const finalState: Record<string, number> = {};
    for (const collectionName of collections) {
      finalState[collectionName] = await db.collection(collectionName).countDocuments();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Proceso ETL resetado exitosamente',
      initialState,
      deletedCounts,
      droppedIndexes,
      finalState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error al resetear el proceso ETL',
      },
      { status: 500 }
    );
  }
}

// También permitir GET para verificar estado sin resetear
export async function GET() {
  try {
    const db = await connectToDatabase();
    const collections = ['products', 'customers', 'orders', 'salesReports', 'metadata'];
    
    const state: Record<string, number> = {};
    for (const collectionName of collections) {
      state[collectionName] = await db.collection(collectionName).countDocuments();
    }
    
    const totalDocuments = Object.values(state).reduce((sum, count) => sum + count, 0);
    
    return NextResponse.json({
      collections: state,
      totalDocuments,
      message: totalDocuments === 0 
        ? 'Data Warehouse está vacío. Puedes ejecutar procesos ETL para cargar datos.'
        : `Data Warehouse contiene ${totalDocuments} documentos en total.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
