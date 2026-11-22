# Riesgos y decisiones pendientes

## Riesgos
| ID | Riesgo | Mitigación |
|---|---|---|
| R1 | Rendimiento 3D en móvil | Instancing, LOD, modo calidad baja; alternativa 2D (PixiJS) |
| R2 | Balance roto por multiplicadores | Simulador en CI, rendimientos decrecientes |
| R3 | Alcance gigantesco | Vertical slice y fases con DoD estrictas |
| R4 | Arte low-poly sin assets | Generación procedural + ranura para GLB |
| R5 | Desfase visual vs económico | Producción por tasa; agentes solo representan |
| R6 | Pérdida de partidas | Versionado, migraciones, backups |

## Preguntas abiertas (a resolver en F00)
1. ~~¿3D (R3F) o sprites isométricos 2D?~~ Resuelto: R3F con PixiJS como fallback.
2. ~~¿Idioma(s)?~~ Resuelto: ES al inicio con i18n preparado.
3. ~~¿Sonido y música desde el inicio?~~ Resuelto: sistema opcional desde F02, activos propios pospuestos.
4. ~~¿Monetización o puramente gratuito/offline?~~ Resuelto: gratuito/offline sin monetización definida en alcance inicial.
5. ~~¿Alojamiento estático y PWA instalable?~~ Resuelto: objetivo PWA sobre hosting estático.
6. ~~¿Los trabajadores se contratan por unidad o por "equipos"?~~ Resuelto: unidades contratables por tarea; equipos como mejora opcional posterior.

## Registro de decisiones
| ID | Decision | Evidencia |
|---|---|---|
| DEC-001 | Render R3F isométrico | `docs/adrs/ADR-001-render.md` |
| DEC-002 | Estado puro + Zustand + decimal.js | `docs/adrs/ADR-002-state-big-numbers.md` |
| DEC-003 | IndexedDB/localStorage versionado | `docs/adrs/ADR-003-save-format.md` |
| DEC-004 | ES inicial e i18n preparado | Sin alcance de localización adicional en F02 |
| DEC-005 | PWA gratuita sin IAP | Sin red ni monetización obligatoria |
