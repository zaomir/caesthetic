---
owner: CAESTHETIC
status: canonical
version: 3.3
created: 2026-08-16
updated: 2026-08-22
authority: DEC-838, amended by DEC-839, DEC-840 and founder-locked Format A production acceptance on 2026-08-22
supersedes: V3.1 voice/audio orchestration and corresponding synthetic presenter ownership only
---

# CAESTHETIC Reel System V3.3 — Daily Growth Note Video Pipeline

## 0. V3 FREEZE

`V3.3` is the production authority from 2026-08-22. It preserves the frozen
V3.2 evidence, CTA, Closing Card, measurement, privacy and brand-asset rules
and adds the founder-accepted Format A production contract in §3B. V3.2 remains
the historical authority for batches compiled before this amendment. A production batch
must record and use one spec version. Structure, timing, CTA route, Valerie role
or evidence rules may change only through a versioned decision/change note; no
silent edits during a batch. Production starts only after this freeze.

This file remains the single production SSOT. DEC-838 supersedes DEC-837 where
V2 required a universal `15–18s` format, treated Valerie as a default organic
beat, allowed a slower Closing Card or ended measurement at a booked call.
Evidence/Explanation and Closing Card rules survive as refined below.

## 1. System purpose and two jobs

Reels are an **evidence-driven acquisition system**, not a content factory.

| Track | Job | Primary evaluation |
|---|---|---|
| `Cold Reach` | Problem recognition, self-diagnosis and qualified profile visits | Profile visit rate and downstream Score progression, supported by media diagnostics |
| `Score Intent / Product FAQ` | Warm education, objection removal and understanding of Growth Score, Sprint, ownership and measurement | Downstream product understanding and funnel progression |

Product FAQ is an evergreen decision library for the profile, Highlights,
retargeting, DM and pre-call education. It is not judged as a cold-reach asset.

> Evidence earns trust. Valerie gives it a voice. Explanation creates understanding. Self-diagnosis creates intent. CTA captures that intent.

## 2. Evidence first

Production follows `evidence → question → explanation → decision`, never
`invent thesis → find a decorative screenshot`.

```text
Evidence = WHAT WE KNOW
Explanation = WHAT IT MEANS
```

Explanation may interpret shown evidence only inside its source, method and
scope. It cannot introduce or visually masquerade as new Evidence.

Every material unit uses exactly one class from
`EVIDENCE_AND_IMPACT_STANDARD.md`: `Observed`, `Measured`, `Calculated`,
`Benchmark`, `Estimated` or `Illustrative`. Technical `OBSERVED` / `MEASURED`
badges are optional on screen when natural, scoped wording is clearer.
`Estimated` and `Illustrative` remain explicit at the point of use.

Never publish fake dashboards, fake conversations, fabricated results,
fabricated metrics, pseudo-analytics or decorative proof substitutes.

## 3. Format classes and scene contract

There is no universal Reel duration. Evidence and the job determine runtime;
completion rate alone does not. The first comparable batch includes both:

| Class | Working range | Use |
|---|---:|---|
| `Single Insight` | approximately `12–18s` | One evidence/explanation unit and one decision |
| `Evidence Reel` | approximately `22–30s` | Evidence or artifact needs inspection and/or fuller explanation |

These are test ranges, not promises that one class will win. Business outcomes
take precedence over completion rate.

Founder-locked Format A episodes using the nine-scene evidence journey in §3B
may run longer when the real screen journey requires inspection. The accepted
reference implementation is `78.166667s`; this is a reference, not a new
universal duration target. Never speed-read, remove evidence steps or insert
silent filler merely to force a working range.

```text
MOTION EDITORIAL HOOK
→ OPTIONAL VALERIE / FRAMING
→ EVIDENCE → EXPLANATION + PAUSE TRIGGER OVERLAY
→ DECISION IMPLICATION + OPTIONAL CTA SEED
→ CLOSING CARD V1
```

### Motion Editorial Hook

