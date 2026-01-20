import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Data Warehouse ETL System',
  description: 'Sistema de Data Warehouse con proceso ETL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
