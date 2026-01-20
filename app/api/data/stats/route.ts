// API route para obtener estadísticas del data warehouse
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    const [productsCount, customersCount, ordersCount, reportsCount] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('customers').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('salesReports').countDocuments(),
    ]);

    const totalRevenue = await db.collection('orders').aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray();

    return NextResponse.json({
      products: productsCount,
      customers: customersCount,
      orders: ordersCount,
      reports: reportsCount,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
