# 🗺️ Roadmap - Filos Platform

Plan de mejoras para un negocio unipersonal. Enfocado en **automatización > complejidad**.

---

## ✅ Completado

### Sprint 1 - Dashboard "Esta Semana" (Completado 18/10/2025)
- [x] API endpoint `/api/v2/stats/dashboard/weekly`
- [x] Componente WeeklySummary (3 cards principales)
- [x] Componente UrgentActions con Sheet de detalles
- [x] Componente WeekCalendar (vista de 7 días)
- [x] Sistema de tabs (Esta Semana / General)
- [x] Links directos a órdenes/productos desde el Sheet
- [x] Clarificación de terminología (Entregas atrasadas vs Pagos vencidos)

**Beneficio**: Ver TODO lo urgente en un vistazo al abrir el dashboard.

---

## 🎯 Prioridad MÁXIMA - Ahorro de Tiempo

### 2. Alertas y Notificaciones Automáticas ⭐⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2-3 días
**Beneficio**: No revisar manualmente, recibir alertas proactivas

**Tareas**:
- [ ] Sistema de notificaciones por email (SendGrid/Resend)
- [ ] Email diario con resumen de urgencias
- [ ] Alertas de stock bajo automáticas
- [ ] Recordatorio de órdenes próximas a vencer
- [ ] Alerta de pagos vencidos

**Tech Stack**: SendGrid o Resend + Cron Jobs

---

### 3. Templates de Comunicación con Clientes ⭐⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2-3 días
**Beneficio**: No escribir el mismo mensaje 20 veces

**Tareas**:
- [ ] Sistema de templates en Settings
- [ ] Template: "Orden lista para recoger"
- [ ] Template: "Recordatorio de pago pendiente"
- [ ] Template: "Confirmación de orden recibida"
- [ ] Variables dinámicas ({nombre}, {monto}, {fecha})
- [ ] Integración con WhatsApp Business API (opcional)
- [ ] Preview de templates antes de enviar

**Tech Stack**: Base de datos para templates + Twilio para WhatsApp

---

### 4. Importación Masiva de Productos ⭐⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2 días
**Beneficio**: Cargar 100 productos en 5 minutos vs 2 horas manual

**Tareas**:
- [ ] Template Excel descargable con columnas correctas
- [ ] Endpoint para subir Excel
- [ ] Validación de datos con feedback visual
- [ ] Preview antes de confirmar importación
- [ ] Actualización masiva de precios
- [ ] Carga de imágenes por lote (ZIP)

**Tech Stack**: ExcelJS (ya instalado) + validación Zod

---

### 5. Generación Automática de Documentos ⭐⭐
**Estado**: 🟡 Parcial (ya existe PDF de orden)
**Tiempo estimado**: 1-2 días
**Beneficio**: PDFs profesionales con un clic

**Tareas**:
- [x] PDF de orden (ya existe)
- [ ] Factura automática con formato fiscal
- [ ] Remisión/Nota de entrega
- [ ] Etiquetas de envío mejoradas
- [ ] Plantillas customizables

**Tech Stack**: PDFKit (ya instalado)

---

## 🧠 Prioridad ALTA - Reducir Errores

### 6. Validaciones Inteligentes ⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 1-2 días
**Beneficio**: Prevenir errores al trabajar rápido

**Tareas**:
- [ ] Validar stock disponible al crear orden
- [ ] Alertar si precio especial > wholesale
- [ ] Detectar órdenes duplicadas (mismo buyer + productos similares)
- [ ] Validar fecha compromiso no sea pasado
- [ ] Advertir si stock quedará en negativo

---

### 7. Calculadora de Precios Rápida ⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 1 día
**Beneficio**: No usar calculadora externa

**Tareas**:
- [ ] Modal flotante de calculadora en crear orden
- [ ] "Si doy 15% descuento, ¿cuánto cobro?"
- [ ] "¿Cuánto ganancia me queda?"
- [ ] Sugerir precio basado en costo de hilo + % ganancia
- [ ] Historial de cálculos

---

### 8. Recordatorios Proactivos ⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2 días (depende de notificaciones)
**Beneficio**: No olvidar hacer seguimiento

**Tareas**:
- [ ] "Han pasado 3 días, ¿ya cobraste orden #123?"
- [ ] "Producto X lleva 60 días sin venderse"
- [ ] "Buyer Y no compra desde hace 2 meses"
- [ ] Sistema de recordatorios personalizados
- [ ] Snooze para recordatorios

---

## 📊 Prioridad MEDIA - Mejores Decisiones

### 9. Reportes Simples y Accionables ⭐⭐
**Estado**: 🟡 Parcial (existen reportes básicos)
**Tiempo estimado**: 2-3 días
**Beneficio**: Saber qué vender más, qué eliminar

**Tareas**:
- [x] Productos más vendidos (ya existe)
- [ ] ¿Qué productos NO se venden? (candidatos a liquidación)
- [ ] ¿Qué colores/tallas se venden más?
- [ ] ¿Cuál es mi margen real promedio?
- [ ] ¿Cuánto dinero tengo "atrapado" en inventario?
- [ ] Reporte semanal automático por email
- [ ] Dashboard de tendencias

