# Fluye

Plataforma para modelar y automatizar procesos empresariales con metodología ágil.

> Iterás rápido. Adaptás a cambios. Deployás en días, no meses.

## ¿Por qué Fluye?

### Agilidad Real

Los procesos ágiles se adaptan mejor a los cambios del negocio:

- **A medida:** Sin restricciones innecesarias de frameworks rígidos
- **Iterativo:** Cambios sin recompilación, deploy inmediato
- **Simple:** Pocos controles, más velocidad
- **Transparente:** Si hay problemas, vas a los logs

### Casos de Uso Reales

**CRM Vidacel (Salud):**
- Gestión de clientes y oportunidades
- WhatsApp/Facebook integrado
- Workflow de ventas programable

**ERP Ormay (Industria):**
- Cotizaciones y órdenes de compra
- Seguimiento de producción
- Integraciones con sistemas legacy

**Oportunidades Edisur (Real Estate):**
- Pipeline de ventas
- HubSpot bidireccional
- Automatización de seguimiento

### Open-Source

- **Licencia:** LGPL v3
- **SDKs públicos:** JavaScript/Node.js
- **Sin vendor lock-in:** Código y datos bajo tu control
- **Comunidad:** Repositorio público en GitHub

## ¿Qué es Fluye?

Motor BPM (Business Process Management) que combina:

- **Gestión documental:** Estructura jerárquica de carpetas y documentos
- **Workflow programable:** Eventos síncronos/asíncronos en JavaScript
- **Permisos granulares:** Control por usuario, grupo, carpeta y documento
- **Búsqueda full-text:** Elastic Search integrado
- **APIs modernas:** RESTful + GraphQL

*Referencia técnica: comparable a Notion o Coda, pero con motor enterprise, workflow programable y deployment on-premise o cloud.*

## Para Business Owners

### Resultados en Días, No Meses

**Iteración rápida:**
1. Modelás el proceso (formularios + workflow)
2. Deployás en minutos
3. Probás con usuarios reales
4. Ajustás según feedback
5. Repetís

**Sin proyectos eternos:**
- No hay "análisis de requerimientos" de 3 meses
- No hay "fase de desarrollo" de 6 meses
- No hay "UAT" de 2 meses

**Adaptación al cambio:**
- Cambió el proceso? → Ajustás el workflow en minutos
- Nuevo campo? → Agregás y deployás
- Nueva integración? → API RESTful o webhook

### ROI Claro

**Vidacel:** De planilla Excel a CRM en 2 semanas. 50+ usuarios activos.

**Ormay:** ERP modular desplegado por fases. Primera fase en 3 semanas.

**Edisur:** Integración HubSpot bidireccional en 1 semana. Sincronización automática de oportunidades.

## Para Developers

### Stack Técnico

**Backend:**
- Node.js (ES6 modules)
- PostgreSQL (target principal, 2026+)
- SQL Server (legacy support)
- Keycloak (SSO, OAuth2, OpenID Connect)

**Frontend:**
- SPA Framework (routing, state, components)
- Bootstrap 5.3 (web)
- Framework7 (mobile)
- doorsapi2.js (client SDK)

**Infrastructure:**
- Docker + ECS (AWS Fargate)
- RDS (PostgreSQL/SQL Server)
- S3 + CloudFront (CDN)
- Elastic Search (full-text search)

### APIs

**RESTful API (doorsapi2):**
```javascript
import { Session } from 'fluye';

const session = new Session();
await session.logon('user', 'pass', 'database');

const folder = await session.folder(1023);
const doc = await folder.newDoc();
doc.fields('NOMBRE').value = 'Test';
await doc.save();

await session.logoff();
```

**GraphQL API (2026):**
```graphql
query {
  folder(id: 1023) {
    documents(limit: 10) {
      id
      created
      fields {
        NOMBRE
        EMAIL
      }
    }
  }
}
```

### Workflow Programable

