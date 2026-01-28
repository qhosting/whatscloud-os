# 🗺️ Roadmap del Proyecto: WhatsCloud LeadScrapper

Este documento describe el estado técnico actual del sistema tras la migración a una arquitectura Full-Stack y los pasos necesarios para alcanzar una operatividad total en producción.

---

## ✅ Estado Actual del Sistema (v1.0.0 - Alpha)

Hemos migrado de un prototipo 100% simulado en frontend a una arquitectura **Full-Stack Dockerizada**.

### 1. Arquitectura
- **Frontend:** React 19 + Vite + TypeScript. Interfaz completa y responsiva.
- **Backend:** Servidor Node.js con Express (`server/app.js`).
- **Despliegue:** `Dockerfile` optimizado para Easypanel/Dokku, incluyendo librerías de sistema para Chromium.

### 2. Funcionalidades Operativas
- **🔍 Scraping Real:** El sistema ya **no inventa datos**.
  - Al buscar en el frontend, se envía una petición al Backend.
  - El Backend lanza una instancia de **Chrome Headless (Puppeteer)**.
  - Navega en tiempo real a Google Maps y extrae: Nombre, Dirección, Teléfono, Rating y Reviews.
- **🐳 Containerización:** El proyecto es un "Monolito Modular". El contenedor construye el frontend y levanta el backend que sirve tanto la API como los archivos estáticos.

### 3. Funcionalidades Simuladas (Mocks)
Aunque la UI existe, estas partes aún operan con datos falsos o locales:
- **Autenticación:** El usuario `wc_user_8821` está harcodeado en `accService.ts`.
- **Persistencia:** Todo se guarda en `localStorage` del navegador. Si borras caché, pierdes los datos.
- **Telefonía:** El módulo de llamadas solo simula la conexión.
- **Bot Builder:** Configuras el bot, pero no hay un Webhook real escuchando a WhatsApp.

---

## 🚧 Pendientes por Implementar (Roadmap a Producción)

Para llevar este sistema a venta real (SaaS), se requieren los siguientes módulos de infraestructura.

### Fase 1: Persistencia y Seguridad (Prioridad Alta)
- [ ] **Base de Datos (PostgreSQL):**
  - Migrar `localStorage` a una BD real.
  - Tablas: `Users`, `Organizations`, `CreditsLedger`, `Leads`.
- [ ] **Autenticación (JWT / Auth0):**
  - Crear endpoints `/api/login` y `/api/register`.
  - Middleware de protección en Express para rutas `/api/scrape`.
- [ ] **Base de Datos NoSQL (MongoDB):**
  - Para guardar los logs de chat del Bot y las configuraciones JSON complejas.
- [ ] **Redis (Caché & Colas):**
  - Gestión de sesiones de usuario rápidas.
  - Cola de tareas para el Scraper (evitar saturación de RAM con Puppeteer).
  - Rate Limiting (evitar abuso de API).

### Fase 2: Conectividad Externa (Integraciones)
- [ ] **WhatsApp Webhook:**
  - Crear endpoint `POST /webhook/whatsapp` en el backend.
  - Conectar con API de WAHA (WhatsApp HTTP API) o Meta Cloud API.
  - Lógica: Recibir mensaje -> Consultar IA (Gemini) -> Responder.
- [ ] **VoIP (Asterisk/Issabel):**
  - Implementar conexión AMI (Asterisk Manager Interface) en Node.js.
  - Endpoint `/api/call` que dispare la acción `Originate` al PBX del cliente.

### Fase 3: Robustez del Scraper
- [ ] **Proxies Rotativos:** Integrar BrightData o IPRoyal en Puppeteer para evitar bloqueos de Google tras muchas búsquedas.
- [ ] **Colas de Trabajo (Redis + Bull):** Si 100 usuarios buscan a la vez, el servidor colapsará por la RAM de Chrome. Mover el scraping a "Jobs" en segundo plano.

### Fase 4: DevOps & CI/CD
- [ ] **Variables de Entorno:** Mover `GEMINI_API_KEY` y credenciales de BD a secretos de Easypanel.
- [ ] **Health Checks:** Monitoreo de uptime del servicio de Puppeteer.
