// Transformadores de datos con mapping
import { Product, Customer, Order, SalesReport, ProductSale, DataMapping } from '../types';
import { format, parseISO } from 'date-fns';

export class DataTransformer {
  // Transformar datos CSV estructurados a modelo de Product
  static transformCSVToProducts(csvData: any[], source: string): Product[] {
    return csvData.map((row) => ({
      productId: row.id.toString(),
      name: row.product_name,
      category: row.category,
      price: parseFloat(row.price),
      quantity: parseInt(row.quantity, 10),
      createdAt: parseISO(row.created_at),
      source,
    }));
  }

  // Transformar datos JSON a modelo de Customer
  static transformJSONToCustomers(jsonData: any, source: string): Customer[] {
    if (!jsonData.customers || !Array.isArray(jsonData.customers)) {
      return [];
    }

    return jsonData.customers.map((customer: any) => ({
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.address?.city || '',
      country: customer.address?.country || '',
      registrationDate: parseISO(customer.registrationDate),
      newsletter: customer.preferences?.newsletter || false,
      language: customer.preferences?.language || 'es',
      source,
    }));
  }

  // Transformar datos XML a modelo de Order
  static transformXMLToOrders(xmlData: any, source: string): Order[] {
    if (!xmlData.orders || !xmlData.orders.order) {
      return [];
    }

    const orders = Array.isArray(xmlData.orders.order) 
      ? xmlData.orders.order 
      : [xmlData.orders.order];

    return orders.map((order: any) => {
      const items = Array.isArray(order.items[0].item)
        ? order.items[0].item
        : [order.items[0].item];

      return {
        orderId: order.orderId[0],
        customerId: order.customerId[0],
        orderDate: parseISO(order.orderDate[0]),
        items: items.map((item: any) => ({
          productId: item.productId[0],
          productName: item.productName[0],
          quantity: parseInt(item.quantity[0], 10),
          unitPrice: parseFloat(item.unitPrice[0]),
          total: parseFloat(item.total[0]),
        })),
        totalAmount: parseFloat(order.totalAmount[0]),
        status: order.status[0],
        source,
      };
    });
  }

  // Transformar texto no estructurado a modelo de SalesReport
  static transformTextToSalesReport(textData: string, source: string): SalesReport {
    const lines = textData.split('\n');
    
    // Extraer fecha del reporte
    const dateMatch = textData.match(/Fecha:\s*(\d{4}-\d{2}-\d{2})/);
    const reportDate = dateMatch ? parseISO(dateMatch[1]) : new Date();
    
    // Extraer analista
    const analystMatch = textData.match(/Analista:\s*(.+)/);
    const analyst = analystMatch ? analystMatch[1].trim() : 'Unknown';
    
    // Extraer total general
    const totalMatch = textData.match(/TOTAL GENERAL:\s*\$?([\d,]+\.?\d*)/);
    const totalSales = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0;
    
    // Extraer ventas de productos
    const productSales: ProductSale[] = [];
    const productLines = textData.match(/- (.+): (\d+) unidades, \$([\d,]+\.?\d*)/g);
    if (productLines) {
      productLines.forEach((line) => {
        const match = line.match(/- (.+): (\d+) unidades, \$([\d,]+\.?\d*)/);
        if (match) {
          productSales.push({
            productName: match[1].trim(),
            quantity: parseInt(match[2], 10),
            revenue: parseFloat(match[3].replace(/,/g, '')),
          });
        }
      });
    }
    
    // Extraer observaciones
    const observationsMatch = textData.match(/OBSERVACIONES:\s*([\s\S]*?)(?=RECOMENDACIONES:|$)/);
    const observations = observationsMatch ? observationsMatch[1].trim() : '';
    
    // Extraer recomendaciones
    const recommendations: string[] = [];
    const recommendationsMatch = textData.match(/RECOMENDACIONES:\s*([\s\S]*?)$/);
    if (recommendationsMatch) {
      const recLines = recommendationsMatch[1].match(/\d+\.\s*(.+)/g);
      if (recLines) {
        recLines.forEach((line) => {
          const match = line.match(/\d+\.\s*(.+)/);
          if (match) {
            recommendations.push(match[1].trim());
          }
        });
      }
    }
    
    return {
      reportDate,
      analyst,
      totalSales,
      productSales,
      observations,
      recommendations,
      source,
    };
  }

  // Aplicar mapping personalizado usando configuración de DataMapping
  static applyMapping(data: any[], mappings: DataMapping[]): any[] {
    return data.map((record) => {
      const mappedRecord: any = {};
      
      mappings.forEach((mapping) => {
        const sourceValue = this.getNestedValue(record, mapping.sourceField);
        
        if (sourceValue !== undefined && sourceValue !== null) {
          let transformedValue = sourceValue;
          
          // Aplicar transformación si existe
          if (mapping.transformation) {
            transformedValue = this.applyTransformation(sourceValue, mapping.transformation, mapping.dataType);
          }
          
          // Convertir tipo de dato
          transformedValue = this.convertDataType(transformedValue, mapping.dataType);
          
          mappedRecord[mapping.targetField] = transformedValue;
        } else if (mapping.required) {
          throw new Error(`Campo requerido faltante: ${mapping.sourceField}`);
        }
      });
      
      return mappedRecord;
    });
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private static applyTransformation(value: any, transformation: string, dataType: string): any {
    switch (transformation) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      case 'parseFloat':
        return parseFloat(String(value));
      case 'parseInt':
        return parseInt(String(value), 10);
      case 'parseDate':
        return parseISO(String(value));
      case 'formatDate':
        return format(parseISO(String(value)), 'yyyy-MM-dd');
      default:
        return value;
    }
  }

  private static convertDataType(value: any, dataType: string): any {
    switch (dataType) {
      case 'string':
        return String(value);
      case 'number':
        return parseFloat(String(value));
      case 'integer':
        return parseInt(String(value), 10);
      case 'boolean':
        return Boolean(value);
      case 'date':
        return value instanceof Date ? value : parseISO(String(value));
      default:
        return value;
    }
  }
}
