---
document_id: ENT-DOC-IG-COMMENT-ROUTING
 title: CAESTHETIC Instagram Comment Inbound Routing
status: working
authority: implementation
primary_domain: marketing-ecosystem
---

# CAESTHETIC Instagram Comment Inbound Routing

## Purpose

Comments requesting content or reacting to CAESTHETIC posts are treated as inbound signals, not immediate sales leads.

Flow:

`Comment → public acknowledgement → context DM → role identification → route`

ManyChat may call `lookup-caesthetic-instagram` before the first DM to branch `matched` / `not_found` by exact username against the private CAESTHETIC CURRENT release. Contract: `docs/ssot/CAESTHETIC_IG_LOOKUP.md` (DEC-827). `matched` is not a sales lead by itself — still identify role. The CURRENT deny overlay is removed before projection, so a denied username returns `not_found`.

## First DM rule

Do not resend content the person has already consumed.

First DM must identify:
- who is writing;
- why the person receives the message;
- what CAESTHETIC does;
- one simple qualifying question.

Example:

"Hi! This is CAESTHETIC Growth. Thanks for checking out our Growth System post 🙌"

"Are you running a practice, planning one, or exploring?"

## Routing

### Current owner/operator

Route to Growth Score conversation.

Do not send links or offers before confirming context.

### Future founder / investor

Allowed conversation:
- med spa launch;
- aesthetic business development;
- beauty business;
- dental and wellness opportunities when relevant.

Do not broaden public ICP. CAESTHETIC public positioning remains aesthetic practice growth systems.

Ask:

"Are you thinking about starting a practice, investing in one, or just exploring the industry?"

### Observer

Nurture only. No sales follow-up.

## Principles

- Do not treat every commenter as a lead.
- Use self-discovery questions before presenting an offer.
- Keep first conversation human and contextual.
- No medical advice, PHI collection or patient discussions.
