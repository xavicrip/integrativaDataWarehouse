// Conexión a MongoDB
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'datawarehouse';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }

  db = client.db(MONGODB_DB);
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Crear índices para optimizar consultas
export async function createIndexes(): Promise<void> {
  const database = await connectToDatabase();
  
  // Índices para productos
  await database.collection('products').createIndex({ productId: 1 }, { unique: true });
  await database.collection('products').createIndex({ category: 1 });
  
  // Índices para clientes
  await database.collection('customers').createIndex({ customerId: 1 }, { unique: true });
  await database.collection('customers').createIndex({ email: 1 });
  
  // Índices para órdenes
  await database.collection('orders').createIndex({ orderId: 1 }, { unique: true });
  await database.collection('orders').createIndex({ customerId: 1 });
  await database.collection('orders').createIndex({ orderDate: -1 });
  
  // Índices para reportes de ventas
  await database.collection('salesReports').createIndex({ reportDate: -1 });
}
