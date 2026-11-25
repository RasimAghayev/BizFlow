# Technical Debt — BizFlow

Tracked per CLAUDE.md standing decision 1 (upgrade blockers) and general debt discovered during Phase 3 audit (2026-11-25).

## 1. Quality gates disabled at build time
`next.config.ts` set `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }`. A real type error or lint violation would not fail the build. No blocker reason was recorded by the original scaffold — this looked like a Firebase Studio default, not a deliberate decision.
**Owner-phase:** Phase 5 (container-engineer).
**Status:** being verified in Docker this pass (removed both flags, testing whether `next build` still succeeds cleanly before committing the removal — see `docs/BASELINE.md` for the actual result).

## 1b. `npm ci` fails under strict peer resolution
Documented in full in `docs/DEPENDENCY_DECISIONS.md`. Short version: `@genkit-ai/next`'s peer dep wants `zod@^3.24.1`; the root project is on `zod@^4.0.0` (a merged security bump). `npm ci --legacy-peer-deps` unblocks the Docker build as a documented workaround; the cleaner fix — removing the apparently-unused `@genkit-ai/next` — is flagged for Phase 7 to confirm and act on.
**Owner-phase:** Phase 5 (workaround, this pass), Phase 7 (real fix, pending tooling confirmation), Phase 6 (re-evaluate every dependency cycle per decision 1).
**Status:** open, workaround in place.

## 2. Zero test coverage
No tests exist anywhere in the repo. Phase 5 must add minimal characterization tests for whatever currently renders (static shell + hardcoded calendar mock) since there is no existing automated check to use as a regression baseline.
**Owner-phase:** Phase 5 (characterization), Phase 11 (full suite).
**Status:** open.

## 3. Dependency vulnerabilities (not yet a blocker — logged for Phase 6 tracking)
71 advisories found via a disposable-container `npm audit` (5 critical, 30 high, 32 moderate, 4 low), all transitive. Full table in `projects/info/deps/BizFlow.md`. None is a standing-decision-1 "blocker" yet — no attempt to upgrade has been made this pass, so there's nothing to record as blocked. This entry exists so Phase 6 has a named starting point rather than rediscovering the count from scratch.
**Owner-phase:** Phase 6.
**Status:** open, no blocker filed (upgrade attempt not yet made).

## 4. Major-version dependency debt
Eleven direct dependencies are one or more semver majors behind latest stable (next 15→16, react/react-dom 18→19, firebase 11→13, @hookform/resolvers 4→7, react-day-picker 8→10, date-fns 3→4, lucide-react 0→1, recharts 2→3, tailwindcss 3→4, @tanstack-query-firebase/react 1→2, typescript 5→7). None has been attempted yet; see the upgrade order in `projects/info/deps/BizFlow.md`.
**Owner-phase:** Phase 6.
**Status:** open.

## 5. Dead/inert dependencies: `firebase`, `@tanstack-query-firebase/react`, `@genkit-ai/next`
All three are installed with zero call sites in `src/` (verified by grep for each). Per decision 1 they still get upgraded regardless of usage; per decision 6 `firebase`/`@tanstack-query-firebase/react` are dead-code candidates for Phase 7 **only if** the business-case build-out (item 6 below) is declined — if approved, they become real persistence dependencies instead. `@genkit-ai/next` is a separate case: it's the actual source of the item-1b peer conflict and looks safely removable regardless of the business-case decision (it's a Next.js route-handler integration this app has no route handler for) — Phase 7 should confirm with `depcheck`/`knip` and remove it independent of how item 6 resolves.
**Owner-phase:** Phase 6 (upgrade regardless), Phase 7 (remove-or-keep decision, conditional on item 6).
**Status:** open, blocked on the business-case decision for the remove-or-keep call.

## 6. Unimplemented declared business case (scope-origination, parked)
Not technical debt in the "broken code" sense — the declared ERP feature set (dashboard data, persistence, real routes for Calendar/Revenue/Expenses, wiring the existing AI flow into the form) was never built beyond a static UI shell. Flagged `needs-approval` in `projects/info/state/APPROVALS.md` (2026-11-25) rather than silently built, since it's new scope, not a fix. See `docs/REPOSITORY_AUDIT.md`'s "Scope-origination flag" section.
**Owner-phase:** parked pending Rasim's decision; downstream of that, Phase 8B/architecture-equivalent rigor if approved.
**Status:** needs-approval.

## 7. No license declared
No `LICENSE` file, no `"license"` field in `package.json`.
**Owner-phase:** Phase 15.
**Status:** open.
