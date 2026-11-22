# Especificación funcional (fuente de verdad)

> **Estado F00:** revisada y aprobada para implementación.

Prioridad: **M** = Must, **S** = Should, **C** = Could.

## 1. Mundo isométrico
- **REQ-WORLD-01 (M)** Cámara isométrica fija con zoom (rueda, pellizco, botones).
- **REQ-WORLD-02 (M)** Terreno en cuadrícula de parcelas; cada parcela tiene estado (bloqueada, vacía, cultivo, edificio).
- **REQ-WORLD-03 (M)** Selección de parcela/edificio por clic/tap con panel contextual.
- **REQ-WORLD-04 (M)** La granja crece físicamente al comprar parcelas y construir edificios.
- **REQ-WORLD-05 (M)** Cada era cambia visualmente la granja (paleta, edificios, props).
- **REQ-WORLD-06 (S)** Ciclo día/noche o ambiente ligero.

## 2. Cultivos
- **REQ-CROP-01 (M)** Ciclo visual: semilla → brote → crecimiento → maduro.
- **REQ-CROP-02 (M)** Atributos por cultivo: coste de semilla, tiempo de crecimiento, coste de producción, cantidad, precio de venta, rentabilidad, requisito de desbloqueo.
- **REQ-CROP-03 (M)** Cultivos: tomate, lechuga, zanahoria, patata, maíz, trigo, fresa, calabaza, con rentabilidades y estrategias distintas (rápido/barato vs. lento/rentable).
- **REQ-CROP-04 (S)** Calidad del cultivo como multiplicador de precio.

## 3. Acciones manuales (Era 1)
- **REQ-MAN-01 (M)** Plantar, regar, cosechar, transportar y vender manualmente.
- **REQ-MAN-04 (M)** La cosecha se almacena en un almacén; nunca se vende automáticamente al cosechar.
- **REQ-MAN-05 (M)** Enviar el almacén requiere un camión disponible. El camión carga hasta su capacidad y bloquea nuevos envíos hasta volver.
- **REQ-MAN-06 (M)** El almacén, la capacidad del camión y la duración del viaje tienen mejoras independientes por datos.
- **REQ-MAN-02 (M)** Feedback inmediato: partículas, números flotantes, sonido opcional.
- **REQ-MAN-03 (S)** Acciones en lote (arrastrar para plantar/cosechar varias parcelas).

## 4. Economía
- **REQ-ECO-01 (M)** Ingresos, costes de construcción, contratación, mantenimiento.
- **REQ-ECO-02 (M)** Costes con escalado exponencial parametrizable (ver `docs/balance-model.md`).
- **REQ-ECO-03 (M)** Multiplicadores aditivos y multiplicativos con orden de aplicación definido.
- **REQ-ECO-04 (M)** Hoja de balance interna con parámetros editables y simulador de ritmo.
- **REQ-ECO-05 (M)** Números grandes con formato legible (K, M, B, notación científica).
- **REQ-ECO-06 (S)** Mantenimiento que no pueda dejar la economía en negativo irrecuperable.

## 5. Mejoras
- **REQ-UPG-01 (M)** Categorías: velocidad, cantidad, calidad, precio, almacenamiento, transporte, eficiencia de trabajadores, eficiencia de maquinaria, automatización, investigación.
- **REQ-UPG-02 (M)** Cada mejora muestra: precio, nivel, efecto, beneficio esperado, siguiente coste, requisitos.
- **REQ-UPG-03 (M)** Compra x1, x10, x25 y máximo.
- **REQ-UPG-04 (M)** Cientos de mejoras definidas por datos, con niveles y desbloqueos.
- **REQ-UPG-05 (M)** Toda mejora tiene efecto real verificable por test.

## 6. Automatización
- **REQ-AUTO-01 (M)** Cadenas: plantar, regar, cosechar, transportar, gestionar, cada una con 3–4 niveles tecnológicos.
- **REQ-AUTO-02 (M)** Agentes visibles (trabajadores, tractores, drones, camiones) con IA de movimiento y colas de tareas.
- **REQ-AUTO-03 (M)** Una tarea automatizada funciona sin intervención del jugador.
- **REQ-AUTO-04 (M)** La simulación visual y la económica son coherentes (el rendimiento económico no depende de que el agente "llegue" a pantalla; ver plan §5).

