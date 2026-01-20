'use client';

import { useState } from 'react';

interface ResetETLButtonProps {
  onReset?: () => void;
}

export default function ResetETLButton({ onReset }: ResetETLButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    deletedCounts?: Record<string, number>;
    error?: string;
  } | null>(null);

  const handleReset = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/etl/reset', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          deletedCounts: data.deletedCounts,
        });
        setShowConfirm(false);
        if (onReset) {
          onReset();
        }
      } else {
        setResult({
          success: false,
          error: data.error || 'Error desconocido',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setResult(null);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {!showConfirm ? (
        <button
          className="button button-danger"
          onClick={handleReset}
          disabled={loading}
        >
          🗑️ Resetear ETL
        </button>
      ) : (
        <div style={{ 
          background: '#fff3cd', 
          border: '2px solid #ffc107', 
          borderRadius: '8px', 
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontWeight: 600, color: '#856404' }}>
            ⚠️ ¿Estás seguro de que quieres resetear el proceso ETL?
          </div>
          <div style={{ color: '#856404', fontSize: '0.875rem' }}>
            Esta acción eliminará TODOS los datos de las siguientes colecciones:
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>products</li>
              <li>customers</li>
              <li>orders</li>
              <li>salesReports</li>
              <li>metadata</li>
            </ul>
            Esta acción NO se puede deshacer.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="button button-danger"
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? 'Reseteando...' : 'Sí, Resetear'}
            </button>
            <button
              className="button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem' }}>
          {result.success ? (
            <div className="success">
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                ✅ {result.message}
              </div>
              {result.deletedCounts && (
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  <strong>Documentos eliminados:</strong>
                  <ul style={{ marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                    {Object.entries(result.deletedCounts).map(([collection, count]) => (
                      <li key={collection}>
                        {collection}: {count} documentos
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="error">
              ❌ Error: {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
