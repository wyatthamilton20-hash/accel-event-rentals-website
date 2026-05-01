## Keep README.md in sync

`README.md` is the canonical entry point for the human dev team that will eventually take over this codebase. Keep it accurate as work progresses.

When you change any of the following, update `README.md` in the same commit:
- **Env vars** (added/removed/renamed) → update the env-vars table and `.env.example`.
- **Scripts** in `package.json` → update the Scripts section.
- **Routes** (new page, new API route, removed route, redirect added) → update the Routes table.
- **Tech stack** (framework upgrade, new major dependency, swapped service) → update Tech stack and any relevant section.
- **Project structure** (new top-level dir, moved subsystem) → update the structure tree.
- **Conventions** (new global rule, e.g. brand color change, new "don't do X" guardrail) → update Key conventions.
- **Branch strategy** (branch cut, branch merged, branch deleted, strategy decided) → update Branch strategy.
- **Deployment** (domain change, project rename, build command change) → update Deployment.

Do not update the README for: internal refactors, bug fixes that don't change public behavior, content/copy edits, or styling-only tweaks.

If a change is ambiguous, prefer updating the README — it's cheaper to keep it slightly over-documented than to let it drift.
