'use client';

import { useState, useEffect } from 'react';

export default function MongoDBStatus() {
  const [status, setStatus] = useState<{
    success: boolean;
    message?: string;
    database?: string;
    collections?: string[];
    documentCounts?: Record<string, number>;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="loading">Verificando conexión a MongoDB...</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, color: '#2d3748' }}>Estado de MongoDB</h3>
        <button className="button" onClick={checkConnection} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          🔄 Actualizar
        </button>
      </div>
      
      {status?.success ? (
        <div>
          <div className="success" style={{ marginBottom: '1rem' }}>
            ✅ {status.message || 'Conexión exitosa'}
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <strong>Base de datos:</strong> {status.database || 'N/A'}
            </div>
            {status.collections && status.collections.length > 0 && (
              <div>
                <strong>Colecciones:</strong> {status.collections.length}
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                  {status.collections.map((coll) => (
                    <li key={coll}>
                      {coll}
                      {status.documentCounts && status.documentCounts[coll] !== undefined && (
                        <span style={{ color: '#718096', marginLeft: '0.5rem' }}>
                          ({status.documentCounts[coll]} documentos)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(!status.collections || status.collections.length === 0) && (
              <div style={{ color: '#718096', fontStyle: 'italic' }}>
                No hay colecciones aún. Ejecuta los procesos ETL para crear datos.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="error">
          ❌ {status?.error || 'Error conectando a MongoDB'}
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Asegúrate de que MongoDB esté corriendo en <code>localhost:27017</code>
          </div>
        </div>
      )}
    </div>
  );
}
