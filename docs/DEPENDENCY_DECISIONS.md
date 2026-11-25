# Dependency Decisions — BizFlow

Per CLAUDE.md standing decision 3 (no new library before dependency analysis, with a written decision entry) and decision 1 (written blockers for upgrade exceptions). This file also covers conflict-resolution decisions on *existing* dependencies, not only new additions, since the first entry here is exactly that kind of case.

## 2026-11-25 — zod v3/v4 peer conflict between root project and genkit

**Situation:** `npm ci` on the currently-committed `package-lock.json` fails under strict peer-dependency resolution:
```
npm error ERESOLVE could not resolve
npm error While resolving: @genkit-ai/next@1.1.0
npm error Found: zod@4.6.7 ... peer zod@"^3.24.1" from @genkit-ai/next@1.1.0
```
`@genkit-ai/next` declares `peerDependencies: { zod: "^3.24.1" }` — confirmed true across every published version checked, including the current latest, `1.44.0` (queried live via `https://registry.npmjs.org/@genkit-ai/next`, 2026-11-25). The genkit ecosystem has not added zod v4 peer support as of this date. Meanwhile, commit `6048f62` ("chore(deps): update dependency zod to v4 [security]", a merged Renovate PR, predates this session) already bumped the root project to `zod@^4.0.0`.

**This conflict was already latent on `main` before this session** — it was not introduced by any work in this run. It was simply never surfaced, because nothing had run a clean `npm ci` under strict peer resolution (no CI, no Docker, no documented local dev flow existed before Phase 4/5 of this run).

**Decision:** Keep `zod@^4.0.0` (don't regress the security fix). Install with `npm ci --legacy-peer-deps` in the Docker `deps` stage to get a working build, rather than forcing a lockfile rewrite or pinning zod back to v3. Rationale:
- Downgrading to satisfy genkit's peer constraint would undo a dependency bump that was made specifically to fix a security advisory (standing decision 1 says latest/fixed wins by default).
- The actual code path this affects — `src/ai/flows/suggest-transaction-category.ts`'s Genkit flow — is **not currently called from anywhere in the application** (`src/app/page.tsx` never imports it; confirmed via `grep`). So today, a theoretical zod-v3-vs-v4 internal shape mismatch inside genkit's own schema handling has **zero live blast radius** — nothing exercises that code path in production.
- `--legacy-peer-deps` is npm's own documented escape valve for exactly this situation (recommended in its own error message), not a hidden hack.

**What this decision does NOT do:** it does not verify that genkit's internals actually behave correctly when handed a zod v4 schema instance at runtime — that would require either calling the AI flow for real (needs a live `GOOGLE_GENAI_API_KEY` and network, out of scope for a build-time check) or reading genkit's source closely enough to confirm v4 compatibility at the API-shape level. That verification gap is written down, not silently assumed fixed.

**Status:** open, re-attempted at the next Dependabot/Renovate cycle per decision 1's strengthened wording (3 consecutive still-blocked cycles → escalate to Rasim as a parked item). Upstream tracking: watch `@genkit-ai/next`/`genkit`/`@genkit-ai/core` release notes for zod v4 peer support — once available, drop `--legacy-peer-deps` and re-run a strict `npm ci` to confirm it resolves cleanly.

**Owner-phase:** Phase 6 (upgrader) re-evaluates this on every dependency pass; Phase 8B/the parked business-case decision (`projects/info/state/APPROVALS.md`) is where it would actually matter in practice, if the AI flow is ever wired into the live UI.

**Cleaner alternative, found while writing this entry:** `@genkit-ai/next` — the actual package whose `peerDependencies` triggers this conflict — has **zero imports anywhere in `src/`** (confirmed via `grep -r "genkit-ai/next" src/`, no matches; it's a Next.js route-handler integration for Genkit, and this app has no such route handler). Removing it would independently resolve the peer conflict without needing `--legacy-peer-deps` at all. Not done here: dependency removal based on usage evidence is Phase 7 (`cleaner`)'s job, with its own tooling-plus-test verification (decision 6 — "dead" is proven by tooling, not guessed by one grep). Flagged here as a concrete, likely-correct candidate for that phase to confirm with `depcheck`/`knip` and act on, rather than acted on mid-Phase-5.
