// Orquestador del proceso ETL completo
import path from 'path';
import { Db } from 'mongodb';
import { connectToDatabase } from '../db';
import { DataExtractor } from './extractors';
import { DataTransformer } from './transformers';
import { DataLoader } from './loader';
import { ETLProcess, ETLResult, DataMapping } from '../types';

export class ETLOrchestrator {
  private static readonly DATA_DIR = path.join(process.cwd(), 'data', 'sources');

  static async executeETL(process: ETLProcess): Promise<ETLResult> {
    const db = await connectToDatabase();
    const sourcePath = path.join(this.DATA_DIR, process.sourcePath);
    
    try {
      let extractedData: any;
      let transformedData: any[] = [];
      
      // EXTRACT
      switch (process.sourceType) {
        case 'csv':
          extractedData = await DataExtractor.extractCSV(sourcePath);
          transformedData = DataTransformer.transformCSVToProducts(extractedData, process.name);
          break;
        case 'json':
          extractedData = await DataExtractor.extractJSON(sourcePath);
          if (process.targetCollection === 'customers') {
            transformedData = DataTransformer.transformJSONToCustomers(extractedData, process.name);
          }
          break;
        case 'xml':
          extractedData = await DataExtractor.extractXML(sourcePath);
          transformedData = DataTransformer.transformXMLToOrders(extractedData, process.name);
          break;
        case 'txt':
          extractedData = await DataExtractor.extractText(sourcePath);
          transformedData = [DataTransformer.transformTextToSalesReport(extractedData, process.name)];
          break;
        case 'metadata':
          extractedData = await DataExtractor.extractMetadata(sourcePath);
          transformedData = [extractedData];
          break;
      }

      // Aplicar mapping si existe
      if (process.mappings && process.mappings.length > 0) {
        transformedData = DataTransformer.applyMapping(transformedData, process.mappings);
      }

      // LOAD
      let result: ETLResult;
      switch (process.targetCollection) {
        case 'products':
          result = await DataLoader.loadProducts(db, transformedData);
          break;
        case 'customers':
          result = await DataLoader.loadCustomers(db, transformedData);
          break;
        case 'orders':
          result = await DataLoader.loadOrders(db, transformedData);
          break;
        case 'salesReports':
          result = await DataLoader.loadSalesReports(db, transformedData);
          break;
        case 'metadata':
          result = await DataLoader.loadMetadata(db, transformedData[0]);
          break;
        default:
          throw new Error(`Colección objetivo desconocida: ${process.targetCollection}`);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: 0,
      };
    }
  }

  static getDefaultMappings(): Record<string, DataMapping[]> {
    return {
      products: [
        { sourceField: 'id', targetField: 'productId', dataType: 'string', required: true },
        { sourceField: 'product_name', targetField: 'name', dataType: 'string', required: true },
        { sourceField: 'category', targetField: 'category', dataType: 'string', required: true },
        { sourceField: 'price', targetField: 'price', dataType: 'number', required: true },
        { sourceField: 'quantity', targetField: 'quantity', dataType: 'integer', required: true },
        { sourceField: 'created_at', targetField: 'createdAt', dataType: 'date', transformation: 'parseDate', required: true },
      ],
      customers: [
        { sourceField: 'customerId', targetField: 'customerId', dataType: 'string', required: true },
        { sourceField: 'name', targetField: 'name', dataType: 'string', required: true },
        { sourceField: 'email', targetField: 'email', dataType: 'string', required: true },
        { sourceField: 'phone', targetField: 'phone', dataType: 'string', required: false },
        { sourceField: 'address.city', targetField: 'city', dataType: 'string', required: false },
        { sourceField: 'address.country', targetField: 'country', dataType: 'string', required: false },
        { sourceField: 'registrationDate', targetField: 'registrationDate', dataType: 'date', transformation: 'parseDate', required: true },
        { sourceField: 'preferences.newsletter', targetField: 'newsletter', dataType: 'boolean', required: false },
        { sourceField: 'preferences.language', targetField: 'language', dataType: 'string', required: false },
      ],
    };
  }
}