The first meaningful visual or movement targets roughly the first second:
restrained push-in, subtle parallax, text reveal or moving evidence. This is an
early-retention hypothesis, not a claim that Instagram penalizes static frames.
Composition remains governed by `CAESTHETIC_DAILY_GROWTH_NOTE_OPENER_CANON.md`.

When Valerie is used in the opening master, Scene 1A starts at frame `0` with
the complete headline already visible, Valerie already moving and the first
spoken word already audible. The headline uses the approved fixed lower-third
area inside the opener editorial zone; Valerie remains on the right. Scene 1A
and 1B are one continuous master clip. The 1A→1B boundary is visual only: the
headline disappears while Valerie continues the same line without a pause,
audio edit or visual cut. The continuous ElevenLabs master starts with the
first word at time/frame `0`, and the assembler must not add artificial leading
silence. Existing template-level
brand assets retain their current status; this rule does not canonize a new
round-logo asset.

### Valerie / framing

Valerie is the branded narrator and continuity layer, **not** the trust anchor.
When used, framing carries one thought, normally `8–12` spoken words and up to
approximately `15`, with no greeting or preamble. Valerie is optional in
organic Reels until the clean paid test in §8 supports a default.

Valerie delivery is either `on_camera` or `voice_over`. Kling is the primary
motion layer for on-camera Valerie. Lip sync is capability-gated as defined in
§3A; neither Kling nor a reserve provider owns or resynthesizes her voice.
Preserve identity, clothing/environment continuity,
calm authority and brand-controlled burned-in captions. No influencer styling,
fake personal experience, testimonial or credibility substitution.

### 3A. Continuous voice and audio timeline

ElevenLabs is the sole canonical Valerie voice source. Every Reel first creates
one continuous audio master for the complete spoken script using voice id
`lxYfHSkYm1EzQzGhdbfc`; separate per-scene TTS is forbidden in the primary
path. The master has no artificial leading silence, and its first word begins
at time/frame `0`.

The audio master plus its word/segment timestamps is the authoritative Reel
timeline. Visual boundaries, captions, on-camera motion and voice-over cards
are compiled over that timeline. Every voiced scene references one ordered,
non-overlapping segment of the same master. `spoken_text` may remain as
human-readable validation copy, but it is never a scene-owned synthesis input.
Editorial and text cards may use `voice_over` normally; when Valerie leaves and
returns to camera, the voice continues through successive segments of the same
master without resynthesis.

Kling is the primary Valerie motion provider. Production may pass an
ElevenLabs segment to Kling for lip sync only when the currently available
official integration declares audio-input lip sync support. If it does not,
the capability gate must fail closed or route to the approved reserve
motion/lip-sync provider using that same master segment. HeyGen may serve only
as such a declared reserve path; it must not generate Valerie's voice.
Production must not silently fabricate an integration, substitute per-scene
TTS or proceed when the required master, timestamps, segment coverage or
declared lip-sync capability is absent.

### Evidence / Explanation

Evidence receives priority over branding in the runtime. When voiced, the
working budget is normally `15–25` spoken words for one thought. When an
artifact needs inspection, use a silent evidence interval rather than filling
it with speech.

The preceding silent-interval option does **not** apply to founder-locked Format
A §3B. In that contract, one continuous narration explains every evidence scene
without restating the visible labels; there are no unvoiced evidence breaks.

Evidence surfaces are clean editorial information surfaces, not Valerie cards.
Use one short headline, at most 2–3 short lines of explanation and, only when
useful, one real artifact. Crop for phone legibility. One card carries one
artifact and one takeaway; no second CTA.

### Pause Trigger

Pause Trigger is a short self-diagnosis question/callout over **continuing
moving Evidence**. It is not a separate static card, does not add a fact and
may be voiced by Valerie as voice-over.

### Conclusion

The conclusion is one decision implication. A single CTA seed may be spoken
here before the final frame. It does not add Evidence.

### 3B. Founder-locked Format A — nine-scene evidence journey