**Eventos síncronos (blocking):**
- BeforeSave, AfterSave
- BeforeDelete, AfterDelete
- Open, Terminate
- BeforeFieldChange, AfterFieldChange

**Eventos asíncronos (background):**
- OnSave (trigger)
- OnDelete (trigger)
- Timer (cron-like)

**Motor:** Events.v8 (Node.js dockerizado en ECS)

### Deployment

**Development:**
```bash
npm install fluye
node your-script.mjs
```

**Production:**
```bash
docker build -t fluye-app .
docker push ecr/fluye-app:v1
# Deploy via ECS/Fargate
```

### Integrations

**Conectores nativos:**
- WhatsApp (wappcnn)
- Facebook Messenger (fbcnn)
- HubSpot (hubspotcnn)
- Webhooks genéricos

**Custom integrations:**
- RESTful API
- GraphQL API
- Webhooks salientes
- COM+ (legacy Excel/VBScript)

## Evolución

**Historia:**
- Doors 1-5 (1998-2010): VB6 + ASP + COM
- Doors 7 (2011-2017): .NET + SQL Server/Oracle
- Doors 8 (2018-2023): Node.js + SQL Server/Oracle
- **Fluye (2026+):** Full refactor + PostgreSQL + Keycloak + AWS

## Roadmap 2026

### Keycloak SSO
Autenticación enterprise con SSO, OAuth2, OpenID Connect. Reemplazo de autenticación nativa/LDAP.

### Nuevo Explorer
SPA moderna con carga rápida, routing client-side, UX mejorada.

### PostgreSQL Nativo
Soporte completo PostgreSQL. Target principal para nuevos clientes (SQL Server mantiene soporte legacy).

### GraphQL API
Queries flexibles, reducción de over-fetching, schema introspection. Complementa RESTful existente.

### Elastic Search
Búsqueda full-text de alta performance. Indexación de documentos, attachments, campos HTML.

### Rate Limiting
Protección contra abuso en todas las APIs. Throttling configurable por usuario/grupo.

### Claude AI Integration
- Generación de código (eventos, controles)
- Asistencia en desarrollo
- Análisis de datos documentales
- Automatización de workflows

### AWS Native
- ECS Fargate (Events.v8)
- RDS (databases)
- S3 (attachments)
- CloudFront (CDN)

### Legacy Support
- COM+ modernizado (Excel macros, VBScript, ASP clásico)
- SQL Server migration path
- Backward compatibility Doors 8

## Componentes Core (heredados de Doors 8)

- **doorsapi2:** RESTful API (ES6 modules)
- **generic6:** Motor de formularios dinámicos (HTML+JS)
- **Events.v8:** Servicio de eventos asíncronos (Node.js dockerizado)
- **CDN:** Código servido desde GitHub
- **App Capacitor:** Cliente móvil (iOS/Android)
- **Relaciones (JOINS):** Performance mejorada 10x vs versiones anteriores

## Licencia

**SDKs Open-Source:** LGPL v3 (GNU Lesser General Public License)

Los SDKs públicos (doorsapi2, generic6, etc.) están bajo LGPL v3, permitiendo uso comercial sin requerir que tu aplicación sea open-source.

**Motor propietario:** El core engine de Fluye es propietario, pero los SDKs para desarrollar aplicaciones son libres.

## Documentación

📖 **Arquitectura completa:** Ver [`CLAUDE.md`](CLAUDE.md)

📖 **Database schema:** Ver [`DB.md`](DB.md)

📖 **AWS Infrastructure:** Ver [`AWS.md`](AWS.md)

📖 **SPA Framework:** Ver [`SPA.md`](SPA.md)

📖 **Keycloak SSO:** Ver [`KEYCLOAK.md`](KEYCLOAK.md)

## Contacto

**Website:** [fluye.ar](https://fluye.ar) (próximamente)

**Email:** jorge@fluye.ar

**GitHub:** Repositorios públicos próximamente

---

*Fluye 2026 - De Doors a Fluye: 25+ años de evolución en gestión de procesos empresariales.*