## 7. Expansión
- **REQ-EXP-01 (M)** Compra de parcelas con coste creciente y forma/orden definidos.
- **REQ-EXP-02 (M)** Cada ampliación habilita tipos de edificio y cultivos.
- **REQ-EXP-03 (S)** Zonas temáticas (cultivo, logística, procesamiento).

## 8. Edificios y construcción
- **REQ-BLD-01 (M)** Cobertizos, almacenes, invernaderos, centros de distribución, centros logísticos, granjas verticales, complejos de procesamiento, centros de investigación.
- **REQ-BLD-02 (M)** Panel contextual: producción, estado, mejoras, costes.

## 9. Eras
- **REQ-ERA-01 (M)** 5 eras: Manual, Pequeña granja, Industrial, Inteligente, Imperio futurista.
- **REQ-ERA-02 (M)** Cada era introduce mecánicas, edificios, cultivos, agentes y un salto de escala.
- **REQ-ERA-03 (M)** Transición de era con ceremonia visual y desbloqueos claros.

## 10. Idle y offline
- **REQ-OFF-01 (M)** Guardado automático periódico y al cerrar/ocultar pestaña.
- **REQ-OFF-02 (M)** Cálculo offline solo con automatización realmente adquirida.
- **REQ-OFF-03 (M)** Límite de acumulación offline configurable + mejoras que lo amplían y mejoran eficiencia.
- **REQ-OFF-04 (M)** Pantalla de resumen al volver: tiempo ausente, ganancias, desglose.

## 11. Investigación, misiones y logros
- **REQ-RES-01 (M)** Árbol tecnológico con prerequisitos y coste en recurso de investigación.
- **REQ-QST-01 (M)** Misiones principales, secundarias, hitos, logros, desafíos económicos; recompensas.
- **REQ-QST-02 (M)** Los objetivos guían sin imponer un camino único.

## 12. Prestigio
- **REQ-PRE-01 (M)** Reinicio parcial a cambio de moneda permanente (calculada por producción histórica).
- **REQ-PRE-02 (M)** Tienda de prestigio: multiplicadores globales, reducción de costes, crecimiento, offline, tecnologías.
- **REQ-PRE-03 (M)** Opcional, no obligatorio, y cada ciclo debe ser más rápido.

## 13. Interfaz
- **REQ-UI-01 (M)** Barra superior: dinero, ingresos/s, producción total, nivel, recursos clave.
- **REQ-UI-02 (M)** Panel lateral: construcciones, cultivos, mejoras, automatización, investigación, expansión.
- **REQ-UI-03 (M)** Panel contextual del elemento seleccionado.
- **REQ-UI-04 (M)** Responsive escritorio/móvil (paneles colapsables/bottom-sheet en móvil).
- **REQ-UI-05 (S)** Ajustes: calidad gráfica, sonido, idioma (ES inicial), exportar/importar partida.

## 14. Persistencia y calidad
- **REQ-SAVE-01 (M)** Guardado local versionado con migraciones y verificación de integridad.
- **REQ-SAVE-02 (S)** Exportar/importar guardado; copia de seguridad rotativa.
- **REQ-QA-01 (M)** Suite de tests de economía, offline, guardado y desbloqueos.
- **REQ-QA-02 (M)** Simulador de balance con perfiles de jugador (activo, casual, idle puro).
- **REQ-QA-03 (M)** Presupuesto de rendimiento (FPS, memoria) verificado.

## Criterios globales de aceptación
- Ritmo objetivo: primeros minutos → primeras mejoras; ~30 min → primeros trabajadores/automatización; primeras horas → granja industrial; largo plazo → imperio y prestigio.
- Sin bloqueos económicos (soft-locks) en ningún perfil simulado.
