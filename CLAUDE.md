# Claude Config Manager

A Next.js application for managing Claude Code settings across all configuration scopes.

## What it does

Provides a React UI to view, add, delete, and move Claude Code settings between:
- **Global** — `~/.claude/settings.json`
- **User Local** — `~/.claude/settings.local.json` (machine-specific, gitignored)
- **Project** — `.claude/settings.json` (committed to git)
- **Project Local** — `.claude/settings.local.json` (project + machine specific, gitignored)

## Running locally

```bash
npm run dev
```
Then open http://localhost:3000

## Architecture

- `src/app/api/config/route.ts` — GET/PUT/DELETE for individual settings
- `src/app/api/config/move/route.ts` — POST to move a setting between scopes
- `src/lib/configPaths.ts` — maps scope names to filesystem paths
- `src/lib/configIO.ts` — read/write/delete helpers for settings files
- `src/types/config.ts` — shared TypeScript types
- `src/components/ConfigDashboard.tsx` — top-level UI, scope toggles, project path input
- `src/components/ScopePanel.tsx` — one column per scope
- `src/components/SettingRow.tsx` — individual setting with move/delete actions
- `src/components/AddSettingDialog.tsx` — modal for adding a new setting

## Key conventions

- API routes use Next.js App Router (`route.ts` files)
- All file I/O is server-side only (API routes); client components fetch via HTTP
- Settings files are read/written as JSON with 2-space indentation
