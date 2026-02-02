# 🚀 ROADMAP PENDIENTES - Visión a Futuro
## **Backlog de Trabajo: WhatsCloud LeadScrapper → SaaS Robusto**

> **Objetivo:** Transformar el prototipo Alpha en un sistema SaaS escalable, resiliente y listo para ventas.  
> **Timeline Estimado:** 6-8 semanas de desarrollo intensivo

---

## 📋 TABLA DE PRIORIDADES

| # | Tarea | Prioridad | Complejidad | Tiempo Est. | Dependencias |
|---|-------|-----------|-------------|-------------|--------------|
| **SEGURIDAD Y ESTABILIDAD** |
| 1 | Implementar Rate Limiting (express-rate-limit) | 🔴 **CRÍTICA** | Baja (2h) | 1 día | Redis |
| 2 | Agregar Helmet.js (Security Headers) | 🔴 **CRÍTICA** | Baja (1h) | 4 horas | Express |
| 3 | Validación de Inputs (express-validator o Zod) | 🔴 **CRÍTICA** | Media (8h) | 2 días | - |
| 4 | Implementar Sistema de Logs Persistentes (Winston + Loki) | 🔴 **CRÍTICA** | Media (6h) | 1 día | - |
| 5 | Manejo Global de Errores (Error Middleware) | 🔴 **CRÍTICA** | Baja (3h) | 1 día | - |
| 6 | Sanitización de Datos (DOMPurify frontend, validator backend) | 🔴 **CRÍTICA** | Media (5h) | 1 día | - |
| 7 | CORS Restrictivo (Whitelist de dominios) | 🔴 **CRÍTICA** | Baja (2h) | 4 horas | - |
| 8 | Rotación de JWT Secrets (Vault o K8s Secrets) | 🟠 **ALTA** | Alta (16h) | 3 días | Vault/K8s |
| 9 | Implementar 2FA (TOTP con speakeasy) | 🟠 **ALTA** | Alta (12h) | 2 días | PostgreSQL |
| 10 | Auditoría de Dependencias (npm audit fix) | 🟠 **ALTA** | Baja (2h) | 4 horas | - |
| **FUNCIONALIDADES CORE** |
| 11 | Sistema de Leads - Persistencia en PostgreSQL | 🔴 **CRÍTICA** | Media (10h) | 2 días | Sequelize |
| 12 | Export de Leads (CSV, Excel, JSON) | 🟡 **MEDIA** | Media (6h) | 1 día | - |
| 13 | Multi-Tenancy (Organizaciones con sub-usuarios) | 🔴 **CRÍTICA** | Alta (24h) | 5 días | PostgreSQL |
| 14 | Dashboard de Estadísticas (Métricas Agregadas) | 🟡 **MEDIA** | Alta (16h) | 3 días | PostgreSQL + Redis |
| 15 | Sistema de Notificaciones (Email + Push) | 🟡 **MEDIA** | Alta (12h) | 2 días | SMTP/SendGrid |
| 16 | Historial de Búsquedas (Auditoría de Scraping) | 🟡 **MEDIA** | Media (8h) | 2 días | PostgreSQL |
| 17 | Búsqueda Avanzada de Leads (Filtros + Ordenamiento) | 🟡 **MEDIA** | Media (8h) | 1 día | PostgreSQL |
| 18 | Sistema de Tags/Etiquetas para Leads | 🟡 **MEDIA** | Media (6h) | 1 día | PostgreSQL |
| 19 | Deduplicación Automática de Leads | 🟠 **ALTA** | Alta (12h) | 2 días | PostgreSQL |
| 20 | Enriquecimiento de Leads (Social Media Scraping) | 🟢 **BAJA** | Alta (20h) | 4 días | Puppeteer |
| **INTEGRACIÓNES Y WEBHOOKS** |
| 21 | Conexión Real con n8n (Webhooks Bidireccionales) | 🔴 **CRÍTICA** | Media (10h) | 2 días | n8n Instance |
| 22 | Integración con ACC (Aurum Control Center) | 🔴 **CRÍTICA** | Alta (24h) | 5 días | ACC API |
| 23 | API de SMS Real (Twilio/Vonage) | 🟠 **ALTA** | Media (8h) | 2 días | Twilio Account |
| 24 | API de Voice Campaigns Real (Twilio Voice) | 🟠 **ALTA** | Alta (16h) | 3 días | Twilio Account |
| 25 | Integración Chatwoot (Canales Multi-WhatsApp) | 🟡 **MEDIA** | Alta (12h) | 3 días | Chatwoot |
| 26 | Webhook de Eventos (Para integraciones de terceros) | 🟡 **MEDIA** | Media (8h) | 2 días | - |
| 27 | Integración con CRM (HubSpot/Salesforce) | 🟢 **BAJA** | Alta (20h) | 4 días | OAuth2 |
| **INFRAESTRUCTURA Y DEVOPS** |
| 28 | CI/CD Pipeline (GitHub Actions) | 🔴 **CRÍTICA** | Media (10h) | 2 días | GitHub |
| 29 | Tests Unitarios (Jest - Coverage 70%+) | 🔴 **CRÍTICA** | Alta (40h) | 8 días | Jest |
| 30 | Tests de Integración (API E2E con Supertest) | 🟠 **ALTA** | Alta (24h) | 5 días | Supertest |
| 31 | Docker Compose Multi-Container (Dev Environment) | 🔴 **CRÍTICA** | Media (8h) | 2 días | Docker |
| 32 | Kubernetes Manifests (Helm Chart) | 🟡 **MEDIA** | Alta (24h) | 5 días | K8s Cluster |
| 33 | Monitoreo y Alertas (Prometheus + Grafana) | 🟠 **ALTA** | Alta (16h) | 3 días | Prometheus |
| 34 | Logging Centralizado (ELK Stack o Loki) | 🟠 **ALTA** | Alta (12h) | 3 días | Loki/Elastic |
| 35 | Tracing Distribuido (OpenTelemetry) | 🟢 **BAJA** | Alta (16h) | 3 días | Jaeger |
| 36 | Database Migrations (Sequelize Migrations) | 🔴 **CRÍTICA** | Media (6h) | 1 día | Sequelize |
| 37 | Backup y Restore Automatizado (Testing) | 🟠 **ALTA** | Media (8h) | 2 días | Google Drive |
| 38 | CDN para Assets Estáticos (Cloudflare/AWS) | 🟡 **MEDIA** | Media (6h) | 1 día | CDN Provider |
| **OPTIMIZACIÓN Y PERFORMANCE** |
| 39 | Caché de Búsquedas (Redis Cache Layer) | 🟠 **ALTA** | Media (8h) | 2 días | Redis |
| 40 | Paginación en Endpoints de Leads | 🔴 **CRÍTICA** | Baja (4h) | 1 día | - |
| 41 | Lazy Loading en Frontend (React.lazy) | 🟡 **MEDIA** | Media (6h) | 1 día | React |
| 42 | Compresión HTTP (gzip/brotli) | 🟡 **MEDIA** | Baja (2h) | 4 horas | Express |
| 43 | Optimización de Imágenes (WebP, Resize) | 🟡 **MEDIA** | Media (6h) | 1 día | Sharp |
| 44 | Database Indexing (Índices en queries frecuentes) | 🟠 **ALTA** | Media (8h) | 2 días | PostgreSQL |
| 45 | Connection Pooling (PgBouncer) | 🟡 **MEDIA** | Media (6h) | 1 día | PgBouncer |
| 46 | Horizontal Scaling (Worker Nodes para Bull) | 🟢 **BAJA** | Alta (16h) | 3 días | Redis + K8s |
| **DOCUMENTACIÓN Y UX** |
| 47 | Documentación de API (Swagger/OpenAPI) | 🔴 **CRÍTICA** | Media (8h) | 2 días | swagger-ui-express |
| 48 | Manual de Usuario (Gitbook/Docusaurus) | 🟡 **MEDIA** | Alta (24h) | 5 días | Docusaurus |
| 49 | Onboarding Tutorial Interactivo | 🟡 **MEDIA** | Alta (16h) | 3 días | React |
| 50 | Modo Oscuro (Dark Mode) | 🟢 **BAJA** | Media (8h) | 2 días | CSS Variables |
| 51 | Responsive Design (Mobile Optimization) | 🟠 **ALTA** | Media (12h) | 2 días | CSS |
| 52 | Internacionalización (i18n - ES/EN) | 🟢 **BAJA** | Alta (16h) | 3 días | react-i18next |
| 53 | Accessibility (WCAG 2.1 AA) | 🟡 **MEDIA** | Alta (20h) | 4 días | - |
| **MONETIZACIÓN Y NEGOCIO** |
| 54 | Sistema de Planes (Free/Pro/Enterprise) | 🔴 **CRÍTICA** | Alta (16h) | 3 días | PostgreSQL |
| 55 | Integración de Pagos (Stripe/Mercado Pago) | 🔴 **CRÍTICA** | Alta (20h) | 4 días | Stripe API |
| 56 | Portal de Facturación (Invoices PDF) | 🟠 **ALTA** | Alta (12h) | 2 días | PDFKit |
| 57 | Sistema de Referidos (Affiliate Program) | 🟡 **MEDIA** | Alta (16h) | 3 días | PostgreSQL |
| 58 | Analytics de Uso (Métricas de negocio) | 🟠 **ALTA** | Media (10h) | 2 días | PostgreSQL |
| 59 | Admin Dashboard (SUPER_ADMIN Panel) | 🟠 **ALTA** | Alta (24h) | 5 días | React |
| 60 | Sistema de Tickets/Soporte (Zendesk Integration) | 🟡 **MEDIA** | Media (10h) | 2 días | Zendesk API |

