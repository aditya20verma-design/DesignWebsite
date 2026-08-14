# Agent Operating Manual

**Welcome, AI Agent / Antigravity.**
This is the repository-level instruction manual for this portfolio. 

Before making any meaningful changes to this repository, you **MUST** read the following files to understand the established systems and workflows:

1. **`AGENTS.md`** — (This file) Rules for AI agent behavior.
2. **`VERSIONING.md`** — The authoritative source for version-management, releases, and deployment.
3. **`DESIGN_SYSTEM.md`** — The single source of truth for all visual and design decisions.
4. **`ARCHITECTURE.md`** — The source of truth for the technical architecture and codebase structure.

After familiarizing yourself with the global architecture, read any relevant section-level documentation when working on a specific section.

## Golden Rules for AI Agents

1. **Never invent a new workflow if an existing repository workflow is documented.** 
2. **`VERSIONING.md` is the absolute and authoritative source for release/version procedures.** Do not devise alternative branching strategies, tag formats, or versioning schemes.
3. **Do not redesign the architecture.** Follow the patterns established in `ARCHITECTURE.md`.
4. **Do not create redundant systems.** If a problem can be solved within an existing file or configuration, use it. Do not create new documents or generators unless explicitly requested by the user.
5. **Always check the existing baseline.** Do not make assumptions about the current version, design tokens, or file structure without checking the current files and Git state.

## Pre-Release & Deployment Governance

Before any action involving:
- **PUSH LIVE**
- release
- deployment
- shipping
- version bump
- GitHub Release
- production publishing

The AI MUST:
1. Read `VERSIONING.md`.
2. Check `package.json` version.
3. Check `git status`.
4. Check the latest Git tag.
5. Follow `VERSIONING.md` exactly.
6. Never invent another release workflow.
