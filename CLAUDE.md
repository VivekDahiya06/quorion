# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Claude Code–specific notes

`AGENTS.md` (imported above) is the main project guide: stack, commands, folder structure, architecture, domain model, workflow rules, PDF, styling, conventions, recipes and gotchas. Read it fully before making changes. This file adds only Claude Code–specific workflow.

### Doc sync is part of every task

- After **any** edit to the codebase, update `AGENTS.md` (and this file, if the change affects Claude-specific workflow) **in the same turn, before reporting the task as done**. Follow "Rule 0" in `AGENTS.md` to find the right section.
- When you finish, tell the user which doc sections you updated (or say explicitly that none needed to change and why).
- If you find that the docs disagree with the code, trust the code, fix the docs, and mention it.
- Do not touch the `<!-- BEGIN/END:nextjs-agent-rules -->` block in `AGENTS.md`. `next dev` rewrites it.

### Working in this repo

- Shell: Windows with PowerShell as the main shell; Git Bash is also available. Use `bun` for all scripts (`bun dev`, `bun run typecheck`, `bun run lint`, `bun run format`).
- Before using any Next.js API, check `node_modules/next/dist/docs/` (e.g. `01-app/03-api-reference/03-file-conventions/`). Next 16 differs from training data (for example, `error.tsx` uses `retry`).
- A WebStorm MCP server is enabled (`.claude/settings.local.json`). Its tools (e.g. `get_file_problems`, `lint_files`) can be used for IDE-level diagnostics.
- To check UI changes visually, run `bun dev` and open http://localhost:3000. The PDF can only be checked by clicking "Download PDF" in the browser.
- Verify with `bun run typecheck && bun run lint` before declaring a change done. There are no tests.
