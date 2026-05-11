# Design audits — LidxiOS

Auditorías de diseño del producto. Cada auditoría es un snapshot del estado del diseño en una fecha específica, contra el estado del producto implementado en código.

## Para qué sirven

- **Documentar decisiones de diseño** y su justificación
- **Visibilizar deuda de diseño** (pantallas v1 pendientes de refactor)
- **Planificar sprints** con base en evaluación, no en intuición
- **Onboarding** de nuevos desarrolladores: qué se hizo, por qué y qué falta

## Política

- Una auditoría completa cada cambio mayor de sistema visual (v1→v2, v2→v3, etc.)
- Una mini-auditoría puntual cuando se cuestiona una decisión específica
- Cada auditoría se nombra `YYYY-MM-DD-{propósito}.html`
- Las auditorías NO se borran cuando se vuelven obsoletas — son histórico, sirven para entender la evolución

## Cómo verlas

Abrir cualquier `.html` directamente en navegador:

```bash
open docs/design-audits/2026-05-11-audit-v1-to-v2.html
```

Los archivos importan `tokens.css` que vive en la misma carpeta (copia de `packages/tokens/src/tokens.css` al momento de la auditoría).

## Inventario

| Archivo | Fecha | Propósito | Resultado clave |
|---|---|---|---|
| `2026-05-11-audit-v1-to-v2.html` | 2026-05-11 | Auditoría de 12 pantallas existentes contra sistema visual v2 | 6 alineadas, 3 con divergencias menores, 3 a refactor. 5 sprints planificados. 6 pantallas nuevas identificadas. |