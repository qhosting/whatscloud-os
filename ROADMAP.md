# 📊 ROADMAP - Estado Actual del Sistema
## **Fuente de Verdad: WhatsCloud LeadScrapper**

> **Última actualización:** 2026-02-01  
> **Versión del Sistema:** `1.0.0-alpha`  
> **Status del Proyecto:** 🟡 **Alpha** - Funcional pero sin hardening de producción

---

## 🏗️ ARQUITECTURA DETECTADA

### **Stack Tecnológico**

```
┌─────────────────────────────────────────────────────────────┐
│                     MONOLITO MODULAR                        │
│                    (Container Docker)                        │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND                                                   │
│  • React 19.2.3 + TypeScript 5.8.2                         │
│  • Vite 6.2.0 (Build Tool)                                 │
│  • Lucide React (Icons)                                     │
├─────────────────────────────────────────────────────────────┤
│  BACKEND                                                     │
│  • Node.js 22 LTS                                           │
│  • Express 5.2.1                                            │
│  • Puppeteer 24.36.1 (Headless Chrome)                     │
│  • Bull 4.16.5 (Job Queues)                                │
│  • node-cron 4.2.1 (Scheduled Tasks)                       │
├─────────────────────────────────────────────────────────────┤
│  BASES DE DATOS                                             │
│  • PostgreSQL (Sequelize 6.37.7) - Usuarios, Créditos      │
│  • MongoDB (Mongoose 9.1.5) - Configs, Logs de Chat        │
│  • Redis 5.10.0 - Colas, Caché, Sesiones                  │
├─────────────────────────────────────────────────────────────┤
│  INTEGRACIONES                                              │
│  • Google Gemini AI (@google/genai 1.35.0)                │
│  • Asterisk Manager (AMI) - VoIP                           │
│  • WAHA (WhatsApp HTTP API) - Webhook Ready                │
│  • Google Drive API (Backups)                              │
└─────────────────────────────────────────────────────────────┘
```

### **Infraestructura de Despliegue**

| Componente | Estado | Detalles |
|------------|--------|----------|
| **Docker** | ✅ Implementado | `Dockerfile` completo con dependencias de Chromium |
| **Puerto Expuesto** | `3000` | Single-port para API + Frontend estático |
| **Health Check** | ✅ Activo | `GET /api/health` con chequeo Redis + Postgres + Browser |
| **Variables de Entorno** | ✅ Documentado | `.env.example` con 15+ variables configuradas |
| **Build Process** | ✅ Automático | `npm run build` → `/dist` servido por Express |

---

## ✅ MÓDULOS COMPLETADOS

### **1. Autenticación y Seguridad**
- [x] Sistema de Login/Registro (`POST /api/auth/login`, `/api/auth/register`)
- [x] JWT Token Generation (jsonwebtoken 9.0.3)
- [x] Password Hashing (bcryptjs 3.0.3)
- [x] Middleware de Verificación de Token (`verifyToken`)
- [x] Role-Based Access Control (RBAC) - 4 roles definidos en types.ts

**Tablas de Base de Datos:**
```sql
Users (PostgreSQL)
├── id (UUID, Primary Key)
├── email (String, Unique)
├── password_hash (String)
├── role (Enum: SUPER_ADMIN, ACCOUNT_OWNER, ACCOUNT_AGENT)
└── credits (Integer, Default: 10)
```

---

### **2. Scraping en Google Maps (Funcional)**
- [x] Endpoint `POST /api/scrape` protegido por JWT
- [x] Queue System con Bull (Redis) - Concurrencia: 2 navegadores
- [x] Puppeteer con headless Chrome
- [x] Extracción Real de Datos:
  - ✅ Nombre del Negocio
  - ✅ Dirección
  - ✅ Teléfono
  - ✅ Rating y Reviews
  - ✅ URL de Google Maps
- [x] Soporte para Proxies Rotativos (variables `PROXY_SERVER`, `PROXY_USERNAME`, `PROXY_PASSWORD`)
- [x] Endpoint de Polling `GET /api/scrape/:jobId` para seguimiento de progreso
- [x] Manejo de 5 leads por búsqueda (configurable)

