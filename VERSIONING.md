# Portfolio Version Management & Release Workflow

This document dictates the authoritative system for versioning and releasing the portfolio website. **AI agents must strictly follow these procedures and NEVER invent alternative version-management workflows.**

## Core Concepts

*   **Git commit ≠ version:** A commit is an atomic development milestone.
*   **Git tag = immutable version marker:** A Git tag (`vX.Y.Z`) officially stamps a specific state of the codebase.
*   **GitHub Release = human-readable milestone:** A GitHub Release is built around a tag, describing the meaningful changes for a human audience.
*   **Production deployment = deployed state associated with a release:** Deployment automatically happens upon pushing to the `main` branch. A release represents a stabilized point in this production history.

---

## Command Semantics

Future AI sessions must strictly interpret these phrases without reinterpretation:

*   **"Commit this"**
    *   Create a Git commit.
    *   Do NOT push.
    *   Do NOT deploy.
    *   Do NOT create a release.
*   **"Push this"**
    *   Push the current work to the configured remote.
    *   Do NOT create a version/release unless explicitly requested.
    *   **IMPORTANT:** `main` currently triggers production deployment through GitHub Actions, so pushing to `main` **will deploy to production**. 
*   **"PUSH LIVE"**
    *   **RESERVED COMMAND.** Execute the COMPLETE release + production deployment workflow (see below).
*   **"Create a release"**
    *   Same workflow as PUSH LIVE.
*   **"Ship this"**
    *   Same workflow as PUSH LIVE.

---

## Version Format & Selection

We use Semantic Versioning (SemVer) with a `v` prefix (`vMAJOR.MINOR.PATCH`, e.g., `v1.0.0`).

### PATCH (vX.Y.**Z**)
*Example: v1.0.0 → v1.0.1*
Use for: bug fixes, copy corrections, small spacing fixes, minor visual corrections, performance fixes, accessibility fixes, non-breaking corrections.

### MINOR (vX.**Y**.Z)
*Example: v1.0.0 → v1.1.0*
Use for: new portfolio sections, new features, new interactions, new components, meaningful design-system additions, backward-compatible additions.

### MAJOR (**vX**.Y.Z)
*Example: v1.0.0 → v2.0.0*
Use for: complete portfolio redesign, major navigation restructuring, fundamental visual-system replacement, major architecture migration.

**CRITICAL:** If the version impact is genuinely ambiguous, **STOP and ASK THE USER**. Never guess PATCH vs MINOR vs MAJOR.

---

## The "PUSH LIVE" Workflow

When the user says **PUSH LIVE**, the AI must follow this exact sequence:

**STEP 1 — READ GOVERNANCE**
Read `AGENTS.md` and `VERSIONING.md`. Treat `VERSIONING.md` as authoritative.

**STEP 2 — AUDIT CURRENT STATE**
Inspect `git status`, `git log`, `git tag`, current `package.json` version, and latest GitHub Release. Inspect the current diff. Do not release unrelated or suspicious changes. Do not silently revert user work. **If unrelated changes cannot safely be separated from the intended work: STOP and ask the user.**

**STEP 3 — DESIGN SYSTEM VALIDATION**
Run `npm run design:check`. This validates that `DESIGN_GUIDE.html` is synchronized with `DESIGN_SYSTEM.md`. If it fails, fix the documentation before continuing.

**STEP 4 — DETERMINE VERSION**
Compare the current work with the latest released version using the guidelines above (PATCH, MINOR, MAJOR). If ambiguous, STOP and ASK THE USER.

**STEP 5 — UPDATE VERSION**
Update `package.json` to the selected version.

**STEP 6 — UPDATE CHANGELOG**
Add the new release to `CHANGELOG.md` using categories (### Highlights, ### Experience, ### Fixes, ### Technical). Do not turn it into a development diary.

**STEP 7 — RELEASE VALIDATION (THE VERSION INVARIANT)**
Verify this invariant:
`package.json` = Git tag = GitHub Release = CHANGELOG
These MUST match exactly. Never create a mismatched release.

**STEP 8 — RELEASE COMMIT**
Create the commit: `chore(release): vX.Y.Z`

**STEP 9 — CREATE GIT TAG**
Create the tag: `vX.Y.Z`. The tag must point to the release commit.

**STEP 10 — PUSH**
Push the release commit and tag (`git push origin main`, `git push origin vX.Y.Z`).

**STEP 11 — CREATE GITHUB RELEASE**
Create the GitHub Release using `vX.Y.Z` and the corresponding CHANGELOG entry as the description.

**STEP 12 — DEPLOYMENT**
Because `main` triggers production deployment via GitHub Actions, the release push triggers deployment. Wait for and verify it where possible.

**STEP 13 — VERIFY LIVE VERSION**
Confirm that production is running the newly released version.

**STEP 14 — FINAL RESPONSE**
Report clearly:
*   RELEASED SUCCESSFULLY
*   Version: vX.Y.Z
*   Previous version: vA.B.C
*   Git tag: vX.Y.Z
*   GitHub Release: Created
*   Production: Deployed / Verified
*   Short summary of what changed.

---

## Immutable Releases

Once a version is released, it can never be reused or rewritten.
**Never:**
*   Move an existing release tag.
*   Delete and recreate an existing release tag.
*   Reuse a released version.
*   Modify an existing release to represent different code.
If a correction is required, bump to a new patch (e.g., `v1.1.0` → `v1.1.1`).

---

## Historical Baseline

Preserve the existing historical release:
**`v1.0.0 — BMW Hero Scroll & Interaction Polish`**
This is the baseline. Do not recreate or modify it. Future releases increment from it.

---

## System Relationship Matrix

*   **`DESIGN_SYSTEM.md`** = source of truth for visual/design decisions.
*   **`DESIGN_GUIDE.html`** = read-only visual representation of `DESIGN_SYSTEM.md`.
*   **`VERSIONING.md`** = source of truth for release/version workflow.
*   **`AGENTS.md`** = source of truth for how AI agents should operate.
*   **`ARCHITECTURE.md`** = source of truth for technical architecture.

These systems must not contradict each other.
