# F01: Núcleo de simulación (headless)
**Objetivo:** motor del juego sin gráficos, totalmente testeable.
**Specs:** REQ-ECO-01..05, REQ-UPG-03, REQ-SAVE-01 (base), REQ-QA-01.

## Tareas
- [ ] T1.1 Estructura del repo, tooling, CI y reglas de dependencias (`core` aislado).
- [ ] T1.2 Módulo de tiempo: paso fijo, acumulador, soporte de pestaña inactiva.
- [ ] T1.3 Módulo de números grandes y formateo.
- [ ] T1.4 `GameState` serializable y sistema de comandos/eventos.
- [ ] T1.5 Módulo de economía: dinero, costes geométricos, compra x1/x10/x25/max (cierre analítico).
- [ ] T1.6 Módulo de producción por tasas y multiplicadores.
- [ ] T1.7 Carga de datos desde configuración con validación de esquema.
- [ ] T1.8 Guardado/carga v1 con versión y checksum.
- [ ] T1.9 Tests unitarios de todo lo anterior.
- [ ] T1.10 Simulador de balance v0 (perfil activo).

## Definition of Done
Se puede simular por línea de comandos una partida de Era 1 y ver tiempos de compra; cobertura de tests del núcleo > 80%.