---

## 🎯 SPRINTS RECOMENDADOS

### **Sprint 1: Security Hardening (1 semana)**
**Objetivo:** Cerrar todas las vulnerabilidades críticas de seguridad.

- [ ] Rate Limiting
- [ ] Helmet.js
- [ ] Input Validation (Zod)
- [ ] Logs Persistentes (Winston)
- [ ] Error Handling Global
- [ ] CORS Restrictivo
- [ ] npm audit fix

**Entregable:** Sistema resistente a ataques básicos (DDoS, XSS, SQL Injection).

---

### **Sprint 2: Database & Multi-Tenancy (1.5 semanas)**
**Objetivo:** Transformar localStorage en persistencia real con soporte multi-tenant.

- [ ] Modelo `Leads` en PostgreSQL
- [ ] Modelo `Organizations`
- [ ] Modelo `CreditsLedger` (Transacciones)
- [ ] Sistema de Relaciones (Users → Organizations → Leads)
- [ ] Migraciones con Sequelize
- [ ] Export de Leads (CSV/Excel)
- [ ] Deduplicación de Leads

**Entregable:** Base de datos robusta lista para millones de registros.

---

### **Sprint 3: DevOps & Testing (2 semanas)**
**Objetivo:** Automatización completa del ciclo de desarrollo.

