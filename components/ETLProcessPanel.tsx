'use client';

import { useState } from 'react';

interface ETLProcessPanelProps {
  onComplete?: () => void;
}

interface ETLProcess {
  id: string;
  name: string;
  sourceType: 'csv' | 'json' | 'xml' | 'txt' | 'metadata';
  sourcePath: string;
  targetCollection: string;
  status?: string;
  recordsProcessed?: number;
  result?: {
    success: boolean;
    recordsInserted: number;
    recordsUpdated: number;
    errors: string[];
    duration: number;
  };
}

const ETL_PROCESSES: Omit<ETLProcess, 'id' | 'status' | 'recordsProcessed' | 'result'>[] = [
  {
    name: 'Importar Productos (CSV)',
    sourceType: 'csv',
    sourcePath: 'structured_data.csv',
    targetCollection: 'products',
  },
  {
    name: 'Importar Clientes (JSON)',
    sourceType: 'json',
    sourcePath: 'json_data.json',
    targetCollection: 'customers',
  },
  {
    name: 'Importar Órdenes (XML)',
    sourceType: 'xml',
    sourcePath: 'xml_data.xml',
    targetCollection: 'orders',
  },
  {
    name: 'Importar Reporte de Ventas (TXT)',
    sourceType: 'txt',
    sourcePath: 'unstructured_data.txt',
    targetCollection: 'salesReports',
  },
  {
    name: 'Importar Metadatos',
    sourceType: 'metadata',
    sourcePath: 'metadata.json',
    targetCollection: 'metadata',
  },
];

export default function ETLProcessPanel({ onComplete }: ETLProcessPanelProps) {
  const [processes, setProcesses] = useState<ETLProcess[]>(ETL_PROCESSES.map(p => ({ ...p, id: `process-${Date.now()}-${Math.random()}` })));
  const [runningProcess, setRunningProcess] = useState<string | null>(null);

  const executeETL = async (process: ETLProcess) => {
    setRunningProcess(process.id);
    
    try {
      const response = await fetch('/api/etl/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(process),
      });

      const result = await response.json();
      
      setProcesses(prev => prev.map(p => 
        p.id === process.id 
          ? { ...p, ...result }
          : p
      ));

      if (result.result?.success && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error ejecutando ETL:', error);
      setProcesses(prev => prev.map(p => 
        p.id === process.id 
          ? { 
              ...p, 
              status: 'failed',
              result: {
                success: false,
                recordsInserted: 0,
                recordsUpdated: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                duration: 0,
              }
            }
          : p
      ));
    } finally {
      setRunningProcess(null);
    }
  };

  const executeAll = async () => {
    for (const process of processes) {
      await executeETL(process);
    }
  };

  const getSourceTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      csv: 'badge-csv',
      json: 'badge-json',
      xml: 'badge-xml',
      txt: 'badge-txt',
      metadata: 'badge-metadata',
    };
    return badges[type] || '';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Procesos ETL</h2>
        <button 
          className="button button-success" 
          onClick={executeAll}
          disabled={runningProcess !== null}
        >
          Ejecutar Todos
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {processes.map((process) => (
          <div 
            key={process.id} 
            style={{ 
              border: '2px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '1rem',
              background: process.status === 'completed' ? '#f0fff4' : 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>{process.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`source-type-badge ${getSourceTypeBadge(process.sourceType)}`}>
                    {process.sourceType.toUpperCase()}
                  </span>
                  <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                    → {process.targetCollection}
                  </span>
                  {process.status && (
                    <span className={`status-badge status-${process.status}`}>
                      {process.status}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="button"
                onClick={() => executeETL(process)}
                disabled={runningProcess !== null}
              >
                {runningProcess === process.id ? 'Ejecutando...' : 'Ejecutar'}
              </button>
            </div>

            {process.result && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>Registros Procesados:</strong> {process.recordsProcessed || 0}
                  </div>
                  <div>
                    <strong>Insertados:</strong> {process.result.recordsInserted}
                  </div>
                  <div>
                    <strong>Actualizados:</strong> {process.result.recordsUpdated}
                  </div>
                  <div>
                    <strong>Duración:</strong> {process.result.duration}ms
                  </div>
                </div>
                {process.result.errors.length > 0 && (
                  <div className="error">
                    <strong>Errores:</strong>
                    <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                      {process.result.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {process.result.success && process.result.errors.length === 0 && (
                  <div className="success">
                    ✓ Proceso completado exitosamente
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
