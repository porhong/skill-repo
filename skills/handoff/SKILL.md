---
name: handoff
description: >-
  Write a session handoff note to .claude/handoff.md so work continues cleanly
  in a new chat. Use when the user runs /handoff, says they are stepping away,
  wants to end a session with a handoff note, or Claude keeps circling the same
  broken fix. Creates .claude/handoff.md with goal, state, active files,
  changes, failed attempts, and next steps. Installing this package also
  exposes /handoff-read, /handoff-refine, and /handoff-clear.
disable-model-invocation: true
---

# Handoff (write)

Hand the work off the way a good teammate would before going home. Instead of compacting, write a short handoff note before you stop. It captures only what the next session needs: the goal, where things stand, and what not to repeat.

**Flow:** write the note → user starts a new session → new session runs `/handoff-read` and continues.

The single most valuable part is **Failed attempts** — that list stops the next session from looping back into a broken solution already ruled out.

**Package commands (one install):** `/handoff`, `/handoff-read`, `/handoff-refine`, `/handoff-clear`

---

## Compatibility (works with any agent)

- If the agent **can write files**: write to `.claude/handoff.md` (preferred).
- If the agent **cannot write files**: output the full handoff note as Markdown in the chat, and tell the user: “Save this as `handoff.md` (or `.claude/handoff.md` if you have a repo) and paste it back next session.”
- If the agent **does not support slash commands**: treat `/handoff` as the keyword “hand off” / “create a handoff”.

**Preferred path:** `.claude/handoff.md` at the workspace root. Create `.claude/` if needed. Fallback: `handoff.md` in the working directory.

---

## Parse

Accept `/handoff` (optional leading slash). Natural language: “hand off”, “create a handoff”.

This skill **only writes** (overwrite from scratch). Do not read-and-continue, refine, or delete here — those are `/handoff-read`, `/handoff-refine`, and `/handoff-clear`.

---

## Write the note

Create or overwrite the handoff note (file preferred; chat output otherwise). Include six sections:

1. **Goal**
2. **Current state**
3. **Active files**
4. **Changes made**
5. **Failed attempts**
6. **Next steps**

Keep it short and factual — just what the next session needs to pick up cleanly.

### How to gather content

Review the current conversation and workspace:

- **Goal** — one or two sentences on what the user is trying to accomplish.
- **Current state** — what works, what does not, blockers, and any relevant commands already run (tests, builds, servers).
- **Active files** — paths the next session will touch; skip boilerplate unless critical.
- **Changes made** — concrete edits, commits, or config changes this session produced.
- **Failed attempts** — approaches tried that did **not** work and **why**. Be specific (error messages, wrong assumptions). This section prevents re-litigating dead ends.
- **Next steps** — ordered, actionable items for the next session. The first item should be the immediate next move.

Do not pad sections. Omit a section only if there is genuinely nothing to say (rare for Failed attempts in debugging sessions).

### Template

Use [references/template.md](references/template.md) for structure. Match its headings exactly.

### After writing

1. Save the note to `.claude/handoff.md` (preferred) or output it in chat for the user to save.
2. Tell the user the handoff is ready, where it lives, and that they can start a new chat and run `/handoff-read` to continue.
3. **Stop** — do not keep working unless the user asks for something else.

---

## Guidance

- **Failed attempts are non-negotiable context.** When debugging went in circles, this section matters more than Current state.
- **Factual, not narrative.** No play-by-play of the chat — only durable facts.
- **Next steps are commands.** Write them so a new agent can act without re-deriving intent ("Run `npm test` in rural-lodge-api and fix the failing auth spec" not "look into tests").
- **`/handoff` overwrites** from the current conversation alone. Prefer `/handoff-refine` when a handoff already exists and you built on it.
- Do not commit `.claude/handoff.md` unless the user asks — it is session-local working state.
