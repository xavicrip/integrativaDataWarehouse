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

    return (
      <table className="table">
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              {keys.map((key) => (
                <td key={key}>
                  {typeof item[key] === 'object' 
                    ? JSON.stringify(item[key])
                    : String(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
