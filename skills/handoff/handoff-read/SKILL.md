---
name: handoff-read
description: >-
  Resume work from an existing session handoff note. Use when the user runs
  /handoff-read, says “read the handoff”, “continue from handoff”, or starts a
  fresh chat after a previous /handoff. Reads .claude/handoff.md and continues
  from Next steps without retrying Failed attempts.
disable-model-invocation: true
---

# Handoff read

Start fresh from the handoff note. The note is the source of truth for session state; do not rely on prior chat context.

**Related commands (same package):** `/handoff` (write), `/handoff-refine` (merge updates), `/handoff-clear` (delete)

---

## Compatibility (works with any agent)

- If the agent **can read files**: read `.claude/handoff.md` (preferred).
- If the agent **cannot read files**: ask the user to paste the handoff note into the chat.
- If the agent **does not support slash commands**: treat `/handoff-read` as “read the handoff” / “continue from handoff”.

**Preferred path:** `.claude/handoff.md` at the workspace root. Fallback: `handoff.md` in the working directory.

---

## Parse

Accept `/handoff-read` (optional leading slash). Natural language: “read the handoff”, “continue from handoff”.

This skill **only resumes** from an existing note. Do not write a new handoff, refine, or delete here.

---

## Resume from the note

1. Read `.claude/handoff.md` (or fallback `handoff.md`). If missing, say so and ask the user to run `/handoff` in the previous session or describe where they left off.
2. Internalize all six sections, especially **Failed attempts** — do not retry those approaches unless the user explicitly overrides.
3. Briefly confirm understanding in one short paragraph: goal, current state, and the first next step.
4. Execute **Next steps** starting with item 1. Do not re-audit the whole repo unless a next step requires it.

### While working

- Treat **Active files** as the focus set unless the task expands.
- If a next step conflicts with **Failed attempts**, pick a different approach and say why.
- Before stepping away again after progress, tell the user to run `/handoff-refine` (not `/handoff`) so prior Failed attempts are preserved.
- When the work is done or the note is stale, tell the user to run `/handoff-clear`.

---

## Guidance

- **Failed attempts are non-negotiable.** Do not re-litigate dead ends listed in the note.
- **Next steps drive action.** Start with item 1 immediately after the brief confirmation.
- Do not commit `.claude/handoff.md` unless the user asks.
