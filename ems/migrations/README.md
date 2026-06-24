# Database Migrations

This directory holds TypeORM migrations, run via `data-source.ts` at the repo root.

`synchronize` is now enabled automatically for `NODE_ENV !== 'production'` (see
`apps/api/src/app.module.ts`), so local/dev/test databases are created and kept
in sync from entity definitions without migrations.

In production, `synchronize` is disabled and `migrationsRun: true` applies
migrations from this directory on boot.

## Generating the initial migration

Requires a running Postgres instance reachable via `DATABASE_URL`
(`npm run docker:up` starts one locally):

```bash
npm run migration:generate -- migrations/InitSchema
```

This diffs the live database schema against all `*.entity.ts` definitions and
writes a migration file capturing the full schema.

## Generating subsequent migrations

After changing any entity, with the dev database running (and therefore
already synchronized to the new shape), generate a migration against a
database at the *previous* schema version — typically by running it against
a staging/CI database that has not yet received the entity change, or by
reverting `synchronize` temporarily and applying prior migrations first.

```bash
npm run migration:generate -- migrations/DescriptiveName
```

## Running / reverting

```bash
npm run migration:run
npm run migration:revert
```
