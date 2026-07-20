---
name: handoff-clear
description: >-
  Delete a stale or finished session handoff note. Use when the user runs
  /handoff-clear, says “clear the handoff”, or “delete handoff” after the task
  is done or the note is outdated. Removes .claude/handoff.md when present.
disable-model-invocation: true
---

# Handoff clear

Delete `.claude/handoff.md` when the handoff is no longer needed.

**Related commands (same package):** `/handoff` (write), `/handoff-read` (resume), `/handoff-refine` (merge updates)

---

## Compatibility (works with any agent)

- If the agent **can delete files**: delete `.claude/handoff.md` (preferred) or fallback `handoff.md`.
- If the agent **cannot delete files**: tell the user: “Consider the handoff cleared; delete `handoff.md` yourself if you saved one.”
- If the agent **does not support slash commands**: treat `/handoff-clear` as “clear the handoff” / “delete handoff”.

**Preferred path:** `.claude/handoff.md` at the workspace root. Fallback: `handoff.md` in the working directory.

---

## Parse

Accept `/handoff-clear` (optional leading slash). Natural language: “clear the handoff”, “delete handoff”.

This skill **only deletes** the handoff note. Do not write, read-and-continue, or refine here.

---

## Remove the note

1. If `.claude/handoff.md` (or fallback `handoff.md`) exists and you can delete files, delete it.
2. If neither file exists, say there was nothing to clear.
3. If you cannot delete files in this environment, tell the user to delete the file themselves.
4. Confirm the handoff is cleared. Do not recreate or archive the file unless the user asks.

**Use when:** the task is finished, the note is outdated, or you want a clean slate without resuming from a stale handoff.
