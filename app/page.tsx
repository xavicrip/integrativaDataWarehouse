'use client';

import { useState, useEffect } from 'react';
import ETLProcessPanel from '@/components/ETLProcessPanel';
import DataViewer from '@/components/DataViewer';
import StatsPanel from '@/components/StatsPanel';
import MongoDBStatus from '@/components/MongoDBStatus';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'etl' | 'data' | 'stats'>('etl');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleETLComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Data Warehouse ETL System
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
          Sistema de Extracción, Transformación y Carga de Datos
        </p>
      </header>

      <MongoDBStatus />

      <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className={`button ${activeTab === 'etl' ? 'button-success' : ''}`}
          onClick={() => setActiveTab('etl')}
        >
          Proceso ETL
        </button>
        <button
          className={`button ${activeTab === 'data' ? 'button-success' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Visualizar Datos
        </button>
        <button
          className={`button ${activeTab === 'stats' ? 'button-success' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
      </nav>

      {activeTab === 'etl' && <ETLProcessPanel onComplete={handleETLComplete} />}
      {activeTab === 'data' && <DataViewer key={refreshKey} />}
      {activeTab === 'stats' && <StatsPanel key={refreshKey} />}
    </div>
  );
}
