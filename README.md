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

**Edisur (Real Estate):**
- Pipeline de ventas
- HubSpot bidireccional
- Gestión de Personal
- Catálogo de productos

**Vidacel (Salud / Chile):**
- Gestión de clientes y oportunidades
- Gestión de Laboratorios
- Gestión de la Calidad

**Ormay (Industria):**
- WhatsApp Cnn: Recepción de solicitudes de garantía
- Seguimiento de OST
- Nuevos clientes
- Integración con ERP

**AG Naum (Grupo Empresario):**
- Oportunidades unificadas (real estate, autos, tecnología)
- Concesionarias: ventas y posventa
- CRM multi-unidad de negocio
- Gestión consolidada del grupo

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


## Para Developers

### Stack Técnico

**Backend:**
- Node.js (ES6 modules)
- PostgreSQL (target principal, 2026+)
- SQL Server (legacy support)
- Keycloak (SSO, OAuth2, OpenID Connect)
- Cloudflare
- AWS
- Elastic
- Claude

**Frontend:**
- SPA Framework (routing, state, components)
- Bootstrap 5.3 (web)
- doorsapi2.js (client SDK)


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

### Workflow Programable

**Eventos síncronos (blocking):**
- Open
- BeforeSave, AfterSave
- BeforeDelete, AfterDelete
- BeforeCopy, AfterCopy
- BeforeMove, AfterMove

**Eventos asíncronos (background):**
- OnSave (trigger)
- OnDelete (trigger)
- Timer (cron-like)


### Integrations

**Conectores nativos:**
- WhatsApp (wappcnn)
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


### AWS Native
- RDS (databases)
- S3 (attachments)
- CloudFront (CDN)

### Legacy Support
- COM+ modernizado (Excel macros, VBScript, ASP clásico)
- SQL Server migration path
- Backward compatibility Doors 8

## Licencia

**SDKs Open-Source:** LGPL v3 (GNU Lesser General Public License)

Los SDKs públicos (doorsapi2, generic6, etc.) están bajo LGPL v3, permitiendo uso comercial sin requerir que tu aplicación sea open-source.

**Motor propietario:** El core engine de Fluye es propietario, pero los SDKs para desarrollar aplicaciones son libres.


## Contacto

**Website:** [fluye.ar](https://fluye.ar) (próximamente)

**Email:** jorge@fluye.ar

**GitHub:** https://github.com/pagano/fluye

---

*Fluye 2026 - De Doors a Fluye: 25+ años de evolución en gestión de procesos empresariales.*
