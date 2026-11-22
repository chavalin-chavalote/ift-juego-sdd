# Logística manual de tomates

## Flujo
1. Cosechar añade tomates al almacén.
2. El almacén tiene capacidad inicial de 40 tomates.
3. Enviar un camión carga como máximo su capacidad inicial de 20 tomates.
4. Mientras está en ruta, no puede enviarse otro camión ni puede añadirse una segunda venta.
5. Al volver, la carga se vende automáticamente y el camión queda disponible.

## Mejoras
- `warehouse`: capacidad del almacén; +25% por nivel.
- `truck_capacity`: capacidad del camión; +10 tomates por nivel.
- `truck_speed`: duración del viaje; -15% por nivel, mínimo 3 segundos.

## Invariantes
- Cosechar nunca modifica dinero.
- El stock almacenado no supera la capacidad.
- Un camión fuera no admite carga adicional.
- La venta solo ocurre en el evento de retorno del camión.
