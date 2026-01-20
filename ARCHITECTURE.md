# Arquitectura del Data Warehouse ETL

## Descripción General

Este documento describe la arquitectura completa del sistema de Data Warehouse con proceso ETL (Extract, Transform, Load) que procesa múltiples tipos de fuentes de datos y los carga en MongoDB.

## Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Fuentes de Datos"
        CSV[CSV<br/>Datos Estructurados]
        JSON[JSON<br/>Datos Semi-estructurados]
        XML[XML<br/>Datos Jerárquicos]
        TXT[TXT<br/>Datos No Estructurados]
        META[Metadata<br/>Esquemas y Calidad]
    end

    subgraph "Capa de Extracción (Extract)"
        EXTRACT[DataExtractor<br/>- extractCSV<br/>- extractJSON<br/>- extractXML<br/>- extractText<br/>- extractMetadata]
    end

    subgraph "Capa de Transformación (Transform)"
        TRANSFORM[DataTransformer<br/>- Normalización<br/>- Type Conversion<br/>- Mapping<br/>- Validación]
    end

    subgraph "Capa de Carga (Load)"
        LOAD[DataLoader<br/>- loadProducts<br/>- loadCustomers<br/>- loadOrders<br/>- loadSalesReports<br/>- loadMetadata]
    end

    subgraph "Orquestador ETL"
        ORCHESTRATOR[ETLOrchestrator<br/>Coordina Extract → Transform → Load]
    end

    subgraph "Data Warehouse"
        MONGODB[(MongoDB<br/>Collections:<br/>- products<br/>- customers<br/>- orders<br/>- salesReports<br/>- metadata)]
    end

    subgraph "Capa de Presentación"
        API[API Routes<br/>REST Endpoints]
        UI[Frontend<br/>React Components]
    end

    CSV --> EXTRACT
    JSON --> EXTRACT
    XML --> EXTRACT
    TXT --> EXTRACT
    META --> EXTRACT

    EXTRACT --> ORCHESTRATOR
    ORCHESTRATOR --> TRANSFORM
    TRANSFORM --> ORCHESTRATOR
    ORCHESTRATOR --> LOAD
    LOAD --> MONGODB

    MONGODB --> API
    API --> UI
```

## Proceso ETL Detallado

### Flujo General del Proceso ETL

```mermaid
sequenceDiagram
    participant User as Usuario/API
    participant Orchestrator as ETLOrchestrator
    participant Extractor as DataExtractor
    participant Transformer as DataTransformer
    participant Loader as DataLoader
    participant MongoDB as MongoDB

    User->>Orchestrator: Ejecutar Proceso ETL
    activate Orchestrator
    
    Note over Orchestrator: Fase 1: EXTRACT
    Orchestrator->>Extractor: Extraer datos según tipo
    activate Extractor
    Extractor->>Extractor: Leer archivo fuente
    Extractor->>Extractor: Parsear según formato
    Extractor-->>Orchestrator: Datos extraídos (raw)
    deactivate Extractor
    
    Note over Orchestrator: Fase 2: TRANSFORM
    Orchestrator->>Transformer: Transformar datos
    activate Transformer
    Transformer->>Transformer: Normalizar estructura
    Transformer->>Transformer: Convertir tipos de datos
    Transformer->>Transformer: Aplicar mappings
    Transformer->>Transformer: Validar datos
    Transformer-->>Orchestrator: Datos transformados
    deactivate Transformer
    
    Note over Orchestrator: Fase 3: LOAD
    Orchestrator->>Loader: Cargar a MongoDB
    activate Loader
    Loop Para cada registro
        Loader->>MongoDB: Upsert (insert/update)
        MongoDB-->>Loader: Resultado
    end
    Loader-->>Orchestrator: Resultado ETL
    deactivate Loader
    
    Orchestrator-->>User: Resultado completo
    deactivate Orchestrator
```

## Componentes del Sistema

### 1. Capa de Extracción (Extract)

La capa de extracción es responsable de leer y parsear datos de diferentes fuentes.

```mermaid
classDiagram
    class DataExtractor {
        +extractCSV(filePath: string): Promise~any[]~
        +extractJSON(filePath: string): Promise~any~
        +extractXML(filePath: string): Promise~any~
        +extractText(filePath: string): Promise~string~
        +extractMetadata(filePath: string): Promise~Metadata~
    }

    class CSVExtractor {
        -parseCSV(content: string): any[]
    }

    class JSONExtractor {
        -parseJSON(content: string): any
    }

    class XMLExtractor {
        -parseXML(content: string): any
    }

    class TextExtractor {
        -readText(content: string): string
    }

    DataExtractor <|-- CSVExtractor
    DataExtractor <|-- JSONExtractor
    DataExtractor <|-- XMLExtractor
    DataExtractor <|-- TextExtractor
