# Wireframes v0

## Escritorio

```text
+----------------------------------------------------------------+
| Dinero | ingreso/s | produccion | era | investigacion | ajustes |
+----------------------------------------------------------------+
| Mundo isometrico                                      | Panel |
|                                                       | actual |
| [parcelas/edificios/agentes]                         |-------|
|                                                       | X1 X10 |
|                                                       | X25 MAX|
|                                                       | acciones|
|                                                   [seleccion] |
+----------------------------------------------------------------+
| Construir | Cultivos | Mejoras | Automatizacion | I+D | Expandir|
+----------------------------------------------------------------+
```

## Movil

```text
+------------------------------+
| Dinero | ingreso/s | ajustes |
+------------------------------+
|                              |
| Mundo isometrico             |
|                              |
|                              |
|          + Bottom sheet      |
+------------------------------+
| Construir Cultivos Mejoras I+D|
+------------------------------+
```

## Estados obligatorios
- Seleccion vacia: mostrar informacion de la parcela y acciones disponibles.
- Seleccion de cultivo: etapa, rendimiento y acciones.
- Seleccion de edificio: produccion, mantenimiento, mejoras.
- Compra: coste exacto, efecto, siguiente coste y confirmacion solo para acciones irreversibles.
- Offline: tiempo ausente, ganancia, desglose y limite aplicado.