- [ ] Docker Compose Multi-Container
- [ ] Tests Unitarios (70% coverage)
- [ ] Tests E2E (API)
- [ ] CI/CD con GitHub Actions
- [ ] Database Migrations
- [ ] Kubernetes Helm Chart (Opcional)

**Entregable:** Deploy automático en cada commit a `main`.

---

### **Sprint 4: Integraciones Core (1.5 semanas)**
**Objetivo:** Conectar con sistemas externos vitales.

- [ ] n8n Webhooks Bidireccionales
- [ ] ACC API Integration
- [ ] SMS Real (Twilio)
- [ ] Voice Campaigns (Twilio Voice)
- [ ] Chatwoot Multi-Channel

**Entregable:** Sistema totalmente conectado con ecosistema WhatsCloud.

---

### **Sprint 5: Monetización & UX (1 semana)**
**Objetivo:** Habilitar ventas y mejorar experiencia de usuario.

- [ ] Sistema de Planes (Free/Pro/Enterprise)
- [ ] Stripe Integration
- [ ] Portal de Facturación
- [ ] Swagger API Docs
- [ ] Responsive Design
- [ ] Onboarding Tutorial

**Entregable:** Sistema listo para vender con documentación completa.

---

### **Sprint 6: Observabilidad & Scaling (1 semana)**
**Objetivo:** Preparar para escalar a 10,000+ usuarios.

- [ ] Prometheus + Grafana
- [ ] Logging Centralizado (Loki)
- [ ] Database Indexing
- [ ] Redis Cache Layer
- [ ] Connection Pooling (PgBouncer)
- [ ] CDN para Assets

**Entregable:** Sistema monitoreable y escalable horizontalmente.

---

## 🔥 DEUDA TÉCNICA IDENTIFICADA

### **Crítica (Resolver Inmediatamente)**
1. **No hay tests:** 0% de cobertura. Cualquier refactor es riesgoso.
2. **Sin Rate Limiting:** Vulnerable a abuso de API de scraping (costoso en RAM).
3. **Logs solo en consola:** No hay trazabilidad en producción.
4. **Secrets en plaintext:** `.env` no es seguro para producción (usar Vault).
5. **Sin migraciones:** Cambios en schema requieren recrear DB.

