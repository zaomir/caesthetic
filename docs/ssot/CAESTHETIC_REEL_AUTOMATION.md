---
owner: CAESTHETIC / platform ops
status: active
version: 1.2
created: 2026-08-26
updated: 2026-08-26
authority: DEC-854
parent: docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md
does_not_supersede: Reel System V3.3, Format A §3B, Format B v1.1, DEC-838 freeze
---

# CAESTHETIC Reel Automation — operational SSOT

**Read this file** when an agent is asked: do we have ElevenLabs / Kling;
how Reels are produced; how to automate Reels; where secrets live; what
another agent already decided.

This file is the **ops/target architecture**. It does **not** change editorial
rules. Production format authority remains
`docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` (V3.3 / Format A)
and `docs/ssot/CAESTHETIC_REEL_FORMAT_B.md` (Format B). DEC-831 Template Reel
Factory stays **on hold**.

High-level stage names live in
`docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_AUTOMATION_LAYER.md`. This file is
the answerable implementation contract.

---

## 0. Agent answer card

Use these answers verbatim unless a newer DEC supersedes them.

### Q. Есть ли доступ к ElevenLabs и Kling?

**RU:** В Cloud Agent — нет. Нет MCP и нет секретов `ELEVENLABS_*` / `KLING_*`
в Cursor Environment. Сеть открыта, но без ключа вызов бесполезен. Канон
голоса и motion живёт в YAML/Dropbox. Единственный подтверждённый синтез —
`CAE-REEL-001` (REST `/v1/text-to-speech/lxYfHSkYm1EzQzGhdbfc/with-timestamps`,
потом rclone в Dropbox). Kling API в репозитории нет. Ключи класть только на
**VPS2402** `/etc/evo/secrets.env`, не в Cloud Secrets.
`ELEVENLABS_API_KEY` на VPS2402 записан 2026-08-26 (presence-only, mode 0600).
Cloud Agent значение не читает. Chat-ключ считать скомпрометированным.

**EN:** Cloud Agents have no ElevenLabs/Kling MCP and no API keys. One proven
ElevenLabs attach exists on `CAE-REEL-001`. Kling has prompts only. Host keys
on VPS2402, not in the cloud pod.


### Q. Где взять API-ключ ElevenLabs и куда его положить?

1. Создать новый ключ в ElevenLabs: **Developers → API Keys → Create API
   Key**. Для Reel worker выдать только нужный scope Text to Speech и
   ограничить credit quota.
2. Любой ключ, вставленный в чат, issue, PR, YAML, лог или файл репозитория,
   считать скомпрометированным: немедленно revoke/delete и выпустить новый.
3. Новый ключ передать на VPS2402 только через существующий защищённый
   provisioning-канал. Каноническое место:
   `/etc/evo/secrets.env`, переменная `ELEVENLABS_API_KEY`; файл не
   коммитится и должен иметь закрытые права.
4. Запрещено класть vendor keys в Cloud Secrets, локальный `.env.local`
   Cloud Agent, Git, Dropbox, episode YAML или SSOT.
5. Cloud Agent не читает и не проверяет значение ключа. Он получает только
   результат allowlisted worker: status, provider request id, SHA-256,
   measured timestamps и Dropbox reference.
6. Kling credentials разрешены только на том же VPS-host и только после
   появления утверждённого official API client/capability probe. До этого
   motion stage fail-closed.


### Q. Как раньше получали доступ?

Not via Cloud Agent MCP. Pattern from older chats and lineage:

1. Cursor Environment secrets are deploy/SSH/GitHub/Supabase only.
2. Host work runs on **VPS2402** (`185.216.214.28`) with rclone `dropbox:`.
3. ElevenLabs was a one-off REST call (Codex/VDS), then Dropbox file ids were
   written into episode YAML (`10c0407b7` — Attach CAE Reel 001 audio master).
4. Video workers **consume** Dropbox masters. They do not call ElevenLabs.

### Q. Можно ли полностью автоматизировать Reels?

Yes, as a **controlled editorial pipeline**, not as “topic → AI Reel”.
After `status: approved_for_production` the machine owns synthesize → motion
gate → render → assemble → QA → Huck → Hooppy pack. Humans keep three gates:
Evidence `PUBLISHABLE`, script approval, `approved_publish`. Sensitive visual
needs a second pair of eyes. Live URL verify is required before `LIVE`.

