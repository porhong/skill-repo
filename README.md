# Agent Skills Repository

This repository is a **shareable registry of “agent skills”**: self-contained folders that can be installed into AI agents that support “skills” (or can be copied into any agent project as reusable prompts/instructions).

## Repo layout

- `skills/<skill-name>/SKILL.md` — the skill definition (entrypoint)
- `skills/<skill-name>/evals/` — optional eval prompts/expectations
- `skills/<skill-name>/references/` — optional templates, examples, or specs used by the skill
- `skills/registry.json` — index of skills in this repo

## Install a skill (generic)

Pick a skill folder (example: `skills/handoff/`) and install it into your agent environment using one of these approaches:

- **Copy folder install**: copy `skills/<skill-name>/` into your agent’s skills directory.
- **Vendor into a repo**: copy the folder into your project (keep the `SKILL.md` at the folder root).
- **Reference-only**: if your agent can’t “install skills”, open `SKILL.md` and paste its content into your agent as a reusable instruction/prompt.

If your agent platform requires a manifest, use `skills/registry.json` as the source of truth for skill names and locations.

## Use a skill

Open the skill’s `SKILL.md` and follow its “Use this when” and “Parse/Commands” sections. Most skills in this repo are written to be **compatible with any agent**, even if:

- slash commands aren’t supported (treat commands as keywords)
- file read/write isn’t supported (fall back to chat output + user copy/paste)

## Skills

See `skills/registry.json` for the full list.

