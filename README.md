# Idle Farm Tycoon: Proyecto SDD (Spec-Driven Development)

Juego web Idle/Incremental isométrico 2.5D: de 4 tomates a un imperio agrícola futurista.

> **Estado:** Fase 1 completada. Motor headless implementado y testeado; la siguiente fase puede comenzar sin ambigüedad técnica.

## Cómo funciona este SDD
1. `constitution.md`: principios no negociables (calidad, arquitectura, balance).
2. `spec.md`: QUÉ se construye (requisitos con ID y criterios de aceptación). Es la fuente de verdad.
3. `plan.md`: CÓMO se construye (stack, arquitectura, módulos, decisiones).
4. `roadmap.md`: ORDEN de construcción (fases con dependencias).
5. `phases/Fxx-*.md`: cada fase con alcance, specs detalladas, tareas y *Definition of Done*.
6. `docs/`: modelo de balance, glosario, riesgos y preguntas abiertas.

**Regla de oro:** ninguna tarea se implementa sin requisito (`REQ-*`) en `spec.md`; ningún cambio de comportamiento sin actualizar primero la spec.

## Índice
| Archivo | Contenido |
|---|---|
| constitution.md | Principios y reglas del proyecto |
| spec.md | Especificación funcional completa |
| plan.md | Plan técnico y arquitectura |
| roadmap.md | Mapa de fases y dependencias |
| phases/F00…F10 | Detalle y tareas por fase |
| docs/balance-model.md | Fórmulas parametrizables de economía |
| docs/risks-and-questions.md | Riesgos y decisiones pendientes |
