// API route para obtener datos agregados para gráficos
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Productos por categoría
    const productsByCategory = await db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Ventas por producto (de órdenes)
    const salesByProduct = await db.collection('orders').aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.productName',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' }
      }},
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Ventas por fecha
    const salesByDate = await db.collection('orders').aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }},
      { $sort: { _id: 1 } }
    ]).toArray();

    // Órdenes por estado
    const ordersByStatus = await db.collection('orders').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Clientes por ciudad
    const customersByCity = await db.collection('customers').aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Ingresos por categoría de producto
    const revenueByCategory = await db.collection('orders').aggregate([
      { $unwind: '$items' },
      { $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: 'productId',
        as: 'product'
      }},
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: { $ifNull: ['$product.category', 'Sin categoría'] },
        totalRevenue: { $sum: '$items.total' },
        orderCount: { $sum: 1 }
      }},
      { $sort: { totalRevenue: -1 } }
    ]).toArray();

    return NextResponse.json({
      productsByCategory: productsByCategory.map((item: any) => ({
        category: item._id,
        count: item.count,
        totalQuantity: item.totalQuantity
      })),
      salesByProduct: salesByProduct.map((item: any) => ({
        product: item._id,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue
      })),
      salesByDate: salesByDate.map((item: any) => ({
        date: item._id,
        count: item.count,
        revenue: item.totalRevenue
      })),
      ordersByStatus: ordersByStatus.map((item: any) => ({
        status: item._id,
        count: item.count
      })),
      customersByCity: customersByCity.map((item: any) => ({
        city: item._id || 'Sin ciudad',
        count: item.count
      })),
      revenueByCategory: revenueByCategory.map((item: any) => ({
        category: item._id,
        revenue: item.totalRevenue,
        orderCount: item.orderCount
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
