// Script para inicializar la base de datos y crear índices
// Ejecutar desde la raíz del proyecto después de instalar dependencias
// Este script se puede ejecutar manualmente o desde una API route

import { connectToDatabase, createIndexes, closeDatabase } from '../lib/db';

async function init() {
  try {
    console.log('Conectando a MongoDB...');
    await connectToDatabase();
    console.log('✓ Conexión exitosa');
    
    console.log('Creando índices...');
    await createIndexes();
    console.log('✓ Índices creados');
    
    await closeDatabase();
    console.log('Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  init();
}

export { init };
