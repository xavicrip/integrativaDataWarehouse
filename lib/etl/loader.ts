// Cargador de datos a MongoDB
import { Db } from 'mongodb';
import { connectToDatabase } from '../db';
import { ETLResult } from '../types';

export class DataLoader {
  static async loadProducts(db: Db, products: any[]): Promise<ETLResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;

    try {
      const collection = db.collection('products');
      
      for (const product of products) {
        try {
          const result = await collection.updateOne(
            { productId: product.productId },
            { $set: product },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) {
            inserted++;
          } else if (result.modifiedCount > 0) {
            updated++;
          }
        } catch (error) {
          errors.push(`Error procesando producto ${product.productId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        recordsProcessed: products.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: products.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      };
    }
  }

  static async loadCustomers(db: Db, customers: any[]): Promise<ETLResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;

    try {
      const collection = db.collection('customers');
      
      for (const customer of customers) {
        try {
          const result = await collection.updateOne(
            { customerId: customer.customerId },
            { $set: customer },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) {
            inserted++;
          } else if (result.modifiedCount > 0) {
            updated++;
          }
        } catch (error) {
          errors.push(`Error procesando cliente ${customer.customerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        recordsProcessed: customers.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: customers.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      };
    }
  }

  static async loadOrders(db: Db, orders: any[]): Promise<ETLResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;

    try {
      const collection = db.collection('orders');
      
      for (const order of orders) {
        try {
          const result = await collection.updateOne(
            { orderId: order.orderId },
            { $set: order },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) {
            inserted++;
          } else if (result.modifiedCount > 0) {
            updated++;
          }
        } catch (error) {
          errors.push(`Error procesando orden ${order.orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        recordsProcessed: orders.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: orders.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      };
    }
  }

  static async loadSalesReports(db: Db, reports: any[]): Promise<ETLResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;

    try {
      const collection = db.collection('salesReports');
      
      for (const report of reports) {
        try {
          const result = await collection.updateOne(
            { reportDate: report.reportDate, analyst: report.analyst },
            { $set: report },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) {
            inserted++;
          } else if (result.modifiedCount > 0) {
            updated++;
          }
        } catch (error) {
          errors.push(`Error procesando reporte: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        recordsProcessed: reports.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: reports.length,
        recordsInserted: inserted,
        recordsUpdated: updated,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      };
    }
  }

  static async loadMetadata(db: Db, metadata: any): Promise<ETLResult> {
    const startTime = Date.now();
    
    try {
      const collection = db.collection('metadata');
      await collection.updateOne(
        { source: metadata.source },
        { $set: metadata },
        { upsert: true }
      );

      return {
        success: true,
        recordsProcessed: 1,
        recordsInserted: 1,
        recordsUpdated: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 1,
        recordsInserted: 0,
        recordsUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      };
    }
  }
}
