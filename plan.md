# Plan técnico

> Propuesta aprobada en Fase 0. No hay código todavía.

## 1. Stack propuesto
| Capa | Elección | Motivo |
|---|---|---|
| Lenguaje | TypeScript estricto | Seguridad en un proyecto grande |
| Build | Vite | Rápido, estándar |
| UI | React | Paneles, listas de mejoras |
| Render 3D | Three.js vía React Three Fiber (cámara ortográfica) | Low-poly isométrico, instancing |
| Estado UI | Zustand (o similar) | Puente ligero núcleo↔UI |
| Big numbers | break_infinity.js / decimal.js | Economía tardía |
| Tests | Vitest + simulador propio | Balance reproducible |
| Persistencia | localStorage / IndexedDB + versionado | Offline y migraciones |
| Datos | JSON/TS tipados + validación (Zod) | Balance fuera del código |

Alternativa a evaluar: sprites isométricos 2D (PixiJS) si el rendimiento móvil de 3D es un riesgo.

## 2. Arquitectura por capas
```
src/
  core/        # lógica pura, sin DOM/Three/React
    economy/   production/   automation/   research/
    quests/    prestige/     offline/      save/   time/
  data/        # cultivos, mejoras, edificios, eras, misiones (config)
  render/      # escena, cámara, instancing, agentes visuales, VFX
  ui/          # componentes React, paneles, HUD
  app/         # composición, bootstrap, game loop
  tools/       # simulador de balance, validadores de datos
tests/
```
Regla: `core` no importa de `render`/`ui`. Dependencias solo hacia dentro.

## 3. Modelo de simulación
- **Paso fijo** (p. ej. 10 ticks/s) con acumulador; render a FPS libres con interpolación.
- Estado serializable único (`GameState`); el render lo lee, no lo muta.
- Comandos (acciones del jugador) → validación → eventos → estado. Eventos alimentan VFX, misiones y logros.
- Tiempo basado en timestamps reales para soportar pestaña en segundo plano.

## 4. Modelo de producción
- Producción **por capacidad/tasa** (no por entidad individual): cada cadena (plantar→regar→cosechar→transportar→vender) tiene tasa efectiva = mínimo de cuellos de botella, afectada por multiplicadores.
- Los agentes visuales **representan** la tasa; no la determinan. Esto garantiza coherencia offline y rendimiento con miles de agentes.

## 5. Offline
- Cálculo analítico por tramos: `ganancia = Σ(tasa_efectiva_tramo × duración)` limitado por cap y eficiencia offline.
- Solo cadenas totalmente automatizadas contribuyen. Tests con casos límite (cap, 0 automatización, cambios de era).

## 6. Guardado
- Formato: `{ version, savedAt, checksum, state }`. Migraciones encadenadas `vN → vN+1`. Backup rotativo. Export/import.

## 7. Rendimiento
- InstancedMesh para cultivos y props; pooling de partículas; LOD y calidad ajustable; límite de agentes simultáneos visibles.

## 8. Calidad y herramientas
- Linter, formateo, CI (tests + validación de datos + simulación de balance con umbrales).
- Informe de balance por fase (tiempo hasta cada hito por perfil).

## 9. Arte
- Low-poly generado por código (primitivas + materiales planos) como base para evitar dependencia de assets; ranura para modelos GLB posteriores.
- Una paleta por era; guía de estilo en Fase 0.
