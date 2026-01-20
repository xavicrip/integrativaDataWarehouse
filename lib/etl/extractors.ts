// Extractores de datos para diferentes fuentes
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { parseStringPromise } from 'xml2js';
import { Product, Customer, Order, SalesReport, Metadata } from '../types';

export class DataExtractor {
  static async extractCSV(filePath: string): Promise<any[]> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });
      return records;
    } catch (error) {
      throw new Error(`Error extrayendo CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractJSON(filePath: string): Promise<any> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Error extrayendo JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractXML(filePath: string): Promise<any> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const result = await parseStringPromise(fileContent);
      return result;
    } catch (error) {
      throw new Error(`Error extrayendo XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractText(filePath: string): Promise<string> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return fileContent;
    } catch (error) {
      throw new Error(`Error extrayendo texto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractMetadata(filePath: string): Promise<Metadata> {
    try {
      const metadata = await this.extractJSON(filePath);
      return {
        ...metadata,
        lastUpdated: new Date(metadata.lastUpdated),
      };
    } catch (error) {
      throw new Error(`Error extrayendo metadatos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