### Q. С чего начинать код?

1. ElevenLabs audio worker on VPS2402.
2. Orchestrator state machine (`type=caesthetic_reel`, not implemented yet).
3. Format A Remotion full-episode compile against the accepted A-master.
4. Kling B-roll, then talking-head / HeyGen reserve.
5. Harden QA. Then Hooppy schedule + live verify.

Do not reactivate DEC-831. Do not add per-scene TTS. Do not invent evidence.

### Q. Где первый прогон?

| Goal | Episode | Why |
|---|---|---|
| Assembly without new TTS | `CAE-REEL-001` | Approved; master already in Dropbox |
| New voice synthesis | any YAML `approved_for_production` with empty `master_ref` | Exercises the audio worker |
| First Kling | `CAE-REEL-B-001` | Six canonical B-roll prompts already in Format B §4 |

---

## 1. Invariants (fail closed)

| Rule | Source |
|---|---|
| Reels are evidence-driven acquisition, not a content factory | V3.3 §1 |
| One continuous ElevenLabs master, voice `lxYfHSkYm1EzQzGhdbfc`, first word at `t=0` | DEC-840, V3.3 §3A |
| No per-scene TTS; `spoken_text` is review copy only | DEC-840 |
| Kling is primary motion; lip-sync only if official audio-input is declared | V3.3 §3A |
| Missing capability → fail closed or HeyGen reserve with the **same** segment | DEC-840 |
| `CAE-REEL-4444-001`: voice only ElevenLabs; Valerie video only Kling; cards only static Remotion PNG; no provider reserve/substitution | Founder tool lock 2026-08-26 |
| No provider may resynthesize Valerie's voice | DEC-840 |
| Kling plates: no text, logo, UI, dashboards, procedures | Format B §1 / §7 |
| Evidence unit must be `PUBLISHABLE` | V3.3 §5 / §15 |
| Discovery only via `REGISTRY.yaml` | reels README |
| Git = contracts; Dropbox = heavy media | V3.3 §14 |
| Runtime host = **VPS2402** only, not vdska `.121` | DEC-836 |
| Template Factory DEC-831 = on hold | DEC-838 |
| Prepared upload ≠ published; verify live URL | V3.3 §15.17 |
| `APPROVED_SCRIPT` ≠ `approved_publish` | `HOOPPY_API.md` |

---

## 2. Canonical pipeline

```text
PUBLISHABLE evidence → episode YAML (REGISTRY.yaml)
  → compile (pin git SHA, format_system)
  → ElevenLabs continuous master + timestamps
  → Kling motion / capability gate (HeyGen reserve)
  → Remotion evidence + karaoke from master timestamps
  → assembly → Video QA → Huck
  → Hooppy 5-pack
  → approved_publish → schedule → live URL verify
```

Format dispatch:

- **Format A V3.3 §3B** — nine-scene evidence journey; talking-head
  S01/S03/S05/S07; Remotion evidence S02/S04/S06/S08; Closing Card S09.
  Reference master: `CAE-REEL-A-IG-4444-001` (78.166667s).
- **Format B v1.1** — 42–45s; Valerie ×3; mandatory Pause Trigger;
  `FIX FIRST / NOT YET / UNTIL`; track-selected CTA.
- **Legacy Daily Growth Note assemble** (`opener + evidence + pause +
  closing + exactly two motion clips`) — keep for old jobs only. New A/B
  episodes must not use it.

Episode override: `CAE-REEL-4444-001` is stricter than the global provider
reserve. Its continuous voice master must be ElevenLabs, all Valerie video
must be Kling, and evidence cards must be pre-rendered static PNGs from
Remotion `renderStill()`. Missing ElevenLabs or Kling capability is an error;
HeyGen, Runway, guide/system TTS and any other substitute are forbidden.

---

## 3. Current vs target