This section is the final production contract for new Format A evidence Reels
unless an episode explicitly pins an older version. It does not amend or
replace Format B. The accepted reference episode is
`CAE-REEL-A-IG-4444-001`, “Instagram engagement does not convert into
appointments”. Its machine-readable scene, narration and output authority is
`docs/projects/caesthetic/operations/ig-growth/reels/episodes/003-instagram-interest-no-booking.yaml`.

#### Narrative logic

```text
observable gap → failed patient journey → diagnosis → four-surface journey
→ inconsistency/trust break → one-action correction → aligned journey → CTA
```

Instagram is the cover/discovery surface, not the complete purchase journey.
The patient may continue through Instagram, Website, Reputation / Reviews and
Maps / Search before making an inquiry. These are the canonical Four Surfaces
from `CAESTHETIC.md`; no fifth surface is invented. The Reel shows that
contradictory information and excess taps create uncertainty, then shows one
clear action and destination across all four surfaces. The method is `4444`.

#### Scene order

| Scene | Delivery | Required job and visual evidence |
|---|---|---|
| S01 | Valerie hook | State the observable gap: visible engagement without appointments. The lower strip continuously moves through four real/high-engagement Instagram examples; do not invent metrics. |
| S02 | Evidence + VO | Show the actual mobile journey in order: strong Instagram post → bio with three links → Linktree with six buttons → website → pricing → no booking action → `STOP` / exit. A question/arrow searches among choices before each tap. |
| S03 | Valerie bridge | Diagnose: the post is not the problem; the break happens after it. |
| S04 | Evidence + VO | Ask how a patient reaches `INQUIRY`. First animate a tentative direct arrow with a question mark; replace the question with a red cross to show “not immediately”. Then draw the live path Patient → Instagram → Website → Reputation → Maps → Inquiry. Nodes appear and settle in order; finish with a central burgundy check. |
| S05 | Valerie bridge | State that the four surfaces must operate as one connected decision system. |
| S06 | Evidence + VO | Visualize disagreement: surfaces present conflicting answers/next steps, routes collide into a central burgundy mismatch/alert, trust breaks and the patient exits. Do not add invented conversion numbers. |
| S07 | Valerie bridge | State the correction: not more content, one clear action everywhere. |
| S08 | Evidence + VO | Show the same booking language and the same destination on Instagram, Website, Reputation and Maps; animate clean short paths converging on Inquiry with a burgundy check. |
| S09 | Evidence closing card + VO | Summarize 4444 as one connected journey, show four surfaces converging into Inquiry, and present the sole CTA: DM `4444` for a cross-surface check. |

Talking-head scenes are S01, S03, S05 and S07. Evidence scenes are S02, S04,
S06, S08 and S09. Alternate these layers exactly; do not replace evidence with
decorative B-roll.

#### Voice, screen copy and synchronization

- Generate one complete US-English ElevenLabs master in Valerie voice id
  `lxYfHSkYm1EzQzGhdbfc`, with word timestamps. Speech begins at the opening
  and continues through talking head, evidence and closing card; no silent
  evidence interval or per-scene TTS.
- Narration must explain the action currently visible. It must not read the
  screen verbatim, narrate a later scene early or repeat the same thesis in two
  scenes. In particular, “Instagram is only the cover” may appear once as a
  visual thesis; the voice then explains what the patient checks next.
- Scene boundaries derive from the narration timestamps. Evidence animation is
  retimed to the spoken explanation, never the reverse by arbitrary hold.
- Post-process the master before assembly: remove hum/room tone, preserve
  natural speech, normalize the final mix and reject audible joins, clicks,
  duplicated words or speech gaps longer than one second.

#### Valerie continuity

Use one locked Valerie identity and one locked look across S01/S03/S05/S07:
same face, hair, orange satin top, background/light universe, crop family and
voice. HeyGen is an approved speaking-plate/lip-sync path for this Format A
contract when it uses the prepared ElevenLabs segment and does not generate or
replace the voice. A provider change must not change Valerie's appearance.

#### Deterministic evidence graphics

