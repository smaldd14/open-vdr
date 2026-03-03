## TypeScript

- Only create an abstraction if it’s actually needed
- Prefer clear function/variable names over inline comments
- Avoid helper functions when a simple inline expression would suffice
- Use `knip` to remove unused code if making large changes
- The `gh` CLI is installed, use it
- Don’t use emojis
- Don’t unnecessarily add `try`/`catch`
- Don’t cast to `any`


## Supabase

- Types are generated from the database schema
- After making schema changes, regenerate types:
  ```bash
  supabase gen types typescript --local > src/types/supabase.ts
  ```
- Migrations are in `supabase/migrations/`
- All DB queries and operations must live in `src/worker/db/` files, not inline in workflows or services
- Use `parseJsonb(schema, data, label)` from `src/lib/parse-jsonb.ts` when reading JSONB columns from the database — never cast with `as unknown as T`
- Define Zod schemas for JSONB column shapes in the relevant types file, and derive the TypeScript type via `z.infer<>`


## Dates

- Use `date-fns` for date manipulation
- DB timestamps use Postgres `timestamptz` and are stored in UTC
- Date-only fields (like `due_date`) use Postgres `date` type
- When displaying on the frontend, `src/react-app/lib/date-utils.ts` has helper functions

## Best Practices

- when a bug is reported, write a reproducing test first; then fix; then prove via passing test
- unless otherwise prompted, db migrations should always be done on local dev environments. e.g. `supabase db push --local`