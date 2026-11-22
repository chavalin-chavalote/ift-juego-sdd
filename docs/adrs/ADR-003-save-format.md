# ADR-003: Guardado y migraciones

## Estado
Aprobado.

## Decision
Usar IndexedDB como almacenamiento principal y localStorage como fallback. El formato es:

```json
{
  "format": "idle-farm",
  "version": 1,
  "savedAt": 0,
  "checksum": "hex",
  "state": {}
}
```

- `state` contiene todo el estado serializable necesario para reanudar.
- `checksum` verifica integridad accidental con un hash estable; no es seguridad.
- Cada cambio de esquema registra una migracion `vN -> vN+1`.
- Se conserva una copia secundaria rotativa de tres slots.
- Exportar/importar usa el mismo envelope y valida su version antes de aplicar.
- Al abrir una partida se ejecutan todas las migraciones encadenadas y se crea backup de la version original.

## Invariantes
- Una migracion es pura, determinista y testeada con fixtures.
- Versiones desconocidas/futuras se rechazan con mensaje claro.
- Cualquier guardado corrupto permite recuperar el ultimo backup valido.