| Stage | Now | Target |
|---|---|---|
| Script + YAML | Agent writes; founder approves | Unchanged human gate |
| Evidence Bank | Contract + CLI; capture is human | Unchanged `PUBLISHABLE` gate |
| Editorial cards | Asset Worker `render_stories` on VPS2402 | Keep |
| ElevenLabs master | One-off attach on `CAE-REEL-001`; no worker | Allowlisted VPS2402 worker |
| Kling / HeyGen | No client; no capability probe | Worker + declared probe |
| Evidence motion | Remotion `FourSurfaceMap` v1.0.0; production disabled pending Evidence Resolver | Full-episode compile from YAML + timestamps |
| Assembly | `assemble_episode` = 4 cards + 2 clips | Format-aware assembler |
| Video QA | Technical ffprobe + hardcoded true flags | Checklist V3.3 §15 |
| Publish envelope | Prepared; IG Reels adapter fail-closed (TASK-837) | Hooppy queue + live verify |
| Secrets in Cloud Agent | `DEPLOY_HOOK_SECRET`, `EVO_SSH_*`, `GITHUB_TOKEN`, `SUPABASE_ACCESS_TOKEN` | Do **not** add vendor keys here |

Episode snapshot (registry):

| ID | Status | Audio | Final |
|---|---|---|---|
| `CAE-REEL-A-IG-4444-001` | `accepted_reference_master` | attached in production tree | Dropbox final exists; `publication: approved_not_verified_live` |
| `CAE-REEL-B-001` | `approved_for_production` | contract only | none |
| `CAE-REEL-001` | `approved` | attached + measured | none |

---

## 4. Access and host

### Cloud Agent / Codex without VDS

Write `docs/agent-api/requests/<id>.json` on `main`. Do not call vendor APIs
from the cloud pod. Do not paste keys in chat.

Planned request type (not implemented):

```json
{
  "request_id": "cae-reel-<episode>-<utc>",
  "type": "caesthetic_reel",
  "operation": "compile | synthesize_audio | motion_gate | assemble | video_qa | package",
  "episode_id": "CAE-REEL-001",
  "requested_by": "cursor"
}
```

Until the type exists, do not invent a request. Use existing
`caesthetic_assets` / `assemble_episode` / `video_qa` only as documented.

### VPS2402

- Host: `185.216.214.28`, hostname `vps2402`.
- Storage: `/opt/caesthetic-assets/`.
- Cloud: rclone remote `dropbox:`.
- Secrets to add **only here**: `ELEVENLABS_API_KEY`, Kling vendor key,
  `HEYGEN_API_KEY` (reserve).
- `ELEVENLABS_API_KEY` provisioned 2026-08-26: file exists, mode `0600`,
  name present, host-side ElevenLabs `/v1/user` HTTP 200. Value stays on
  the host. Chat-published key remains compromised — revoke and replace.
- Forbidden host: Grainee VDS `.121` / `vdska`.

### Proven ElevenLabs call shape

```text
POST /v1/text-to-speech/lxYfHSkYm1EzQzGhdbfc/with-timestamps
model_id: eleven_multilingual_v2
source_format: mp3_44100_128
text: YAML spoken_script (entire reel, one request)
```

Post-process required by canon: strip leading silence; first character at
`0`; reject joins/clicks/gaps `> 1s`; normalize; map timestamps onto
`audio_master.segments`; SHA-256; rclone to
`CAESTHETIC/CAESTHETIC MEDIA/Production/reels/<id>/audio/`; write
`measured_output` into the episode YAML.

---

## 5. Human gates that stay

These are canon, not engineering debt:

1. Evidence unit reaches `PUBLISHABLE` (rights, redaction, risk class).
2. Founder (or named reviewer) sets episode `approved_for_production`.
3. `approved_publish=TRUE` is a **second** flag. Script approval does not
   publish.
4. Sensitive visual Evidence needs QA plus a second pair of eyes.
5. Format / timing / CTA changes need a versioned DEC. No silent batch edits.
6. CITY CHECK naming/legal basis stays unresolved until the market rank lands.

“Fully automated” means: after gate 2 the machine produces a QA-passed MP4
and a Hooppy pack; gate 3 still releases it.

---

## 6. Orchestrator (target)

One VPS2402 poller, deny-by-default, immutable `error` results (same habit as
Asset Worker). State per episode:

```json
{
  "episode_id": "CAE-REEL-001",
  "stage": "assemble",
  "compile": "ready",
  "audio_master": "ready",
  "motion": "pending",
  "captions": "pending",
  "final": "pending",
  "qa": "pending"
}
```

### 6.1 compile

Input: `episode_id` from `REGISTRY.yaml` only.

