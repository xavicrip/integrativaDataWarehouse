'use client';

import { useState, useEffect } from 'react';

type DataType = 'products' | 'customers' | 'orders' | 'reports';

export default function DataViewer() {
  const [dataType, setDataType] = useState<DataType>('products');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [dataType]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/data/${dataType}`);
      if (!response.ok) throw new Error('Error cargando datos');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (data.length === 0) {
      return <p style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No hay datos disponibles</p>;
    }

    const keys = Object.keys(data[0]);

    const formatCellValue = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return String(value);
        }
      }
      return String(value);
    };

    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key} title={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                {keys.map((key) => {
                  const value = item[key];
                  const displayValue = formatCellValue(value);
                  const isLongValue = displayValue.length > 100;
                  
                  return (
                    <td 
                      key={key} 
                      title={isLongValue ? displayValue : undefined}
                      style={{ 
                        maxWidth: '300px',
                        wordBreak: 'break-word',
                        whiteSpace: isLongValue ? 'pre-wrap' : 'normal'
                      }}
                    >
                      {isLongValue ? (
                        <details>
                          <summary style={{ cursor: 'pointer', color: '#667eea' }}>
                            Ver contenido ({displayValue.length} caracteres)
                          </summary>
                          <pre style={{ 
                            marginTop: '0.5rem', 
                            padding: '0.5rem', 
                            background: '#f7fafc', 
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '200px',
                            fontSize: '0.875rem'
                          }}>
                            {displayValue}
                          </pre>
                        </details>
                      ) : (
                        displayValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Visualizador de Datos</h2>
        <div>
          {(['products', 'customers', 'orders', 'reports'] as DataType[]).map((type) => (
            <button
              key={type}
              className={`button ${dataType === type ? 'button-success' : ''}`}
              onClick={() => setDataType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading">Cargando datos...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#718096' }}>
            Mostrando {data.length} registros de {dataType}
          </p>
          {renderTable()}
        </div>
      )}
    </div>
  );
}