- Master canvas is `1080×1920`, `9:16`, `30fps`; use CAESTHETIC cream/paper,
  navy and burgundy/crimson.
- Circles, arrows, question mark, cross, check, mismatch and CTA are
  renderer-owned graphics. Draw arrows as live paths and reveal nodes in the
  order the narration names them. Use restrained easing, scale settle and
  subtle shadows; keep labels legible on a phone.
- Never use blurred, mirrored, stretched or duplicate-filled side strips.
  Never accept a Kling logo/watermark or generated app text/UI as evidence.

#### Karaoke subtitles

- Burn word-timed karaoke subtitles across the complete Reel, including
  evidence and closing card. They have **no background rectangle, pill, panel
  or blur**.
- Inactive words are cream/white with a thin navy outline and restrained glyph
  shadow. The active word is burgundy/crimson with a cream outline.
- Keep subtitles in the Reels safe zone and dynamically avoid Valerie's face,
  evidence labels, arrows, CTA and the booking path. A subtitle that obscures
  evidence is a release blocker.

#### Accepted reference master

```text
content_id: CAE-REEL-A-IG-4444-001
dropbox: Projects/CAESTHETIC/CAESTHETIC MEDIA/Production/reels/CAE-REEL-A-IG-4444-001/final/CAE-REEL-A-IG-4444-001-V3-KARAOKE-NO-BG.mp4
sha256: b213fbbff3193b04d8beb41ecb6cf203b5fd39aea0fdb0d4b0766749a3685da6
duration: 78.166667s
video: 1080×1920, 30fps, H.264, yuv420p
audio: AAC, 48kHz, stereo
```

This master is the visual/audio acceptance reference, not permission to copy
its topic or claims into another episode without a new episode manifest and
evidence review.

## 4. Closing Card V1

```text
[REAL CANONICAL LOGO] → ONE CONCLUSION → ONE CTA
```

- canvas: `1080×1920`, `9:16`;
- palette: CAESTHETIC cream / navy / burgundy;
- target duration: `1.5–2.0s`;
- logo: `site-caesthetic/assets/brand/logo-long.png`, mirrored byte-for-byte at
  `site-caesthetic/brand/logo-long.png`, from founder source
  `Caesthetic logo long transp.png`; never redraw, generate, crop or distort;
- one `5–9` word conclusion, optional one short support line, one CTA;
- final frame visually rhymes with the opener so replay does not become a hard
  brand stop;
- no new Evidence, Valerie, fake UI, decorative infographic, long URL, second
  CTA or continued explanation.

Measure retention/drop at Closing Card entry separately. A sustained break is
a reason to revisit the ritual or duration through a versioned change, not a
reason to silently alter an active batch.

## 5. Evidence Bank / Observatory

Only these lifecycle states exist:

```text
CAPTURED → PUBLISHABLE → USED
```

Every unit records source/artifact; capture date or period; epistemic label;
verified observation; allowed public wording; method/scope where required;
privacy, rights, consent and redaction status; and reviewer/verification
required by its risk class. Missing provenance, rights or verification keeps a
unit out of production. Benchmark candidates also record cohort, period, sample
size/availability, method and limitations.

Primary operating metrics are `Publishable Evidence Units / week` and
`Evidence reuse rate` (useful surfaces served per unit). Reuse surfaces include
Reel, Story, Carousel, Outreach, Growth Score, Landing/FAQ and cross-platform
distribution. Average reuse below `2` is a diagnostic sign of a content
treadmill, not a universal success threshold; establish a baseline first.

## 6. Named formats and initial backlog

Only two named series launch:

- `NOT YET`: sequencing, not a permanent prohibition. Public form:
  `X becomes sensible after Y is fixed or verified`.
- `CITY CHECK`: sales and content asset defined in §7.

`FIELD NOTES` is the default unbranded format. `WHAT GOOD LOOKS LIKE` begins as
an unnamed positive format and earns a series name only if data shows durable
value/saves. `OWNER QUESTIONS` remains an evergreen library, not a cadence.