---

### 10. Sistema de Cotizaciones ⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 3 días
**Beneficio**: No perder ventas por desorganización

**Tareas**:
- [ ] Crear cotización con vigencia
- [ ] Enviar por email/WhatsApp
- [ ] Tracking de estado (pendiente/aceptada/rechazada)
- [ ] Convertir a orden con 1 clic
- [ ] Ver tasa de conversión (cotizaciones vs ventas)
- [ ] Historial de cotizaciones por cliente

---

### 11. Historial de Interacciones con Cliente ⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2 días
**Beneficio**: Recordar conversaciones pasadas

**Tareas**:
- [ ] Notas rápidas por buyer
- [ ] Timeline de interacciones
- [ ] "La última vez compró 50 piezas de color rojo"
- [ ] "Prefiere pagar a 30 días"
- [ ] Tags para categorizar clientes
- [ ] Búsqueda de notas

---

## 🎨 Prioridad BAJA (pero útil)

### 12. Búsqueda Global (Cmd+K) ⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2 días
**Beneficio**: Encontrar rápido sin navegar

**Tareas**:
- [ ] Command palette (Cmd+K)
- [ ] Buscar productos por nombre/ID
- [ ] Buscar órdenes por nombre/buyer
- [ ] Buscar compradores
- [ ] Navegación rápida a páginas
- [ ] Atajos de teclado

**Tech Stack**: cmdk library

---

### 13. Copiar Orden Anterior ⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 1 día
**Beneficio**: Clientes frecuentes repiten pedidos

**Tareas**:
- [ ] Botón "Reordenar" en detalle de orden
- [ ] Crear nueva orden con mismos productos
- [ ] Permitir ajustar cantidades antes de crear
- [ ] Mantener mismo tipo de precio

---

### 14. Vista de Producción ⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 2 días
**Beneficio**: Planificar producción semanal

**Tareas**:
- [ ] Ver todas las órdenes pendientes
- [ ] ¿Cuántos sweaters de cada tipo producir?
- [ ] Consolidar producción semanal
- [ ] Lista de materiales necesarios (hilo por color)
- [ ] Orden de producción imprimible

---

## 🔧 Features Técnicas Necesarias

### 15. Backups Automáticos ⭐⭐⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 1 día
**Beneficio**: Proteger TU NEGOCIO

**Tareas**:
- [ ] Backup diario automático de MongoDB
- [ ] Backup semanal de imágenes en MinIO
- [ ] Descarga manual cuando quieras
- [ ] Cron job automatizado
- [ ] Notificación de backup exitoso
- [ ] Punto de restauración

---

### 16. Testing Básico ⭐
**Estado**: 🔴 Pendiente
**Tiempo estimado**: 3-4 días
**Beneficio**: No romper lo que funciona

**Tareas**:
- [ ] Tests de API endpoints críticos
- [ ] Test de cálculos de precios/totales
- [ ] Tests de órdenes (crear, actualizar)
- [ ] Tests de inventario
- [ ] CI/CD básico con GitHub Actions

**Tech Stack**: Vitest + Playwright

---

## 📈 Métricas de Éxito

### Tiempo Ahorrado (Objetivo):
- **Dashboard + Alertas**: 30-45 min/día
- **Templates automáticos**: 1-2 horas/semana
- **Importación masiva**: 3-4 horas cuando hay nuevo inventario
- **Validaciones**: Evita 2-3 errores/semana

**Total estimado: 10-15 horas/semana ahorradas**

---

## 🗓️ Cronograma Sugerido

### Mes 1
- ✅ Dashboard "Esta Semana"
- [ ] Alertas automáticas
- [ ] Templates de comunicación
- [ ] Backups automáticos

### Mes 2
- [ ] Importación masiva
- [ ] Validaciones inteligentes
- [ ] Calculadora de precios
- [ ] Reportes avanzados

### Mes 3
- [ ] Sistema de cotizaciones
- [ ] Recordatorios proactivos
- [ ] Búsqueda global
- [ ] Testing básico

### Mes 4
- [ ] Historial de cliente
- [ ] Copiar orden anterior
- [ ] Vista de producción
- [ ] Optimizaciones varias

---

## 🎯 Próximo Feature a Implementar

**Recomendación**: **Alertas y Notificaciones Automáticas**

**Por qué primero**:
1. Complementa perfecto el dashboard que acabamos de hacer
2. Alto impacto inmediato (ahorra 30-45 min/día)
3. Relativamente rápido de implementar (2-3 días)
4. No requiere cambios grandes en el código existente

**¿Empezamos con esto?**

---

## 📝 Notas

- Priorizar features que **ahorren tiempo** sobre features "nice to have"
- Cada feature debe tener ROI claro en horas ahorradas
- Mantener la plataforma simple y fácil de usar
- Automatizar procesos repetitivos
- Reducir errores humanos con validaciones

---

**Última actualización**: 18 de octubre, 2025
**Dashboard completado**: ✅ 100%
**Total features pendientes**: 15
**Tiempo total estimado**: ~30-40 días de desarrollo
