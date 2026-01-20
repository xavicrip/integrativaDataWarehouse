# Data Warehouse ETL System

Sistema completo de Data Warehouse con proceso ETL (Extract, Transform, Load) que maneja múltiples tipos de fuentes de datos.

## Características

- **Múltiples fuentes de datos:**
  - Datos estructurados (CSV)
  - Datos JSON
  - Datos XML
  - Datos no estructurados (texto plano)
  - Metadatos

- **Proceso ETL completo:**
  - **Extract:** Extracción de datos de diferentes fuentes
  - **Transform:** Transformación y normalización de datos
  - **Load:** Carga de datos a MongoDB

- **Sistema de Mapping:**
  - Mapeo de campos entre fuentes y destino
  - Transformaciones de datos personalizadas
  - Validación de tipos de datos

- **Interfaz web:**
  - Panel de control para ejecutar procesos ETL
  - Visualizador de datos
  - Panel de estadísticas

## Requisitos

- Node.js 18+ 
- MongoDB (local o remoto)
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crear un archivo `.env.local` con:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=datawarehouse
```

3. Asegurarse de que MongoDB esté corriendo localmente en el puerto 27017

## Uso

1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

2. Abrir el navegador en `http://localhost:3000`

3. (Opcional) Inicializar la base de datos y crear índices:
   - Hacer una petición POST a `http://localhost:3000/api/init`
   - O los índices se crearán automáticamente la primera vez que se ejecute un proceso ETL

4. Ejecutar los procesos ETL desde la interfaz web:
   - Cada proceso puede ejecutarse individualmente
   - O ejecutar todos los procesos a la vez usando el botón "Ejecutar Todos"

## Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── etl/          # Endpoints ETL
│   │   └── data/         # Endpoints de datos
│   ├── page.tsx          # Página principal
│   └── layout.tsx        # Layout principal
├── components/            # Componentes React
│   ├── ETLProcessPanel.tsx
│   ├── DataViewer.tsx
│   └── StatsPanel.tsx
├── lib/                   # Lógica de negocio
│   ├── db.ts             # Conexión MongoDB
│   ├── types.ts          # Tipos TypeScript
│   └── etl/              # Módulos ETL
│       ├── extractors.ts # Extractores
│       ├── transformers.ts # Transformadores
│       ├── loader.ts     # Cargadores
│       └── orchestrator.ts # Orquestador
└── data/                  # Fuentes de datos
    └── sources/          # Archivos de datos de ejemplo
```

## Fuentes de Datos

El sistema incluye ejemplos de diferentes tipos de fuentes:

1. **structured_data.csv** - Productos en formato CSV
2. **json_data.json** - Clientes en formato JSON
3. **xml_data.xml** - Órdenes en formato XML
4. **unstructured_data.txt** - Reporte de ventas en texto plano
5. **metadata.json** - Metadatos del esquema de datos

## Proceso ETL

### Extract (Extracción)
- CSV: Usa `csv-parse` para parsear archivos CSV
- JSON: Parseo nativo de JSON
- XML: Usa `xml2js` para parsear XML
- TXT: Lectura de texto plano con procesamiento de expresiones regulares
- Metadata: Parseo de JSON con conversión de fechas

### Transform (Transformación)
- Normalización de datos
- Conversión de tipos
- Aplicación de mappings personalizados
- Validación de datos requeridos

### Load (Carga)
- Upsert a MongoDB (inserta o actualiza)
- Manejo de errores por registro
- Índices para optimización de consultas

## Mapping de Datos

El sistema permite definir mappings entre campos de origen y destino:

```typescript
{
  sourceField: 'id',
  targetField: 'productId',
  dataType: 'string',
  required: true,
  transformation: 'uppercase' // opcional
}
```

Transformaciones disponibles:
- `uppercase`, `lowercase`, `trim`
- `parseFloat`, `parseInt`
- `parseDate`, `formatDate`

## API Endpoints

### ETL
- `POST /api/etl/run` - Ejecutar proceso ETL
- `GET /api/etl/mappings` - Obtener mappings por defecto

### Datos
- `GET /api/data/products` - Obtener productos
- `GET /api/data/customers` - Obtener clientes
- `GET /api/data/orders` - Obtener órdenes
- `GET /api/data/reports` - Obtener reportes
- `GET /api/data/stats` - Obtener estadísticas

## Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **MongoDB** - Base de datos NoSQL
- **React 19** - Biblioteca UI
- **csv-parse** - Parser CSV
- **xml2js** - Parser XML
- **date-fns** - Manejo de fechas

## Desarrollo

Ejecutar linter:
```bash
npm run lint
```

Compilar para producción:
```bash
npm run build
```

## Licencia

Este proyecto es un ejemplo educativo de un sistema Data Warehouse ETL.
