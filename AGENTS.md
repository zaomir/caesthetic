# AGENTS.md — caesthetic Cursor Agents satellite

This repository is the **Cursor Agents** surface for CAESTHETIC.

| | |
|--|--|
| Knowledge domain | `caesthetic` |
| Agents project | `zaomir/caesthetic` (this repo) |
| Production SSOT + deploy | `zaomir/grainee-v2` → `site-caesthetic/` → https://caesthetic.com |
| Sync | Bidirectional DEC-829 — see `docs/projects/caesthetic/AGENTS_SATELLITE.md` |

## Read first

1. `START.md`
2. `docs/ssot/CAESTHETIC.md`
3. `docs/projects/caesthetic/AGENTS.md`
4. `agents/manifests/caesthetic.yaml`

## Do

- Edit CAESTHETIC site, SSOT, working docs, scripts and tests under mirrored trees (`SYNC_MANIFEST.yml`)
- After every completed task: commit + push here → sync Agents↔grainee → deploy from grainee if runtime — **no asks/reminders**
- Keep four-surface model, human approval on Growth Score, no fabricated proof

## Do not

- Deploy from this repo
- Invent clinic/practice facts or outcome guarantees
- Edit protected pricing without gates
- Commit secrets or client-identifiable data
- Mirror or recreate `site-caesthetic/private/`
- Open `grainee-v2` for CAESTHETIC-only chats (use **this** project in Cursor Agents picker)

## Desktop IDE

Open multi-root workspace from grainee: `caesthetic.code-workspace`  
Or open this repo folder alone in Cursor Desktop.

## Cloud / Mobile Agents

1. Cursor → Cloud Agents → Environment for **`zaomir/caesthetic`**
2. Start agent chats on project **caesthetic** (not grainee-v2)
3. Setup guide: `docs/projects/caesthetic/CURSOR_AGENTS_SETUP.md`