Initial Cold Reach backlog, not production authorization before V3 freeze:

1. How many taps from Instagram to booking?
2. What happens to an enquiry after 5 PM? Until a controlled-test protocol
   exists, use only the observable public flow.
3. Don't buy more traffic yet — `NOT YET` sequencing.
4. Google, website and Instagram tell three different stories.
5. Reviews are coming in — is anyone answering them?
6. If your agency disappeared tomorrow, what would you still own?

Keep positive examples in the mix: clean booking path, clear cross-surface
handoff or good next step, followed by an evidence-bounded `why it works`.
Do not make organic duplicate A/B posts.

## 7. CITY CHECK and real Score capacity

```text
research → evidence dataset
→ 3–5 full Growth Scores / deep assessments where permitted
→ personalized outreach → aggregate publication → reuse
```

CITY CHECK is evaluated primarily by pipeline value, not views. The city may be
named; individual clinics are not identified by default in public negative
analysis without rights, consent or an approved legal basis. Public output is
aggregate and anonymized. Do not publish an aggregate before initial
personalized outreach when publication could reveal or weaken sales value.

The current market canon defines a nine-city research universe and does **not**
rank one P0 city. Scottsdale appears first in that pool and has prior smoke
evidence, but neither fact makes it the P0 candidate. CITY CHECK city selection
remains unresolved until the current market ranking is completed.

Do not build a theoretical capacity model before demand. The first CITY CHECK
produces `3–5` high-quality real assessments and measures human-hours for:

```text
research → evidence verification → diagnosis → remediation → cockpit
→ walkthrough / production → QA
```

Also record end-to-end cycle time. The same work yields factual Score capacity,
outreach assets, publishable evidence and production artifacts.

> Reach scales only as far as downstream can preserve quality.

## 8. Valerie and paid experiment order

Do not compare Valerie/no-Valerie organic posts on different topics and call it
an A/B test. If an ads layer and budget are approved, the first paid creative
test is the same Reel in two arms: `Valerie narrator` vs `voice-over/editorial`.
Hold Evidence, copy, CTA, targeting and timing constant. This precedes an opener
test because Valerie affects recurring production cost, aesthetics and
channel-wide compliance. Until results exist, Valerie is not mandatory in every
organic Reel.

Synthetic nature is disclosed where platform rules or applicable law require
it. Actual jurisdiction/platform policy needs qualified review; no unsupported
legal claim enters the canon.

## 9. CTA and response operations

`Comment SCORE → DM` and `Link in bio` are experiment arms. Neither is the
winner without downstream business evidence. If comment-to-DM is used, the
first useful response and Growth Score path must be automated/immediate; human
follow-up is measured separately. Do not publish a response SLA before `2–4`
weeks of owned response-time measurement supports it.

Owned response performance may become CAESTHETIC's first fully owned case or
benchmark, only with a disclosed period, method and scope.

## 10. Profile conversion path

P0 self-audit before scaling reach:

```text
Reel → Instagram profile → bio → pinned posts → Highlights
→ Growth Score → form
```

Within seconds the owner should understand what CAESTHETIC is, what the free
Growth Score is, what they receive and the single obvious next step. Remove
conflicts across bio, pins, Highlights and Reels and unnecessary friction.
Apply CAESTHETIC's own cross-surface/patient-journey logic to this path first.

## 11. Multi-surface distribution

One master evidence asset should be packaged natively for Instagram Reels,
Facebook Reels, YouTube Shorts and LinkedIn where useful. Do not raise production
volume merely to serve more platforms. Reuse the evidence asset; adapt caption,
CTA and packaging to each surface instead of blind cross-posting.

## 12. Measurement to revenue

```text
Reel → Profile → Score request → Score started → Score delivered
→ qualified conversation → Sprint proposed → Sprint won → revenue
```

Media diagnostics: early/3-second retention, average watch time, Pause Trigger
retention behavior, sends/reach, likes/reach, saves/1,000 views, profile visit
rate and Closing Card entry retention.

