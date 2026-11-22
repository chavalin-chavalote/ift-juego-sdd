# Catalogo de datos v0

Todos los catalogos son JSON/TS tipados validados con Zod. Los identificadores son `snake_case` estables.

## Cultivo
Campos: `id`, `nameKey`, `eraId`, `seedCost`, `growthSeconds`, `productionCost`, `quantityPerCycle`, `sellPrice`, `unlock`, `visualStages`, `qualityRange`.

Validaciones:
- precios, costes y duraciones son positivos;
- `sellPrice >= 0`;
- desbloqueo referencia una era o mejora existente;
- `visualStages` contiene exactamente semilla, brote, crecimiento y maduro.

## Mejora
Campos: `id`, `nameKey`, `category`, `eraId`, `baseCost`, `growth`, `maxLevel`, `effect`, `unlock`, `visualImpact`.

Validaciones:
- crecimiento entre 1.01 y 2.0;
- nivel maximo >= 1;
- `effect` usa una formula registrada y parametros tipados;
- cada mejora tiene test verificando su efecto.

## Edificio
Campos: `id`, `nameKey`, `eraId`, `kind`, `baseCost`, `area`, `capacity`, `upkeepRate`, `unlock`, `visual`.

Validaciones:
- area >= 1;
- coste, capacidad y mantenimiento no negativos;
- `area` cabe en una parcela o plantilla rectangular definida;
- mantenimiento no convierte el ingreso neto permanente en negativo sin clamp.

## Agente
Campos: `id`, `nameKey`, `automationChain`, `eraId`, `hireCost`, `speed`, `capacity`, `unlock`, `visual`.

Validaciones:
- cadenas limitadas a plantar, regar, cosechar, transportar y gestionar;
- velocidad y capacidad positivas;
- el agente representa tasa; no cambia directamente el estado economico.

## Era
Campos: `id`, `index`, `nameKey`, `palette`, `unlockRequirement`, `entryCost`, `scaleMultiplier`, `mechanics`, `ceremony`.

Validaciones:
- indices consecutivos del 1 al 5;
- escala positiva;
- cada era declara al menos un cambio mecanico y visual.

## Mision
Campos: `id`, `nameKey`, `type`, `eraId`, `condition`, `reward`, `prerequisites`, `repeatable`.

Validaciones:
- condicion usa una expresion o operador registrado;
- recompensa valida (dinero, investigacion, desbloqueo);
- prerequisitos sin ciclos;
- misiones principales pueden durar pero no bloquear una alternativa economica.
