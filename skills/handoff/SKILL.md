---
name: handoff
description: >-
  Write and resume session handoff notes so work continues cleanly across chats.
  Use when the user runs /handoff, /handoff-read, /handoff-refine, or
  /handoff-clear, says they are stepping away, wants to end a session with a
  handoff note, start fresh from a handoff, update an existing handoff after
  progress, clear a stale handoff, or Claude keeps circling the same broken fix.
  Creates .claude/handoff.md with goal, state, active files, changes, failed
  attempts, and next steps.
disable-model-invocation: true
---

# Handoff

Hand the work off the way a good teammate would before going home. Instead of compacting, write a short handoff note before you stop. It captures only what the next session needs to keep going: the goal, where things stand, and what not to repeat. Then the user wipes the slate and starts fresh from that note.

**Three moves, in order:** write the note → user starts a new session → new session reads the note and continues. The new session gets the full picture and none of the rot.

The single most valuable part is **Failed attempts** — that list stops the next session from looping back into a broken solution already ruled out.

**Use this when:** stepping away for a few hours, or Claude keeps circling the same broken fix. Either is a signal to hand off and reset.

---

## Compatibility (works with any agent)

This skill is written to work in **any AI agent / chat**.

- If the agent **can write files**: write to `.claude/handoff.md` (preferred).
- If the agent **cannot write files**: output the full handoff note as Markdown in the chat, and tell the user: “Save this as `handoff.md` (or `.claude/handoff.md` if you have a repo) and paste it back next session.”
- If the agent **cannot read files**: ask the user to paste the contents of the handoff note into the chat.
- If the agent **does not support slash commands**: treat the “commands” below as **keywords**. The intent is what matters.

The handoff note is the source of truth for session state — avoid relying on old chat history when resuming.

## Parse

Accept `/handoff`, `/handoff-read`, `/handoff-refine`, or `/handoff-clear` (with optional leading slash).

| Command | Action |
|---------|--------|
| `/handoff` | Write or overwrite `.claude/handoff.md` from scratch, then stop |
| `/handoff-read` | Read `.claude/handoff.md` and continue from Next steps |
| `/handoff-refine` | Read existing handoff, merge in this session's updates, save |
| `/handoff-clear` | Delete `.claude/handoff.md` if it exists |

If the user says "hand off" or "create a handoff" without the slash, treat it as `/handoff`. If they say "read the handoff" or "continue from handoff", treat it as `/handoff-read`. If they say "refine the handoff" or "update the handoff", treat it as `/handoff-refine`. If they say "clear the handoff" or "delete handoff", treat it as `/handoff-clear`.

**Preferred handoff file path (when available):** `.claude/handoff.md` at the workspace root. Create `.claude/` if it does not exist.

If the user’s environment does not have `.claude/`, use `handoff.md` in the working directory as a fallback.

---

## /handoff — Write the note

Before stopping, create or overwrite the handoff note (file preferred; chat output otherwise). Include six sections:

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
2. Tell the user the handoff is ready, where it lives, and that they can start a new chat and run `/handoff-read` (or say “handoff read”) to continue.
3. **Stop** — do not keep working unless the user asks for something else.

---

## /handoff-read — Resume from the note

Start fresh from the handoff. The note is the source of truth for session state; do not rely on prior chat context.

### Steps

1. Read `.claude/handoff.md`. If missing, say so and ask the user to run `/handoff` in the previous session or describe where they left off.
2. Internalize all six sections, especially **Failed attempts** — do not retry those approaches unless the user explicitly overrides.
3. Briefly confirm understanding in one short paragraph: goal, current state, and the first next step.
4. Execute **Next steps** starting with item 1. Do not re-audit the whole repo unless a next step requires it.

If you cannot read files in this environment, ask the user to paste the handoff note content.

### While working

- Treat **Active files** as the focus set unless the task expands.
- If a next step conflicts with **Failed attempts**, pick a different approach and say why.
- Update `.claude/handoff.md` with `/handoff-refine` before stopping again if you resumed from a handoff and made progress. Use `/handoff` only when no prior handoff exists or you want a full rewrite.
- Run `/handoff-clear` when the work is done or the note is stale — do not leave a misleading handoff behind.

---

## /handoff-refine — Update the existing note

Merge this session's progress into the previous handoff instead of rewriting from scratch. Use after `/handoff-read` when you have new state, changes, failures, or next steps to record.

### Steps

1. Read the current handoff note (`.claude/handoff.md` preferred). If missing, fall back to `/handoff` (write a new note from scratch). If you cannot read files, ask the user to paste the current handoff note.
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

### After refining

Tell the user the handoff is updated. They can start another new chat and run `/handoff-read` to continue, or `/handoff-refine` again after more progress.

**Use when:** you resumed from a handoff, made progress, and want to step away again without losing accumulated context — especially the growing **Failed attempts** list.

**`/handoff` vs `/handoff-refine`:** `/handoff` overwrites from the current conversation alone. `/handoff-refine` preserves prior handoff context and layers this session on top. Prefer refine when a handoff already exists and you built on it.

---

## /handoff-clear — Remove the note

Delete `.claude/handoff.md` when the handoff is no longer needed.

### Steps

1. If `.claude/handoff.md` (or fallback `handoff.md`) exists and you can delete files, delete it.
2. If you cannot delete files in this environment, tell the user: “Consider the handoff cleared; delete `handoff.md` yourself if you saved one.”
3. Confirm the handoff is cleared. Do not recreate or archive the file unless the user asks.

**Use when:** the task is finished, the note is outdated, or you want a clean slate without resuming from a stale handoff.

---

## Guidance

- **Failed attempts are non-negotiable context.** When debugging went in circles, this section matters more than Current state.
- **Factual, not narrative.** No play-by-play of the chat — only durable facts.
- **Next steps are commands.** Write them so a new agent can act without re-deriving intent ("Run `npm test` in rural-lodge-api and fix the failing auth spec" not "look into tests").
- **One handoff file per workspace.** `/handoff` overwrites; `/handoff-refine` merges; the latest saved note wins.
- Do not commit `.claude/handoff.md` unless the user asks — it is session-local working state.

