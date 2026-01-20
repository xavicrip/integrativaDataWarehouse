// Script para probar la conexión a MongoDB
import { connectToDatabase, closeDatabase } from '../lib/db';

async function testConnection() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    const db = await connectToDatabase();
    console.log('✅ Conexión exitosa a MongoDB');
    
    // Probar ping
    const result = await db.admin().ping();
    console.log('✅ Ping exitoso:', result);
    
    // Listar bases de datos
    const adminDb = db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('\n📊 Bases de datos disponibles:');
    dbs.databases.forEach((dbInfo: any) => {
      console.log(`  - ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Verificar la base de datos del proyecto
    const dbName = process.env.MONGODB_DB || 'datawarehouse';
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Colecciones en '${dbName}':`);
    if (collections.length === 0) {
      console.log('  (ninguna colección aún)');
    } else {
      collections.forEach((coll: any) => {
        console.log(`  - ${coll.name}`);
      });
    }
    
    await closeDatabase();
    console.log('\n✅ Prueba completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    console.error('\n💡 Asegúrate de que:');
    console.error('   1. MongoDB esté corriendo (mongod)');
    console.error('   2. La URI de conexión sea correcta');
    console.error('   3. Tengas permisos para acceder a MongoDB');
    process.exit(1);
  }
}

testConnection();
