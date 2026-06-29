# Quest HQ Documentation

This folder is for source documentation only. Generated Vite output belongs in `dist/` and should not be committed.

## Structure

| Folder | Purpose |
| --- | --- |
| `qa/` | Manual and production QA checklists. |
| `archive/` | Older planning notes, prompts, and historical implementation notes. |

## Source Of Truth

- Product/runtime source: `src/`
- Serverless API handlers: `api/`
- Database migrations and schema notes: `supabase/`
- Vendored task runtime: `taskmanagement/`
- Tests: `tests/`
- Production deployment: Vercel using `npm run build`