```

#### Tipos de Fuentes de Datos

1. **CSV (Datos Estructurados)**
   - Formato: Filas y columnas delimitadas por comas
   - Parser: `csv-parse`
   - Ejemplo: `structured_data.csv` → Productos

2. **JSON (Datos Semi-estructurados)**
   - Formato: Objetos JavaScript anidados
   - Parser: `JSON.parse()`
   - Ejemplo: `json_data.json` → Clientes

3. **XML (Datos Jerárquicos)**
   - Formato: Estructura jerárquica con tags
   - Parser: `xml2js`
   - Ejemplo: `xml_data.xml` → Órdenes

4. **TXT (Datos No Estructurados)**
   - Formato: Texto plano con información semántica
   - Parser: Expresiones regulares
   - Ejemplo: `unstructured_data.txt` → Reportes de ventas

5. **Metadata (Metadatos)**
   - Formato: JSON con información del esquema
   - Parser: `JSON.parse()` con conversión de fechas
   - Ejemplo: `metadata.json` → Esquemas y calidad

### 2. Capa de Transformación (Transform)

La capa de transformación normaliza y convierte los datos al modelo unificado del Data Warehouse.

```mermaid
flowchart TD
    START[Inicio Transformación] --> CHECK{¿Tipo de Fuente?}
    
    CHECK -->|CSV| CSV_TRANS[transformCSVToProducts<br/>- Mapear campos<br/>- Convertir tipos<br/>- Parsear fechas]
    CHECK -->|JSON| JSON_TRANS[transformJSONToCustomers<br/>- Extraer objetos anidados<br/>- Normalizar estructura<br/>- Convertir tipos]
    CHECK -->|XML| XML_TRANS[transformXMLToOrders<br/>- Desanidar estructura<br/>- Convertir arrays<br/>- Parsear valores]
    CHECK -->|TXT| TXT_TRANS[transformTextToSalesReport<br/>- Usar regex<br/>- Extraer métricas<br/>- Parsear texto]
    CHECK -->|Metadata| META_TRANS[transformMetadata<br/>- Validar estructura<br/>- Convertir fechas]
    
    CSV_TRANS --> MAPPING[Aplicar Mapping]
    JSON_TRANS --> MAPPING
    XML_TRANS --> MAPPING
    TXT_TRANS --> MAPPING
    META_TRANS --> MAPPING
    
    MAPPING --> VALIDATE[Validar Datos<br/>- Campos requeridos<br/>- Tipos de datos<br/>- Rangos válidos]
    
    VALIDATE -->|Error| ERROR[Retornar Error]
    VALIDATE -->|OK| END[Datos Transformados]
    
    ERROR --> END
```

#### Sistema de Mapping

El sistema de mapping permite definir cómo se transforman los campos desde las fuentes al modelo del Data Warehouse.

```mermaid
graph LR
    subgraph "Fuente"
        SF1[sourceField: 'id']
        SF2[sourceField: 'product_name']
        SF3[sourceField: 'price']
    end

    subgraph "Mapping"
        M1[sourceField: 'id'<br/>targetField: 'productId'<br/>dataType: 'string'<br/>transformation: null]
        M2[sourceField: 'product_name'<br/>targetField: 'name'<br/>dataType: 'string'<br/>transformation: 'trim']
        M3[sourceField: 'price'<br/>targetField: 'price'<br/>dataType: 'number'<br/>transformation: 'parseFloat']
    end

    subgraph "Destino"
        DF1[targetField: 'productId']
        DF2[targetField: 'name']
        DF3[targetField: 'price']
    end

    SF1 --> M1
    SF2 --> M2
    SF3 --> M3

    M1 --> DF1
    M2 --> DF2
    M3 --> DF3
