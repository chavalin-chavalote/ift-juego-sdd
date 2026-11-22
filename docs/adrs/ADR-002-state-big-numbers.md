# ADR-002: Estado y numeros grandes

## Estado
Aprobado.

## Decision
- El nucleo mantiene un `GameState` serializable y usa comandos puros.
- Zustand transporta estado al UI y crea snapshots; el core no importa React ni Zustand.
- La economia usa `decimal.js` o una API compatible basada en operaciones de precision decimal. Todos los valores economicos son cadenas decimales serializadas.
- Los multiplicadores se representan como factores separados y se aplican en el siguiente orden:
  1. mejoras aditivas dentro de cada categoria;
  2. multiplicadores multiplicativos entre categorias;
  3. multiplicadores globales de era/prestigio con rendimientos decrecientes.

## Ejemplo
```ts
type DecimalString = string;

interface BigNumber {
  mantissa: string;
  exponent: number;
}
```

En partida se guarda texto decimal; `BigNumber` solo es necesario si el simulador demuestra que la implementacion decimal no cumple memoria/rendimiento.

## Consecuencias
- Formateo K/M/B/cientifico vive en un modulo independiente.
- No se usa `Number` para dinero, coste, ingreso ni stock.
- Las comparaciones y compras pasan por helpers del core.
