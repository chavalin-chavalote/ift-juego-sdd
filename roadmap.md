# Roadmap por fases

| Fase | Nombre | Entregable jugable | Depende de |
|---|---|---|---|
| F00 | Fundamentos y diseño | Documentos aprobados, ADRs, hoja de balance v0 | — |
| F01 | Núcleo de simulación (headless) | Motor con tests, sin gráficos | F00 |
| F02 | Prototipo jugable Era 1 | Granja isométrica, tomates manuales, venta, UI mínima | F01 |
| F03 | Economía y mejoras | Sistema de mejoras x1/x10/x25/max, cultivos, simulador de balance | F02 |
| F04 | Era 2: Pequeña granja | Primeros trabajadores, parcelas, expansión, 4 cultivos | F03 |
| F05 | Persistencia, offline y objetivos | Guardado robusto, offline, misiones, logros | F04 |
| F06 | Era 3: Industrial | Tractores, cosechadoras, invernaderos, camiones | F05 |
| F07 | Era 4: Inteligente | Drones, robots, IA de cultivos, camiones autónomos | F06 |
| F08 | Era 5 e Investigación | Imperio futurista, árbol tecnológico completo | F07 |
| F09 | Prestigio | Moneda permanente, tienda, rebalance | F08 |
| F10 | Pulido, móvil y release | Rendimiento, UX móvil, QA final, balance final | F09 |

## Hitos de verificación
- **M1 (fin F02):** "Se puede jugar 5 minutos y es divertido."
- **M2 (fin F04):** primeros 30 min completos con automatización parcial.
- **M3 (fin F06):** primeras horas con granja industrial.
- **M4 (fin F08):** juego completo de principio a fin sin prestigio.
- **M5 (fin F10):** candidato a release.

## Estrategia
Vertical slice temprano (F02) para validar sensación de juego y estilo visual antes de invertir en contenido. Los datos de balance se ajustan siempre con el simulador (F03 en adelante).
