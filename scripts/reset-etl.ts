// Script para resetear el proceso ETL - Limpia todas las colecciones del Data Warehouse
import { connectToDatabase, closeDatabase, createIndexes } from '../lib/db';

async function resetETL() {
  try {
    console.log('🔄 Iniciando reset del proceso ETL...');
    
    const db = await connectToDatabase();
    
    // Lista de colecciones a limpiar
    const collections = ['products', 'customers', 'orders', 'salesReports', 'metadata'];
    
    console.log('\n📊 Estado actual de las colecciones:');
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  - ${collectionName}: ${count} documentos`);
    }
    
    console.log('\n🗑️  Eliminando documentos de las colecciones...');
    
    // Eliminar documentos de cada colección
    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`  ✓ ${collectionName}: ${result.deletedCount} documentos eliminados`);
    }
    
    // Eliminar índices existentes
    console.log('\n🔧 Eliminando índices existentes...');
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await db.collection(collectionName).dropIndex(index.name);
            console.log(`  ✓ ${collectionName}: índice '${index.name}' eliminado`);
          }
        }
      } catch (error) {
        // Ignorar errores si no hay índices
      }
    }
    
    // Recrear índices
    console.log('\n🔧 Recreando índices...');
    await createIndexes();
    console.log('  ✓ Índices recreados');
    
    // Verificar estado final
    console.log('\n📊 Estado final de las colecciones:');
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  - ${collectionName}: ${count} documentos`);
    }
    
    await closeDatabase();
    
    console.log('\n✅ Reset del proceso ETL completado exitosamente');
    console.log('💡 Ahora puedes ejecutar los procesos ETL nuevamente desde cero');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el reset del proceso ETL:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  resetETL();
}

export { resetETL };
