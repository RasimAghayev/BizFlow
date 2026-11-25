# Technical Debt — BizFlow

Tracked per CLAUDE.md standing decision 1 (upgrade blockers) and general debt discovered during Phase 3 audit (2026-11-25).

## 1. Quality gates disabled at build time
`next.config.ts` sets `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }`. A real type error or lint violation will not fail the build. No blocker reason recorded by the original scaffold — this looks like a Firebase Studio default, not a deliberate decision.
**Owner-phase:** Phase 9 (hardener) / Phase 5 (container-engineer) should verify the build is clean without these flags before removing them in Docker, then remove.
**Status:** open, not yet touched.

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

## 5. Dead/inert `firebase` dependency
`firebase` (and its `@tanstack-query-firebase/react` wrapper) is installed with zero call sites in `src/`. Per decision 1 it still gets upgraded regardless of usage; per decision 6 it's a dead-code candidate for Phase 7 **only if** the business-case build-out (item 6 below) is declined — if approved, it becomes the real persistence dependency instead.
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
