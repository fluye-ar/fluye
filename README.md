# Doors 2026

Motor de aplicaciones documentales de próxima generación.

## ¿Qué es Doors?

Doors es un framework para desarrollo de aplicaciones documentales (document-oriented applications). Provee una estructura jerárquica de carpetas que almacenan documentos, con permisos granulares, workflow programable, y búsqueda full-text. Comparable a Notion o Coda, pero con motor enterprise y workflow programable. SDKs open-source.

**Evolución:**
- Doors 7: Producción (.NET + VBScript + COM)
- Doors 8: Primera generación JS/Node (2018-2023)
- **Doors 2026:** Esta versión

## Características Principales (2026)

### Autenticación Keycloak
Integración con Keycloak para SSO, OAuth2, OpenID Connect. Reemplazo de autenticación nativa/LDAP legacy.

### Nuevo Explorer (Web App)
Explorer rediseñado como web app moderna. SPA con carga rápida, routing client-side, UX mejorada.

### Framework SPA
Framework JavaScript para construir SPAs sobre Doors. Routing, estado, componentes reutilizables.

### APIs con Rate Limit
Rate limiting en todas las APIs (RESTful, GraphQL). Protección contra abuso, throttling configurable por usuario/grupo.

### Nuevo COM+ Client
Cliente COM+ modernizado para integración con aplicaciones legacy (Excel macros, VBScript, ASP clásico).

### MySQL Support
Soporte nativo MySQL además de SQL Server. Migración simplificada para clientes MySQL.

### Elastic Search
Integración Elastic Search para búsqueda full-text de alta performance. Indexación de documentos, attachments, campos HTML.

### GraphQL API
API GraphQL además de RESTful. Queries flexibles, reducción de over-fetching, schema introspection.

### Claude Integration
Integración con Claude AI para:
- Generación de código (eventos, controles)
- Asistencia en desarrollo
- Análisis de datos documentales
- Automatización de workflows

### node-sql-parser
Parser SQL en Node para validación y análisis de queries. Seguridad mejorada, optimización automática.

### AWS Infrastructure
Migración completa a AWS:
- ECS para Events.v8
- RDS para databases
- S3 para attachments externos
- CloudFront para CDN

## Stack Heredado (Doors 8)

- doorsapi2: API ES6 RESTful
- generic6: Motor formularios HTML+JS
- Events.v8: Servicio Node dockerizado
- CDN: Código desde Github
- App Capacitor: Cliente iOS/Android
- Relaciones (JOINS): Performance 10x
