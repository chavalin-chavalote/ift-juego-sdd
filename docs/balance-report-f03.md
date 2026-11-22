# Informe de balance F03

## Validacion
- Build Vite/TypeScript: aprobado.
- Tests: 23 aprobados.
- Los ocho cultivos estan definidos y validados por datos.
- Multiplicadores probados con orden aditivo -> multiplicativo -> global.
- Mantenimiento probado con clamp anti-negativo.
- Las siete mejoras de vertical slice tienen efecto verificable.

## Simulacion v1 Eras 1-2
- Activo: Era 2 en 28 s; espera maxima registrada 6 s.
- Casual: Era 2 en 45 s; espera maxima registrada 10 s.
- Idle: Era 2 en 420 s; espera maxima registrada 60 s.
- Ningun perfil supera el umbral de 900 s para la siguiente compra alcanzable.
- Mejora dominante observada: `tomato_quantity`.

## UI
- Compra x1, x10, x25 y maximo.
- Precio, nivel, efecto, coste siguiente y requisito visible.
- Panel de siguiente objetivo cercano.

## Nota
El resultado v1 es una curva inicial de infraestructura. Fases posteriores deben recalibrar los datos al introducir edificios, trabajadores y nuevas eras.

## Correccion posterior de transporte
- Cosechar ya no vende: añade tomates al almacén con capacidad limitada.
- Enviar carga el camión disponible y deja el botón de venta bloqueado durante el viaje.
- El camión vende al volver y vuelve a quedar disponible.
- Mejoras independientes: almacén, capacidad del camión y velocidad del camión.
