# Modelo de balance (parametrizable)

Todos los valores son parámetros en `data/balance`, nunca constantes en código.

## Fórmulas base
- **Coste de nivel n:** `coste(n) = base × crecimiento^n` (crecimiento típico 1.07–1.25 según categoría).
- **Coste de comprar k niveles:** suma geométrica `base × g^n × (g^k − 1)/(g − 1)`.
- **Máximo asequible:** despeje cerrado de la suma geométrica (sin bucles).
- **Producción de una cadena:** `tasa = base × nivel × Π multiplicadores`; multiplicadores aditivos dentro de categoría, multiplicativos entre categorías.
- **Rendimiento de cultivo:** `beneficio/s = (cantidad × precio × calidad − coste_producción) / tiempo_crecimiento`.
- **Retorno de inversión (payback):** `payback = coste / Δingreso_por_segundo`.

## Objetivos de payback por tipo de compra
| Tipo | Payback objetivo | Espera para comprarla |
|---|---|---|
| Mejora pequeña (Era 1–2) | 10–60 s | segundos |
| Primeros edificios/trabajadores | 2–5 min | minutos |
| Automatización industrial | 10–25 min | decenas de minutos |
| Tecnología avanzada | 30–90 min | horas parciales |
| Infraestructura futurista | 1–4 h | objetivo a largo plazo |

## Control de la curva
- Cada era multiplica la escala de ingresos por ~`E` (parámetro, p. ej. 50–200×) y el coste de entrada por ~`E×c`.
- **Anti-ruptura:** multiplicadores globales con rendimientos decrecientes; una mejora no supera X% del ingreso total (validado por simulador).
- **Anti-muro:** el simulador falla el build si el tiempo hasta la siguiente compra "alcanzable" supera el umbral por perfil.

## Mantenimiento
`mantenimiento/s = Σ(coste_edificio × m)` con `m` pequeño; nunca puede hacer el ingreso neto negativo permanente (clamp + aviso).

## Offline
`ganancia_offline = tasa_automatizada × min(ausencia, cap) × eficiencia_offline`.

## Prestigio
`monedas = floor(k × (producción_histórica / umbral)^p)` con `p ≈ 0.5`; cada moneda da bonus global con rendimientos decrecientes.

## Perfiles del simulador
1. **Activo:** compra siempre lo más rentable, interactúa continuamente.
2. **Casual:** sesiones de 5 min, 3 veces/día, con offline.
3. **Idle puro:** abre una vez al día.

Salida: tiempo hasta cada hito, ingresos/s por era, compras en orden, detección de muros y de mejoras dominantes.