Fail closed if: YAML not in registry; `spec_version` / `format_system`
mismatch; cited evidence not `PUBLISHABLE`; voice id wrong; per-scene TTS
fields present; Format A scene count/alternation wrong; Format B v1.1 missing
Valerie ×3, Pause Trigger, or `FIX FIRST / NOT YET / UNTIL`.

Output: compiled manifest + `compiled_against_git_sha`.

### 6.2 synthesize_audio

Allowlisted VPS2402 worker. Writes Dropbox + YAML `measured_output`.
No master / no segment coverage → assembly must not start.

### 6.3 motion_gate

Probe Kling official audio-input lip-sync **at job start**. Persist
`lip_sync_provider` + `capability_declared_at`. Silent fallback is forbidden.

| Need | Kling audio-in declared | Else |
|---|---|---|
| Valerie on-camera | Kling + master segment | HeyGen reserve + same segment |
| Format B B-roll | Kling T2V from YAML prompts | retry / error; no UI still substitute |

For `CAE-REEL-4444-001`, the HeyGen reserve in the table above is disabled:
Kling unavailable or unable to consume the approved master segment → error.
The assembler may mute Kling-native audio, but it must never synthesize or
replace Valerie's ElevenLabs voice.

Auto-reject plates: OCR text/logo/UI, Kling watermark, non-Valerie face on
talking-head, procedure, readable screen. Talking-head duration must match
the audio segment; B-roll generate `5–8s`, select `1–2.5s`.

### 6.4 render + assemble

Format A: motion + karaoke on talking-head; Remotion on evidence; Closing
Card V1 `1.5–2.0s` with byte-for-byte `logo-long.png`; frame 0 already has
headline + moving/speaking Valerie.

Format B: Kling plates + Remotion labels + three Valerie appearances.

Assembler only routes existing layers over timestamps. No TTS.

### 6.5 video_qa

Implement `CAESTHETIC_VIDEO_QA.md` plus V3.3 §15: 1080×1920 30fps; scene
order; logo; karaoke without background; one CTA on closing only; first word
at 0; Format B model-example labels; Valerie continuity lock; SHA-256;
contact-sheet. FAIL → new `request_id`.

### 6.6 package + publish

`APPROVED_SCRIPT` → Hooppy 5-pack under
`SIMON_OPS/content/B_CAE_IG/{content_id}/{version}/{platform}/`.
`approved_publish` → schedule in the US window.
Delivery closes only with `GET /posts` **and** a live URL. `is_published=1`
alone is `DELIVERY_UNVERIFIED`.

Do not enable comment-to-DM auto-publish until the first useful response is
immediate. Default CTA remains link-in-bio / Hooppy-approved Growth Score.

IG Reels Social Browser Operator adapter is still fail-closed. Use Hooppy
until TASK-837 lands. Do not invent Playwright selectors.

---

## 7. Build order

Each step ships a usable artifact.

1. **Audio worker** on VPS2402 — unblocks every approved YAML.
2. **Orchestrator state machine** + cron + immutable results.
3. **Compile + Remotion full-episode** for Format A; regress against SHA
   `b213fbbff3193b04d8beb41ecb6cf203b5fd39aea0fdb0d4b0766749a3685da6`.
4. **Motion worker** — Kling B-roll first, then talking-head / HeyGen.
5. **QA hardening** to §15.
6. **Hooppy schedule + live verify**.

---

## 8. Related SSOT (do not dump)

| Need | File |
|---|---|
| Editorial / Format A | `CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` |
| Format B | `CAESTHETIC_REEL_FORMAT_B.md` |
| Stage names | `CAESTHETIC_DAILY_GROWTH_NOTE_AUTOMATION_LAYER.md` |
| Remotion contract | `CAESTHETIC_REMOTION_RENDER_MANIFEST.md` |
| Cards / rclone | `CAESTHETIC_ASSET_WORKER.md` |
| QA | `CAESTHETIC_VIDEO_QA.md` |
| HeyGen reserve | `CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md` |
| Evidence | `CAESTHETIC_EVIDENCE_BANK.md` |
| Publish / Hooppy | `HOOPPY_API.md` |
| Registry | `docs/projects/caesthetic/operations/ig-growth/reels/README.md` |
| Decision | `docs/founder-notes/DEC-854.md` |