**Arquitectura del Scraper:**
```javascript
User Request → Express API → Bull Queue → Puppeteer Worker
                                ↓
                         Chrome Headless → Google Maps
                                ↓
                         Lead Extraction → Job Result
                                ↓
                         Frontend Polling ← Job Status API
```

---

### **3. Conexión a Bases de Datos**
- [x] PostgreSQL: Sequelize ORM configurado (`server/config/database.js`)
- [x] MongoDB: Mongoose configurado y conectado
- [x] Redis: Cliente activo para Bull Queues
- [x] Auto-sync de Modelos (`sequelize.sync()`)
- [x] Modelos Implementados:
  - `User.js` (PostgreSQL)
  - `BotConfig.js` (MongoDB - Schema para configuraciones de chatbots)

---

### **4. Sistema de Créditos**
- [x] Campo `credits` en modelo User
- [x] Endpoint `POST /api/credits/deduct` protegido
- [x] Validación en Base de Datos antes de operaciones costosas
- [x] Actualización en tiempo real tras consumo

---

### **5. Integraciones Externas**

#### **VoIP (Asterisk Manager Interface)**
- [x] Conexión AMI implementada (`asterisk-manager`)
- [x] Endpoint `POST /api/call` para Click-to-Call
- [x] Acción `Originate` para iniciar llamadas salientes
- [x] Variables de entorno configuradas: `AMI_HOST`, `AMI_PORT`, `AMI_USER`, `AMI_SECRET`

#### **WhatsApp (WAHA WebHook)**
- [x] Endpoint `POST /webhook/whatsapp` implementado
- [x] Controller `whatsappController.js` procesa mensajes entrantes
- [x] Integración con Google Gemini para respuestas IA
- [x] Variable `WAHA_API_URL` configurada

#### **Google Drive (Backups Automáticos)**
- [x] Servicio `backupService.js` completo
- [x] CRON Job diario a las 3:00 AM (`node-cron`)
- [x] Dump automático de PostgreSQL (pg_dump)
- [x] Dump automático de MongoDB (mongodump)
- [x] Compresión en ZIP (archiver)
- [x] Upload a Google Drive (googleapis)

---

### **6. Frontend - Interfaz Completa**
- [x] **App.tsx** (379 líneas) - Aplicación principal con 6 módulos
- [x] **LandingPage.tsx** - Página de bienvenida
- [x] **LeadCard.tsx** - Tarjeta individual de lead con acciones
- [x] **FilterPanel.tsx** - Panel de búsqueda avanzada
- [x] **InsightsPanel.tsx** - Estadísticas agregadas
- [x] **BotBuilder.tsx** (39,253 bytes) - Constructor de flujos de chatbot
- [x] **AdminPanel.tsx** - Panel de administración de usuarios
- [x] **SMSReminder.tsx** - Módulo de campañas SMS
- [x] **VoiceCampaigns.tsx** - Módulo de robocalls
- [x] **ConnectionsModule.tsx** - Gestión de canales Chatwoot/WhatsApp
- [x] **PostProcessingToolbar.tsx** - Acciones masivas sobre leads

**Servicios TypeScript del Frontend:**
- [x] `accService.ts` - Integración con ACC (Aurum Control Center)
- [x] `geminiService.ts` - Cliente de Google Gemini AI
- [x] `storageService.ts` - Persistencia local (localStorage)
- [x] `automationService.ts` - Lógica de automatizaciones
- [x] `config.ts` - Configuración centralizada

---

### **7. Tipos y Contratos**
- [x] `types.ts` (196 líneas) - Tipos completos para:
  - UserRole (4 roles)
  - Lead (con campos de análisis IA)
  - ACCProfile (perfil de usuario)
  - BotConfig y SmartActions
  - SMSCampaignConfig
  - VoiceCampaignConfig
  - ChatwootChannel
  - N8NPayload (integración con n8n)

---

## 🔒 SEGURIDAD IMPLEMENTADA

| Medida | Estado | Detalles |
|--------|--------|----------|
| JWT Authentication | ✅ | Tokens firmados con `JWT_SECRET` |
| Password Hashing | ✅ | bcrypt con salt rounds |
| CORS Habilitado | ✅ | `cors` middleware aplicado |
| Helmet (Headers) | ❌ | **PENDIENTE** |
| Rate Limiting | ❌ | **PENDIENTE** |
| Input Validation | ⚠️ | Parcial (falta express-validator) |
| HTTPS/TLS | ⚠️ | Depende del reverse proxy (Nginx/Traefik) |

