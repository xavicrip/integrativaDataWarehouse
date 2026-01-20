'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Stats {
  products: number;
  customers: number;
  orders: number;
  reports: number;
  totalRevenue: number;
}

interface ChartData {
  productsByCategory: Array<{ category: string; count: number; totalQuantity: number }>;
  salesByProduct: Array<{ product: string; quantity: number; revenue: number }>;
  salesByDate: Array<{ date: string; count: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  customersByCity: Array<{ city: string; count: number }>;
  revenueByCategory: Array<{ category: string; revenue: number; orderCount: number }>;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'];

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadChartData();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/data/stats');
      if (!response.ok) throw new Error('Error cargando estadísticas');
      const result = await response.json();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const loadChartData = async () => {
    try {
      const response = await fetch('/api/data/charts');
      if (!response.ok) throw new Error('Error cargando datos de gráficos');
      const result = await response.json();
      setChartData(result);
    } catch (err) {
      console.error('Error cargando datos de gráficos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Tarjetas de resumen */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.products || 0}</div>
          <div className="stat-label">Productos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.customers || 0}</div>
          <div className="stat-label">Clientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.orders || 0}</div>
          <div className="stat-label">Órdenes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.reports || 0}</div>
          <div className="stat-label">Reportes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${(stats?.totalRevenue || 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
      </div>

      {/* Gráficos */}
      {chartData && (
        <>
          {/* Gráfico de productos por categoría */}
          {chartData.productsByCategory.length > 0 && (
            <div className="card">
              <h2>Productos por Categoría</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.productsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#667eea" name="Cantidad de Productos" />
                  <Bar dataKey="totalQuantity" fill="#764ba2" name="Cantidad en Inventario" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de ingresos por categoría */}
          {chartData.revenueByCategory.length > 0 && (
            <div className="card">
              <h2>Ingresos por Categoría</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.revenueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="category"
                  >
                    {chartData.revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-EC', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de ventas por producto */}
          {chartData.salesByProduct.length > 0 && (
            <div className="card">
              <h2>Top 10 Productos por Ingresos</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.salesByProduct} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="product" type="category" width={150} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-EC', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#43e97b" name="Ingresos ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de ventas por fecha */}
          {chartData.salesByDate.length > 0 && (
            <div className="card">
              <h2>Ventas por Fecha</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-EC', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4facfe" strokeWidth={2} name="Ingresos ($)" />
                  <Line type="monotone" dataKey="count" stroke="#fa709a" strokeWidth={2} name="Número de Órdenes" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de órdenes por estado */}
          {chartData.ordersByStatus.length > 0 && (
            <div className="card">
              <h2>Órdenes por Estado</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {chartData.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de clientes por ciudad */}
          {chartData.customersByCity.length > 0 && (
            <div className="card">
              <h2>Top 10 Ciudades por Número de Clientes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.customersByCity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#30cfd0" name="Número de Clientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Resumen textual */}
      <div className="card">
        <h2>Resumen del Data Warehouse</h2>
        <p style={{ marginTop: '1rem', color: '#718096', lineHeight: '1.6' }}>
          El sistema de Data Warehouse ha procesado exitosamente datos de múltiples fuentes:
        </p>
        <ul style={{ marginTop: '1rem', marginLeft: '2rem', color: '#4a5568', lineHeight: '1.8' }}>
          <li><strong>Datos estructurados (CSV):</strong> Productos con información completa de inventario</li>
          <li><strong>Datos JSON:</strong> Información de clientes con preferencias y direcciones</li>
          <li><strong>Datos XML:</strong> Órdenes de compra con detalles de items</li>
          <li><strong>Datos no estructurados (TXT):</strong> Reportes de ventas con análisis textual</li>
          <li><strong>Metadatos:</strong> Esquemas y calidad de datos del sistema fuente</li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#718096', lineHeight: '1.6' }}>
          Todos los datos han sido transformados y mapeados al modelo unificado del Data Warehouse,
          permitiendo análisis integrado y reportes consolidados con visualizaciones estadísticas avanzadas.
        </p>
      </div>
    </div>
  );
}
