# Hoja de balance v0

## Supuestos iniciales
- Dinero en unidades internas decimal.
- Tick economico: 100 ms.
- Era 1 comienza sin mantenimiento significativo.
- Multiplicadores globales de era pueden alcanzar 50-200x; los valores finales requieren simulacion.

## Curva de eras

| Era | Entrada objetivo | Ingreso/s inicial | Payback siguiente compra | Objetivo de escala |
|---|---:|---:|---|---:|
| 1 Manual | 0 | 0.1-0.25 | 10-60 s mejoras; 2-5 min trabajador | 1x |
| 2 Pequena granja | 500-2,000 | 1-10 | 2-5 min edificios; 10-25 min automatizacion | 50-100x |
| 3 Industrial | 50,000-500,000 | 50-500 | 10-25 min | 50-100x |
| 4 Inteligente | 5M-50M | 1K-10K | 30-90 min | 50-200x |
| 5 Imperio futurista | 1B-10B | 100K-1M | 1-4 h | 50-200x |

Los rangos son metas de diseno, no valores de implementacion. Los datos finales viven en `data/balance` y deben validar las tolerancias.

## Objetivos por perfil
- Activo: primera mejora en < 60 s; primer trabajador en 20-40 min.
- Casual: primer trabajador tras 3-5 sesiones de 5 min; sin muro > 15 min activos.
- Idle puro: progreso valido tras volver una vez al dia, limitando offline segun automatizacion.

## Ecuaciones
- Coste: `base * growth^level`.
- Compra xK: suma geometrica sin bucles.
- Rendimiento: `(quantity * sellPrice * quality - productionCost) / growthSeconds`.
- Payback: `cost / max(deltaIncomePerSecond, epsilon)`.

## Umbrales de simulacion
- Ningun perfil debe quedar sin compra alcanzable durante mas de 15 minutos hasta Era 4.
- Ninguna mejora puede aportar mas del 40% del ingreso total por si sola.
- El ratio del hito siguiente respecto al coste de entrada debe tener variacion acotada y gradual.
- Una simulacion falla si descubre soft-lock, dominancia o payback fuera de los rangos objetivos.