---

## 📦 CONFIGURACIÓN DE ENTORNO

El sistema requiere las siguientes variables de entorno (ver `.env.example`):

### **Server**
- `PORT=3000`
- `NODE_ENV=production`
- `JWT_SECRET=<secret_key>`

### **Databases**
- `DATABASE_URL=postgres://...` (PostgreSQL)
- `MONGO_URL=mongodb://...`
- `REDIS_URL=redis://...`

### **AI & Scraping**
- `API_KEY=<google_gemini_key>`
- `PROXY_SERVER=<optional>`
- `PROXY_USERNAME=<optional>`
- `PROXY_PASSWORD=<optional>`

### **Integrations**
- `WAHA_API_URL=http://waha:3000/api`
- `AMI_HOST=<asterisk_server>`
- `AMI_PORT=5038`
- `AMI_USER=admin`
- `AMI_SECRET=<secret>`

### **Backups (Opcional)**
- `GOOGLE_SERVICE_ACCOUNT_JSON=<path_or_json>`
- `GOOGLE_DRIVE_FOLDER_ID=<folder_id>`

---

## 📈 ESTADO DE INTEGRACIÓN CON ECOSISTEMA

| Sistema Externo | Estado | Notas |
|----------------|--------|-------|
| **ACC (Aurum Control Center)** | 🟡 Interfaz Lista | Frontend consume API simulada |
| **n8n (Automatizaciones)** | 🟡 Payloads Definidos | Webhooks no configurados |
| **WAHA (WhatsApp)** | ✅ Webhook Ready | Controlador implementado |
| **Asterisk PBX** | ✅ AMI Integrado | Click-to-call funcional |
| **Google Gemini** | ✅ Activo | API key requerida |
| **Chatwoot** | 🟡 Tipos Definidos | Integración pendiente |

---

## 🚀 CAPACIDADES OPERATIVAS

| Funcionalidad | Modo | Límites Conocidos |
|--------------|------|-------------------|
| Scraping Google Maps | ✅ Producción | 2 navegadores simultáneos (RAM) |
| Autenticación JWT | ✅ Producción | Requiere secret robusto |
| Click-to-Call VoIP | ✅ Producción | Requiere Asterisk externo |
| WhatsApp Webhook | ✅ Producción | Requiere WAHA externo |
| Backups Automáticos | ✅ Producción | Requiere credenciales GDrive |
| Bot Builder | 🟡 UI Only | Sin webhook de ejecución |
| SMS Campaigns | 🟡 UI Only | Sin API de envío SMS |
| Voice Campaigns | 🟡 UI Only | Sin API de robocalls |

---

## 📊 MÉTRICAS DE SALUD DEL SISTEMA

Endpoint `GET /api/health` retorna:
```json
{
  "service": "WhatsCloud Scrapper API",
  "uptime": <seconds>,
  "timestamp": <ISO_DATE>,
  "checks": {
    "redis": "ok" | "error" | "disconnected",
    "postgres": "ok" | "error",
    "browser_capability": "ready" | "missing_libs"
  }
}
```

**Códigos de Respuesta:**
- `200 OK` - Todo operativo
- `503 Service Unavailable` - Redis o Postgres con errores

---

## 🎯 CERTIFICACIÓN DE COMPLETITUD

### ✅ **Listo para Desplegar (Con Limitaciones)**
- **Docker Build:** ✅ Exitoso
- **Database Connections:** ✅ Funcionales (requieren servicios externos)
- **API Endpoints:** ✅ Implementados
- **Frontend Build:** ✅ Genera `/dist` correctamente
- **Health Checks:** ✅ Implementados

### ⚠️ **Requiere Atención Antes de Escalar**
- Falta Rate Limiting
- Falta Validación robusta de inputs
- Faltan Tests Automatizados
- Documentación de API (Swagger)
- Métricas y Observabilidad (Prometheus/Grafana)

---

**Próximos Pasos:** Ver `ROADMAP_PENDIENTES.md` para lista completa de tareas pendientes.
