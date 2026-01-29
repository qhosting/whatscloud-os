# 🤖 Prompt de Implementación: Sistema de Backup Automático a Google Drive

Si deseas implementar este mismo sistema de backups en otro proyecto (Node.js/Docker), copia y pega el siguiente prompt a tu asistente de IA:

---

**Prompt:**

Actúa como un Ingeniero DevOps Senior. Necesito implementar un sistema de **Backup Automático** en mi aplicación Node.js que respalde bases de datos (PostgreSQL y MongoDB) y suba los archivos comprimidos a **Google Drive**.

**Requerimientos:**

1.  **Tecnologías:**
    *   `googleapis`: Para conectar con Google Drive API.
    *   `node-cron`: Para programar la tarea a las 3:00 AM.
    *   `archiver`: Para comprimir los dumps en formato ZIP.
    *   `child_process`: Para ejecutar `pg_dump` y `mongodump`.

2.  **Infraestructura (Docker):**
    *   Actualiza mi `Dockerfile` para instalar las herramientas de línea de comandos `postgresql-client` y `mongodb-org-tools` (mongodump). Sin esto, Node.js no puede extraer los datos.

3.  **Lógica del Servicio (`backupService.js`):**
    *   Debe conectarse a las bases de datos usando variables de entorno (`PG_URI`, `MONGO_URI`).
    *   Debe generar un archivo `.zip` con nombre timestamped (ej. `backup-2024-10-25.zip`).
    *   Debe usar una **Service Account** de Google Cloud para autenticarse.
    *   Debe leer las credenciales desde una variable de entorno `GOOGLE_SERVICE_ACCOUNT_JSON` (puede ser el path al archivo o el JSON en string).
    *   Debe subir el archivo a una carpeta específica definida en `GOOGLE_DRIVE_FOLDER_ID`.

4.  **Limpieza:**
    *   Después de subir, debe borrar los archivos temporales locales para no llenar el disco del servidor.

**Entregables:**
*   Código del servicio de backup.
*   Snippet del Dockerfile actualizado.
*   Configuración del Cron Job en el archivo principal.
*   Instrucciones para obtener el `credentials.json` en Google Cloud Console.

---
