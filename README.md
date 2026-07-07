# Agent Skills Repository

This repository is a **shareable registry of “agent skills”**: self-contained folders that can be installed into AI agents that support “skills” (or can be copied into any agent project as reusable prompts/instructions).

## Repo layout

- `skills/<skill-name>/SKILL.md` — the skill definition (entrypoint)
- `skills/<skill-name>/evals/` — optional eval prompts/expectations
- `skills/<skill-name>/references/` — optional templates, examples, or specs used by the skill
- `skills/registry.json` — index of skills in this repo

## Install a skill (via `npx`)

Install from this package or any public git repo that follows the same `skills/<name>/` convention:

```bash
# list available skills
npx skills list

# install into the current project (default: ./.agent-skills/<skill-name>/)
npx skills add handoff

# install into a specific directory
npx skills add handoff --dir ./my-skills

# install into Cursor's global skills directory (~/.cursor/skills/<skill-name>/)
npx skills add handoff --cursor

# install from a GitHub repo URL (example)
npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root
```

If your agent platform requires a manifest, use `skills/registry.json` as the source of truth for skill names and locations.

## Use a skill

Open the skill’s `SKILL.md` and follow its “Use this when” and “Parse/Commands” sections. Most skills in this repo are written to be **compatible with any agent**, even if:

- slash commands aren’t supported (treat commands as keywords)
- file read/write isn’t supported (fall back to chat output + user copy/paste)

## Skills

See `skills/registry.json` for the full list.

