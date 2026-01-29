# 🛡️ Reporte de Seguridad y Vulnerabilidades

## Resumen Ejecutivo
- **Estado Actual:** El sistema base es seguro en términos de dependencias (`npm audit` limpio) y gestión de secretos (uso de variables de entorno).
- **Autenticación:** JWT con `bcryptjs` es estándar y seguro.
- **Exposición:** El servidor expone puertos para API y Webhooks.

## Hallazgos
1. **Secretos Hardcodeados:**
   - No se detectaron secretos activos en el código fuente.
   - *Nota:* Se encontraron variables "fallback" como `'dev_secret_key_123'` en el código. Aunque útiles para desarrollo, deben ser estrictamente sobreescritas en producción.

2. **Rate Limiting:**
   - **Riesgo Medio:** Actualmente no hay límite de peticiones en la API `/api/scrape`. Un usuario malintencionado podría saturar la cola de scraping.
   - **Recomendación:** Implementar `express-rate-limit`.

3. **CORS:**
   - **Riesgo Bajo:** `app.use(cors())` está abierto a `*` por defecto.
   - **Recomendación:** Restringir a dominios específicos en producción.

4. **Headers de Seguridad:**
   - **Riesgo Bajo:** Faltan headers HTTP de seguridad (HSTS, No-Sniff).
   - **Recomendación:** Usar `helmet`.

5. **Inyección de Comandos (Puppeteer):**
   - El input `niche` y `city` se usa en una URL de Google Maps.
   - `encodeURIComponent` está siendo usado correctamente: `https://www.google.com/maps/search/${encodeURIComponent(query)}`.
   - **Estado:** Mitigado.

## Acciones Inmediatas (Fase 5)
Se requiere una fase de "Hardening" para mitigar los riesgos de denegación de servicio (DoS) y reforzar los headers HTTP.
