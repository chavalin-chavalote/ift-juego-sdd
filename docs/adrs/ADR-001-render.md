# ADR-001: Render 3D isometrico

## Estado
Aprobado para F01/F02.

## Decision
Usar React Three Fiber con Three.js y cámara ortografica 2.5D. El arte base sera low-poly procedural.

## Motivos
- Cumple el requisito de mundo como protagonista y cambios visuales por era.
- Instancing, LOD y pooling permiten escalar el vertical slice sin dependencias externas de arte.
- React puede seguir siendo responsable de UI sin acoplarse al nucleo.

## Criterios de aceptacion
- Escritorio: 60 FPS objetivo.
- Movil gama media: 30+ FPS con calidad media.
- Presupuesto inicial: <= 1500 entidades instanciadas visibles, <= 40 agentes visibles y <= 512 KB/s de codigo de render adicional en el cambio visual de era.
- Si no se alcanza 30 FPS tras instancing/LOD, se adopta PixiJS como fallback 2D isometrico sin cambiar el core.

## Consecuencias
- Todo lo visible se deriva de `GameState`; el render no muta economia.
- Se reserva una representacion GLB opcional sin acoplar datos de balance a assets.