### **Alta (Resolver en 2 semanas)**
1. **No hay paginación:** Endpoints pueden retornar miles de registros.
2. **Sequelize sin índices:** Queries lentas en tablas grandes.
3. **Frontend sin error boundaries:** Crashes pueden romper toda la app.
4. **Sin validación robusta:** Backend confía en datos del frontend.
5. **Healthcheck superficial:** No detecta problemas de red o latencia.

### **Media (Resolver en 1 mes)**
1. **No hay caché de búsquedas:** Scraping duplicado desperdicia recursos.
2. **Assets sin optimizar:** Imágenes grandes afectan tiempo de carga.
3. **No hay dark mode:** UX moderna requiere tema oscuro.
4. **Documentación inexistente:** Solo README básico.

---

## 💡 OPORTUNIDADES DE NEGOCIO

### **Features Premium (Pro/Enterprise)**
- ✨ **AI Lead Scoring:** Gemini analiza leads y prioriza automáticamente
- ✨ **Scraping Masivo:** Hasta 100 leads por búsqueda (vs 5 en Free)
- ✨ **Enriquecimiento Social:** Extrae Instagram, Facebook, LinkedIn
- ✨ **CRM Integration:** Sincronización bidireccional con HubSpot/Salesforce
- ✨ **White Label:** Customización de marca y dominio propio
- ✨ **Dedicated Workers:** Workers de scraping exclusivos (sin cola)
- ✨ **Advanced Analytics:** Dashboards con métricas de conversión
- ✨ **API Access:** Acceso completo a REST API para integraciones custom

### **Add-Ons (Pago por Uso)**
- 💰 SMS Campaigns (por mensaje enviado)
- 💰 Voice Campaigns (por minuto de robocall)
- 💰 AI Analysis (por lead analizado por Gemini)
- 💰 Export Avanzado (PDF con diseño custom)
- 💰 Proxy Premium (IP residenciales para scraping)

---

## 📊 MÉTRICAS DE ÉXITO

### **Técnicas**
- ✅ **Uptime:** 99.9% (SLA)
- ✅ **Response Time:** P95 < 300ms (API)
- ✅ **Test Coverage:** > 80%
- ✅ **Security Audit:** 0 vulnerabilidades críticas
- ✅ **Documentation:** 100% endpoints documentados

### **Negocio**
- 📈 **Time to First Lead:** < 2 minutos desde registro
- 📈 **Onboarding Completion:** > 70%
- 📈 **Free to Paid Conversion:** > 5%
- 📈 **Churn Rate:** < 5% mensual
- 📈 **NPS:** > 50

---

## 🛠️ STACK TECNOLÓGICO RECOMENDADO (Futuro)

### **A Agregar**
```bash
# Security
npm install helmet express-rate-limit express-validator

# Testing
npm install --save-dev jest supertest @testing-library/react

# Monitoring
npm install prom-client winston winston-loki

# Validation
npm install zod

# Payments
npm install stripe

# Documentation
npm install swagger-ui-express swagger-jsdoc
```

### **Infraestructura**
- **Reverse Proxy:** Nginx o Traefik (TLS Termination)
- **Container Orchestration:** Kubernetes (EKS/GKE) o Docker Swarm
- **Monitoring:** Prometheus + Grafana + Loki
- **Secrets Manager:** HashiCorp Vault o AWS Secrets Manager
- **CDN:** Cloudflare o AWS CloudFront

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Google bloquea IPs por scraping masivo | 🔴 Alto | Media | Proxies rotativos + Rate limiting inteligente |
| RAM insuficiente (Puppeteer) | 🔴 Alto | Alta | Workers horizontales + Límite de concurrencia |
| PostgreSQL no escala | 🟠 Medio | Baja | Read Replicas + Connection Pooling |
| Dependencias vulnerables | 🟠 Medio | Alta | Dependabot + npm audit automático en CI |
| Falta de documentación | 🟡 Bajo | Alta | Swagger auto-generado + Docusaurus |
| Vendor Lock-in (Google Gemini) | 🟡 Bajo | Media | Abstracción con interface genérico de IA |

---

## 📅 TIMELINE ESTIMADO

```
Semana 1-2   : Security Hardening + Database
Semana 3-4   : DevOps & Testing
Semana 5-6   : Integraciones Core
Semana 7     : Monetización + UX
Semana 8     : Observabilidad + Launch

Total: 2 meses para MVP Robusto
```

---

**Última actualización:** 2026-02-01  
**Mantenido por:** Senior Product Manager & Lead System Architect  
**Revisión:** Cada Sprint (Semanal)
