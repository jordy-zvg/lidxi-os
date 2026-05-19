# Reglas operativas para sesiones de Claude Code

Comandos que NUNCA se ejecutan sin autorización explícita del usuario en el chat de la sesión actual, regardless de cuán justificada parezca la acción:

## Git
- `git push` (cualquier variante)
- `git reset --hard`
- `git push --force` / `--force-with-lease`
- `git rebase` sobre commits ya empujados
- Cualquier modificación de history que afecte rama remota

## Supabase local
- `supabase stop --no-backup`
- `supabase db reset`
- `supabase stop` cuando hay data sintética de auditoría activa
- Eliminación de proyectos Supabase

## SQL destructivo
- `DELETE FROM auth.users` con o sin WHERE masivo
- `DROP TABLE` sobre cualquier tabla con data
- `TRUNCATE` sobre tablas con data
- Cualquier cambio de schema que rompa migrations previas

## Filesystem
- `rm -rf` con cualquier flag
- Eliminación de archivos en `.git/`, `node_modules/.cache/`, `apps/*/data/`
- Modificación de archivos en directorios marcados read-only

## Producción
- Cualquier comando que toque entornos no-local cuando existan (Railway, Vercel, Supabase cloud)
- Modificación de DNS records
- Cambios en variables de entorno de producción

## Protocolo cuando una tarea parezca requerir uno de estos comandos

1. Detente.
2. Reporta al usuario: qué comando crees que necesitas, por qué, qué riesgos tiene, qué alternativas no-destructivas existen.
3. Espera autorización explícita en el chat antes de ejecutar.
4. Si el usuario no responde y el comando no es urgente, pregunta si quiere posponer la tarea.
5. Si recibes autorización, ejecuta el comando exacto autorizado, ni más ni menos.

## Sobre la tentación de "arreglar rápido"

Cuando hay un error en curso y la solución parece obvia, ese es exactamente el momento de pausar y preguntar. Los errores en cascada vienen de "arreglo rápido sin consultar". El usuario prefiere 5 minutos de espera a 2 horas de cleanup post-error.