Business metrics: Score→Sprint conversion, revenue per delivered Growth Score,
revenue per publishable Evidence Unit, plus separately tracked self-use,
referrals and learning where relevant. A free audit is not success merely
because it receives praise. Cold Reach and Score Intent use their own job-level
metrics. Business outcomes outrank completion rate when choosing short versus
long formats.

Starting operating numbers:

- Publishable Evidence Units / week;
- Evidence reuse rate;
- High-quality Growth Scores / week;
- Revenue per delivered Growth Score.

Cadence, CITY CHECK volume, outreach and paid distribution derive from these.

## 13. Privacy, rights and public teardown gate

Client and third-party interfaces are sensitive by default. Redact names,
phones, emails, patient-related dates and all other identifiers. Sensitive
visual Evidence requires production QA plus a second pair of eyes before
publication.

Do not automatically label an exposure a `HIPAA incident`, or a teardown
`false light` / `disparagement`. These are operational/legal risk gates, not
legal conclusions. Policy that makes legal determinations is `legal review
required`.

## 14. Production ownership, storage and lineage

Ops/target automation, vendor access and agent answers:
`docs/ssot/CAESTHETIC_REEL_AUTOMATION.md` (DEC-854). This section stays the
editorial ownership rule.

CAESTHETIC Asset Worker creates editorial/motion, Evidence/Explanation, Pause
Trigger and Closing Card layers. ElevenLabs creates one continuous voice
master. Kling creates primary Valerie motion and capability-gated lip sync;
an approved reserve provider may lip-sync the same master segment but must not
resynthesize voice. Caption Renderer creates brand-controlled accessible
captions from master timestamps. Final assembly routes the master segments and
visual layers without resynthesizing them.

The canonical source namespace is in `CAESTHETIC_VALERIE_AVATAR_LIBRARY.md`.

```text
Production/daily-growth-note/<episode>/
  source-manifest/
  audio-master/
  motion/
  captions/
  assembly/
```

Required lineage is `source → evidence unit → full-script ElevenLabs master →
timestamps/segments → render → motion/lip-sync capability gate → captions →
assembly → final`. Heavy audio, timestamp and video artifacts stay in Dropbox;
Git stores only contracts, references and lineage metadata. Final cards route to
`Huck/stories/<request_id>/`, MP4 to `Huck/reels/<request_id>/`, thumbnails to
`Huck/thumbnails/` and retired versions to `Huck/archive/`.

## 15. Production release checklist

1. Batch records `Reel System V3.2` and track/job.
2. Evidence unit is `PUBLISHABLE`; wording, label, rights and privacy pass.
3. Runtime/class follows the evidence; no universal duration is imposed.
4. Valerie usage matches the organic rule or clean paid-test protocol.
5. One CTA; comment-to-DM has an immediate useful response when selected.
6. Closing Card V1 is `1.5–2.0s`, loops visually and adds no claim.
7. Sensitive visual QA and platform/synthetic disclosure gates pass.
8. Distribution variants retain the same evidence and native packaging.
9. Measurement continues through Sprint won and revenue.
10. One ElevenLabs master uses voice `lxYfHSkYm1EzQzGhdbfc`, begins at `t=0`,
    and covers every voiced scene with ordered, non-overlapping segments.
11. `voice_over` cards route the same master; no scene-level TTS is requested.
12. Motion/lip sync passes its declared capability gate and never resynthesizes
    Valerie's voice.
13. Founder-locked Format A uses the exact nine-scene alternation in §3B;
    narration continues and remains synchronized through every Evidence scene.
14. Valerie's face, hair, orange satin top, background/light and crop family
    remain continuous across S01/S03/S05/S07.
15. Karaoke subtitles have no background and obscure neither Evidence nor CTA.
16. Full decode, frame/contact-sheet review, audio hum/silence check, final
    metadata and SHA-256 verification pass before Dropbox delivery.
17. Publication uses the exact approved file, caption, account and schedule.
    A prepared upload is not a published Reel: verify the live post URL and
    platform/account after the final publish action.
