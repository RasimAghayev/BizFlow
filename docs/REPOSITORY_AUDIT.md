# Repository Audit — BizFlow

Phase 3, 2026-11-25. Full findings and methodology in `projects/info/analysis/BizFlow.md` (program-level, outside this repo). This file is the in-repo mirror required by the docs standard.

## Scope of this audit
Read every source file under `src/`, `docs/blueprint.md`, `package.json`, `next.config.ts`, `.env.example`, `metadata.json`, `.agents/`. Ran a full-history `gitleaks` scan (via the mirror backup) and an `npm audit` (via a disposable `node:22-alpine` container — never a host-installed `npm`, per the Docker-first standard). No code was executed on the host at any point.

## Summary
A Firebase-Studio-generated Next.js scaffold for a declared but unimplemented business case (small-business ERP: dashboard, revenue/expense logging, appointment calendar, AI transaction categorization — verbatim from `docs/blueprint.md`'s "Original User Request"). The UI shell renders; none of the four features actually function end-to-end:

| Feature (declared) | Status |
|---|---|
| Dashboard summary | Static placeholder (`<BarChart className="h-32 w-full" />` with a comment `{/* Placeholder for summary charts */}` — not fed by any data) |
| Revenue/Expense logging | Form renders, **no submit handler**, nothing persists |
| Appointment calendar | Renders **hardcoded mock data** (`getAppointments()` always returns the same 2 fake entries, docblock says `TODO: Implement this by calling an API`) |
| AI-powered categorization | Fully implemented as a Genkit flow, but **never called** from the form |

## Findings by severity

**P0**
- `next.config.ts`: `typescript.ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true`. The build succeeds regardless of type or lint errors — a silent quality-gate bypass. Recommend removing both once Phase 5/9 can verify the build is actually clean without them (don't flip them off blind — confirm first in Docker that the build still passes).

**P1**
- 71 dependency advisories found via container `npm audit` (5 critical, 30 high, 32 moderate, 4 low) — see `projects/info/deps/BizFlow.md` for the full breakdown and upgrade order. All are transitive; none are direct dependencies.
- No `.gitignore` coverage for `.env*`/`.idea`/editor swap files existed before this pass (fixed in Phase 4, PR #29 — no real secret was ever actually committed; `gitleaks` over full history: 0 leaks).

**P2**
- Three of four sidebar nav links (`/calendar`, `/revenue`, `/expenses`) point at routes that don't exist (404). This is current, if broken, behavior — not fixed here; building real routes is scope-origination (see below), not a bug fix, since there was never a working version to regress to.
- `firebase` is a direct dependency with zero call sites anywhere in `src/` (verified by grep for `initializeApp`/`getFirestore`/`getAuth`/`httpsCallable` — no matches). Decision 1 still requires upgrading it to latest regardless of usage.
- No tests exist anywhere in the repo (no `*.test.*`, `*.spec.*`, or `__tests__`).

**P3**
- `README.md` is the stock Firebase Studio template, never edited to describe what BizFlow actually is.
- No CI, no Docker, no `CHANGELOG.md`.

## Legal / license risk
`package.json` has no `"license"` field; no `LICENSE` file exists in the repo yet. Repo is private, so this isn't a distribution risk today, but a license should still be chosen deliberately in Phase 15 per the Community Standards checklist.

## Scope-origination flag (read before starting Phase 4+ on this repo's *business* behavior)
Building out any of the four unimplemented features — persistence, real routes, wiring the AI flow — is new functionality, not preservation of what's there. This audit does not propose that build-out for approval; it is logged as a parked decision in `projects/info/state/APPROVALS.md` (2026-11-25, BizFlow rows) for Rasim to resolve. Until resolved, the **Phase 5 baseline is the current UI-shell behavior as described above**, not the aspirational ERP — all Phase 4-11 work in this run modernizes and hardens what exists without silently building the unapproved feature set.
