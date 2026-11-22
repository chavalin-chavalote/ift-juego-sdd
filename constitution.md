# Constitución del proyecto

> **Estado F00:** aprobada como regla no negociable.

## Principios de producto
- **P1. El mundo es la interfaz.** La granja isométrica es protagonista; la UI nunca la oculta.
- **P2. Nada decorativo.** Si está en la UI, funciona de verdad. Prohibidos botones/valores simulados.
- **P3. Siempre hay algo que hacer.** Siempre existe una mejora alcanzable en un tiempo razonable.
- **P4. Cada era es un salto visual y mecánico.**
- **P5. La automatización tiene impacto real y visible** (trabajadores, tractores, drones se mueven).

## Principios de ingeniería
- **E1. Lógica separada de la representación.** El núcleo (`core`) no conoce Three.js, React ni el DOM.
- **E2. Simulación determinista y desacoplada de FPS.** Basada en tiempo (delta/timestamps), con paso fijo.
- **E3. Todo dato de balance vive en configuración**, no en código (cultivos, mejoras, costes, eras).
- **E4. Guardado versionado con migraciones.** Nunca se rompe una partida existente.
- **E5. Números grandes seguros** (librería de big numbers); nunca `Number` nativo para economía tardía.
- **E6. Módulos pequeños e independientes**: economía, producción, automatización, guardado, offline, prestigio.
- **E7. Todo sistema de núcleo tiene tests automatizados**, incluido un simulador de balance.
- **E8. Rendimiento:** objetivo 60 FPS en escritorio, 30+ FPS en móvil de gama media (instancing, pooling).

## Reglas de balance
1. Ninguna mejora invalida a las demás.
2. Ningún muro de espera > ~15 min de tiempo activo sin alternativa (hasta Era 4).
3. Precios y beneficios solo se fijan tras simulación.
4. No hay ingreso offline de procesos no desbloqueados.

## Proceso
- Spec → Plan → Tareas → Implementación → Verificación contra criterios de aceptación.
- Cada fase termina con demo jugable + informe de simulación de balance.
- Cambios de alcance se registran en `docs/risks-and-questions.md` (sección Decisiones).
