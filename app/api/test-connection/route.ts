// API route para probar la conexión a MongoDB
import { NextResponse } from 'next/server';
import { connectToDatabase, closeDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Probar ping
    const pingResult = await db.admin().ping();
    
    // Listar bases de datos
    const adminDb = db.admin();
    const dbs = await adminDb.listDatabases();
    
    // Listar colecciones
    const collections = await db.listCollections().toArray();
    
    // Contar documentos en cada colección
    const collectionCounts: Record<string, number> = {};
    for (const coll of collections) {
      collectionCounts[coll.name] = await db.collection(coll.name).countDocuments();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a MongoDB exitosa',
      ping: pingResult,
      database: process.env.MONGODB_DB || 'datawarehouse',
      availableDatabases: dbs.databases.map((db: any) => ({
        name: db.name,
        sizeMB: (db.sizeOnDisk / 1024 / 1024).toFixed(2),
      })),
      collections: collections.map((coll: any) => coll.name),
      documentCounts: collectionCounts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error conectando a MongoDB. Asegúrate de que MongoDB esté corriendo.',
      },
      { status: 500 }
    );
  }
}
