---
name: handoff-refine
description: >-
  Merge this session’s progress into an existing handoff note instead of
  rewriting from scratch. Use when the user runs /handoff-refine, says “refine
  the handoff”, or “update the handoff” after resuming with /handoff-read.
  Appends changes and failed attempts; refreshes current state and next steps.
disable-model-invocation: true
---

# Handoff refine

Merge this session’s progress into the previous handoff instead of rewriting from scratch. Use after `/handoff-read` when you have new state, changes, failures, or next steps to record.

**Related commands (same package):** `/handoff` (write), `/handoff-read` (resume), `/handoff-clear` (delete)

---

## Compatibility (works with any agent)

- If the agent **can read/write files**: update `.claude/handoff.md` (preferred).
- If the agent **cannot read files**: ask the user to paste the current handoff note, then output the full updated note for them to save.
- If the agent **cannot write files**: output the full updated note in chat for the user to save.
- If the agent **does not support slash commands**: treat `/handoff-refine` as “refine the handoff” / “update the handoff”.

**Preferred path:** `.claude/handoff.md` at the workspace root. Create `.claude/` if needed. Fallback: `handoff.md` in the working directory.

---

## Parse

Accept `/handoff-refine` (optional leading slash). Natural language: “refine the handoff”, “update the handoff”.

This skill **only merges** into an existing note. If no note exists, fall back to writing a new one as `/handoff` would. Do not resume work or delete the note here.

---

## Update the existing note

1. Read the current handoff note (`.claude/handoff.md` preferred). If missing, write a new note from scratch using the six-section structure below (same as `/handoff`). If you cannot read files, ask the user to paste the current handoff note.
2. Compare the existing note against what happened in **this session** since `/handoff-read` (or since the last refine).
3. Update each section — **merge, do not blindly replace:**
   - **Goal** — keep unless scope shifted; tighten if the user's intent became clearer.
   - **Current state** — replace with the latest truth; drop outdated status.
   - **Active files** — union of prior and new relevant paths; remove files no longer in play.
   - **Changes made** — **append** this session's edits/commits; keep prior changes that still matter.
   - **Failed attempts** — **append** new dead ends from this session; **never remove** prior failures unless the user explicitly says an approach is back on the table.
   - **Next steps** — replace with a fresh ordered list reflecting where things stand now; completed items drop off.
4. Save the updated note back to `.claude/handoff.md` (preferred) or output the full updated note in chat for the user to save.
5. Briefly summarize what changed in the handoff (one or two sentences).

### Section structure

Match these headings exactly (same as `/handoff`). See [../references/template.md](../references/template.md) if needed:

1. Goal
2. Current state
3. Active files
4. Changes made
5. Failed attempts
6. Next steps

---

## After refining

Tell the user the handoff is updated. They can start another new chat and run `/handoff-read` to continue, or `/handoff-refine` again after more progress.

**`/handoff` vs `/handoff-refine`:** `/handoff` overwrites from the current conversation alone. `/handoff-refine` preserves prior handoff context and layers this session on top. Prefer refine when a handoff already exists and you built on it.

---

## Guidance

- **Never drop Failed attempts** unless the user reopens an approach.
- **Factual, not narrative.** Only durable facts.
- Do not commit `.claude/handoff.md` unless the user asks.