```

#### Transformaciones Disponibles

| Transformación | Descripción | Ejemplo |
|---------------|-------------|---------|
| `uppercase` | Convierte a mayúsculas | "laptop" → "LAPTOP" |
| `lowercase` | Convierte a minúsculas | "LAPTOP" → "laptop" |
| `trim` | Elimina espacios | " laptop " → "laptop" |
| `parseFloat` | Convierte a número decimal | "1299.99" → 1299.99 |
| `parseInt` | Convierte a entero | "50" → 50 |
| `parseDate` | Convierte a fecha | "2024-01-15" → Date |
| `formatDate` | Formatea fecha | Date → "2024-01-15" |

### 3. Capa de Carga (Load)

La capa de carga inserta o actualiza los datos en MongoDB usando estrategia de upsert.

```mermaid
sequenceDiagram
    participant Loader as DataLoader
    participant MongoDB as MongoDB Collection
    participant Index as Índices MongoDB

    Loader->>MongoDB: Iniciar transacción de carga
    
    Loop Para cada registro transformado
        Loader->>MongoDB: Buscar por clave única
        MongoDB-->>Loader: ¿Existe?
        
        alt Registro existe
            Loader->>MongoDB: Update (actualizar)
            MongoDB-->>Loader: modifiedCount: 1
        else Registro no existe
            Loader->>MongoDB: Insert (insertar)
            MongoDB-->>Loader: upsertedCount: 1
        end
        
        alt Error en registro
            Loader->>Loader: Registrar error
            Loader->>Loader: Continuar con siguiente
        end
    end
    
    Loader->>Index: Verificar índices
    Index-->>Loader: Índices actualizados
    
    Loader->>Loader: Calcular estadísticas
    Loader-->>Loader: Retornar resultado ETL
```

#### Estrategia de Upsert

```mermaid
flowchart TD
    START[Registro Transformado] --> FIND{¿Existe en BD?}
    
    FIND -->|Sí| UPDATE[Actualizar Registro<br/>$set: nuevos datos]
    FIND -->|No| INSERT[Insertar Nuevo Registro]
    
    UPDATE --> RESULT[Registro Actualizado]
    INSERT --> RESULT[Registro Insertado]
    
    RESULT --> STATS[Actualizar Estadísticas<br/>- recordsInserted<br/>- recordsUpdated]
    
    STATS --> NEXT{¿Más registros?}
    NEXT -->|Sí| START
    NEXT -->|No| END[Proceso Completado]
