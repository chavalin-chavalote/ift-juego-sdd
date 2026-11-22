# Informe de prototipo F02

## Resultado
- Aplicacion Vite/React/R3F disponible en modo desarrollo.
- Escena isometrica ortografica, 16 parcelas y seleccion interactiva.
- Ciclo tomate completo: semilla, brote, crecimiento y maduro.
- Acciones manuales plantado, riego, cosecha, transporte y venta.
- Panel contextual, HUD y siete mejoras de Era 1.
- Feedback con textos flotantes y pulso visual de cosecha.
- Controles de zoom por rueda y botones.

## Validacion
- TypeScript estricto: aprobado.
- Build Vite: aprobado.
- Tests: 20 aprobados.
- Cobertura global: 86.24% statements, 93.50% lines.
- Servidor local: HTTP 200 en la ruta principal.
- Simulador activo de 30 minutos: aprobado.

## Perfil inicial
- El asset 3D base usa primitivas y un unico plano instanciado por escena; no hay carga de assets externa.
- Presupuesto inicial prudente: 16 parcelas visibles y sin agentes simultaneos.
- El bundle es 1.185 MB antes de gzip por el motor 3D; queda como deuda de rendimiento a validar en navegador y dividir por rutas posteriores.
- El objetivo de 60 FPS requiere medicion real con DevTools/telemetria en F10.