```

## Modelo de Datos del Data Warehouse

### Esquema de Colecciones

```mermaid
erDiagram
    PRODUCTS ||--o{ ORDER_ITEMS : "contiene"
    CUSTOMERS ||--o{ ORDERS : "realiza"
    ORDERS ||--o{ ORDER_ITEMS : "incluye"
    PRODUCTS {
        string productId PK
        string name
        string category
        number price
        number quantity
        date createdAt
        string source
    }
    
    CUSTOMERS {
        string customerId PK
        string name
        string email
        string phone
        string city
        string country
        date registrationDate
        boolean newsletter
        string language
        string source
    }
    
    ORDERS {
        string orderId PK
        string customerId FK
        date orderDate
        number totalAmount
        string status
        string source
    }
    
    ORDER_ITEMS {
        string productId FK
        string productName
        number quantity
        number unitPrice
        number total
    }
    
    SALES_REPORTS {
        date reportDate PK
        string analyst
        number totalSales
        string observations
        array recommendations
        string source
    }
    
    METADATA {
        string source PK
        string version
        date lastUpdated
        object schema
        object dataQuality
        object lineage
    }
```

## Flujo Completo de un Proceso ETL

### Ejemplo: Procesamiento de CSV a Products

```mermaid
flowchart TD
    START[Inicio: Proceso ETL CSV] --> READ[Leer archivo CSV]
    
    READ --> PARSE[Parsear CSV con csv-parse<br/>Resultado: Array de objetos]
    
    PARSE --> TRANSFORM[Transformar cada fila:<br/>- id → productId<br/>- product_name → name<br/>- price → parseFloat<br/>- created_at → parseDate]
    
    TRANSFORM --> VALIDATE{¿Datos válidos?}
    
    VALIDATE -->|No| ERROR[Registrar error<br/>Continuar con siguiente]
    VALIDATE -->|Sí| MAP[Aplicar mapping personalizado]
    
    ERROR --> NEXT{¿Más registros?}
    MAP --> LOAD[Upsert a MongoDB<br/>Collection: products]
    
    LOAD --> CHECK{¿Upsert exitoso?}
    CHECK -->|Sí| COUNT[Incrementar contador]
    CHECK -->|No| ERROR
    
    COUNT --> NEXT
    NEXT -->|Sí| TRANSFORM
    NEXT -->|No| STATS[Calcular estadísticas finales]
    
    STATS --> RESULT[Retornar resultado ETL:<br/>- recordsProcessed<br/>- recordsInserted<br/>- recordsUpdated<br/>- errors<br/>- duration]
    
    RESULT --> END[Fin del Proceso]
```

## Arquitectura de la Aplicación

### Estructura de Capas

```mermaid
graph TB
    subgraph "Capa de Presentación"
        UI[React Components<br/>- ETLProcessPanel<br/>- DataViewer<br/>- StatsPanel<br/>- MongoDBStatus]
    end

    subgraph "Capa de API"
        API[Next.js API Routes<br/>- /api/etl/run<br/>- /api/etl/mappings<br/>- /api/data/*<br/>- /api/test-connection]
    end

    subgraph "Capa de Negocio"
        ETL[ETL Orchestrator<br/>Coordina el proceso completo]
        EXTRACT[Data Extractor<br/>Extrae datos de fuentes]
        TRANSFORM[Data Transformer<br/>Transforma y normaliza]
        LOAD[Data Loader<br/>Carga a MongoDB]
    end

    subgraph "Capa de Datos"
        DB[(MongoDB<br/>Data Warehouse)]
        FILES[Archivos Fuente<br/>CSV, JSON, XML, TXT]
    end

    UI --> API
    API --> ETL
    ETL --> EXTRACT
    ETL --> TRANSFORM
    ETL --> LOAD
    EXTRACT --> FILES
    LOAD --> DB
    API --> DB
```

## Patrones de Diseño Utilizados

### 1. Orquestador (Orchestrator Pattern)

El `ETLOrchestrator` coordina las tres fases del proceso ETL:

```mermaid
classDiagram
    class ETLOrchestrator {
        -DATA_DIR: string
        +executeETL(process: ETLProcess): Promise~ETLResult~
        +getDefaultMappings(): Record~string, DataMapping[]~
    }
    
    class DataExtractor {
        +extractCSV(): any[]
        +extractJSON(): any
        +extractXML(): any
        +extractText(): string
        +extractMetadata(): Metadata
    }
    
    class DataTransformer {
        +transformCSVToProducts(): Product[]
        +transformJSONToCustomers(): Customer[]
        +transformXMLToOrders(): Order[]
        +transformTextToSalesReport(): SalesReport
        +applyMapping(): any[]
    }
    
    class DataLoader {
        +loadProducts(): ETLResult
        +loadCustomers(): ETLResult
        +loadOrders(): ETLResult
        +loadSalesReports(): ETLResult
        +loadMetadata(): ETLResult
    }
    
    ETLOrchestrator --> DataExtractor
    ETLOrchestrator --> DataTransformer
    ETLOrchestrator --> DataLoader
```

### 2. Strategy Pattern (Extractores)

Cada tipo de fuente tiene su estrategia de extracción:

```mermaid
graph TD
    ORCHESTRATOR[ETLOrchestrator] --> CHECK{Tipo de Fuente}
    
    CHECK -->|csv| CSV_STRATEGY[CSV Extraction Strategy<br/>csv-parse]
    CHECK -->|json| JSON_STRATEGY[JSON Extraction Strategy<br/>JSON.parse]
    CHECK -->|xml| XML_STRATEGY[XML Extraction Strategy<br/>xml2js]
    CHECK -->|txt| TXT_STRATEGY[Text Extraction Strategy<br/>Regex parsing]
    CHECK -->|metadata| META_STRATEGY[Metadata Extraction Strategy<br/>JSON + date conversion]
    
    CSV_STRATEGY --> RESULT[Datos Extraídos]
    JSON_STRATEGY --> RESULT
    XML_STRATEGY --> RESULT
    TXT_STRATEGY --> RESULT
    META_STRATEGY --> RESULT
```

## Optimizaciones y Mejores Prácticas

### 1. Manejo de Errores

```mermaid
flowchart TD
    START[Procesar Registro] --> TRY{Intentar procesar}
    
    TRY -->|Éxito| SUCCESS[Registro procesado]
    TRY -->|Error| CATCH[Capturar error]
    
    CATCH --> LOG[Registrar error<br/>- Tipo<br/>- Mensaje<br/>- Registro]
    
    LOG --> CONTINUE[Continuar con siguiente<br/>No detener proceso]
    
    CONTINUE --> NEXT{¿Más registros?}
    NEXT -->|Sí| START
    NEXT -->|No| REPORT[Reportar errores<br/>en resultado final]
    
    SUCCESS --> NEXT
    REPORT --> END[Fin]
```

### 2. Índices de MongoDB

```mermaid
graph LR
    subgraph "Collection: products"
        P1[productId: unique index]
        P2[category: index]
    end
    
    subgraph "Collection: customers"
        C1[customerId: unique index]
        C2[email: index]
    end
    
    subgraph "Collection: orders"
        O1[orderId: unique index]
        O2[customerId: index]
        O3[orderDate: descending index]
    end
    
    subgraph "Collection: salesReports"
        S1[reportDate: descending index]
    end
```

## Flujo de Datos End-to-End

```mermaid
sequenceDiagram
    participant User as Usuario
    participant UI as Frontend
    participant API as API Route
    participant ETL as ETL Orchestrator
    participant Extractor as Extractor
    participant Transformer as Transformer
    participant Loader as Loader
    participant MongoDB as MongoDB

    User->>UI: Click "Ejecutar ETL"
    UI->>API: POST /api/etl/run
    API->>ETL: executeETL(process)
    
    Note over ETL: FASE 1: EXTRACT
    ETL->>Extractor: extractCSV/JSON/XML/TXT/Metadata
    Extractor->>Extractor: Leer archivo
    Extractor->>Extractor: Parsear contenido
    Extractor-->>ETL: Datos raw
    
    Note over ETL: FASE 2: TRANSFORM
    ETL->>Transformer: transformData(rawData)
    Transformer->>Transformer: Normalizar estructura
    Transformer->>Transformer: Aplicar mappings
    Transformer->>Transformer: Validar datos
    Transformer-->>ETL: Datos transformados
    
    Note over ETL: FASE 3: LOAD
    ETL->>Loader: loadData(transformedData)
    Loop Para cada registro
        Loader->>MongoDB: Upsert registro
        MongoDB-->>Loader: Resultado
    end
    Loader-->>ETL: ETLResult
    
    ETL-->>API: Resultado completo
    API-->>UI: JSON Response
    UI->>User: Mostrar resultado
```

## Consideraciones de Escalabilidad

### Procesamiento Paralelo (Futuro)

```mermaid
graph TD
    START[Inicio ETL] --> SPLIT[Dividir datos en chunks]
    
    SPLIT --> CHUNK1[Chunk 1]
    SPLIT --> CHUNK2[Chunk 2]
    SPLIT --> CHUNK3[Chunk 3]
    SPLIT --> CHUNKN[Chunk N]
    
    CHUNK1 --> PROCESS1[Procesar en paralelo]
    CHUNK2 --> PROCESS2[Procesar en paralelo]
    CHUNK3 --> PROCESS3[Procesar en paralelo]
    CHUNKN --> PROCESSN[Procesar en paralelo]
    
    PROCESS1 --> MERGE[Fusionar resultados]
    PROCESS2 --> MERGE
    PROCESS3 --> MERGE
    PROCESSN --> MERGE
    
    MERGE --> END[Resultado Final]
```

## Seguridad y Validación

### Validación de Datos

```mermaid
flowchart TD
    DATA[Dato Transformado] --> CHECK_REQUIRED{¿Campos requeridos?}
    CHECK_REQUIRED -->|Faltante| ERROR_REQUIRED[Error: Campo requerido]
    CHECK_REQUIRED -->|OK| CHECK_TYPE{¿Tipo correcto?}
    
    CHECK_TYPE -->|Incorrecto| ERROR_TYPE[Error: Tipo inválido]
    CHECK_TYPE -->|OK| CHECK_RANGE{¿Valor en rango?}
    
    CHECK_RANGE -->|Fuera de rango| ERROR_RANGE[Error: Valor inválido]
    CHECK_RANGE -->|OK| CHECK_FORMAT{¿Formato correcto?}
    
    CHECK_FORMAT -->|Incorrecto| ERROR_FORMAT[Error: Formato inválido]
    CHECK_FORMAT -->|OK| VALID[✓ Dato válido]
    
    ERROR_REQUIRED --> LOG[Registrar error]
    ERROR_TYPE --> LOG
    ERROR_RANGE --> LOG
    ERROR_FORMAT --> LOG
    
    VALID --> CONTINUE[Continuar procesamiento]
    LOG --> CONTINUE
```

## Conclusión

Esta arquitectura proporciona:

1. **Modularidad**: Cada fase del ETL está separada y es independiente
2. **Extensibilidad**: Fácil agregar nuevos tipos de fuentes o transformaciones
3. **Robustez**: Manejo de errores sin detener el proceso completo
4. **Escalabilidad**: Diseño que permite procesamiento paralelo futuro
5. **Mantenibilidad**: Código organizado y bien documentado

El proceso ETL sigue las mejores prácticas de la industria, asegurando la calidad y consistencia de los datos en el Data Warehouse.
