# UTM convention — CAESTHETIC first lead

**Aligned with Lane B analytics** in `site-caesthetic/assets/js/analytics.js`.

Persisted keys (do not invent others):

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term      (optional; already persisted — use for city or signal class only when useful)
utm_id        (optional; Instantly campaign id if the workspace supplies one)
```

Do not add `utm_signal`, `utm_tier`, `utm_partner_id`, or other custom query keys. Put partner slug and touch number in `utm_content`. Put city in `utm_term` only when it will be queried; otherwise omit.

Lead intake already stores these fields through the Score form / `submit-caesthetic-growth-score`. Session persistence copies the first-touch UTM for the tab.

---

## Allowed values for first-lead

| Channel | `utm_source` | `utm_medium` | `utm_campaign` | `utm_content` |
|---------|--------------|--------------|----------------|---------------|
| Email Touch 1 | `email` | `outbound` | `first_lead` | `seq_t1` |
| Email Touch 2 | `email` | `outbound` | `first_lead` | `seq_t2` |
| Email Touch 3 | `email` | `outbound` | `first_lead` | `seq_t3` |
| Email resume (form started) | `email` | `outbound` | `first_lead` | `form_resume` |
| Instagram bio (**live, do not change**) | `instagram` | `organic_social` | `phase1_launch` | `bio` |
| Instagram ManyChat owner route | `instagram` | `organic_social` | `first_lead` | `manychat_owner` |
| Instagram comment / Story sticker (new) | `instagram` | `organic_social` | `first_lead` | `sticker` or `comment` |
| LinkedIn Featured / message (only after identity decision) | `linkedin` | `organic_social` | `first_lead` | `featured` / `msg` |
| Partner first approach | `partner` | `referral` | `first_lead` | `partner_first` |
| Partner one-pager | `partner` | `referral` | `first_lead` | `partner_onepager` |
| Partner slug known | `partner` | `referral` | `first_lead` | `partner_{{slug}}` |
| Client referral | `referral` | `referral` | `first_lead` | `client_intro` |
| Event follow-up | `event` | `referral` | `first_lead` | `event_{{slug}}` |

Funnel tooling’s sketch `utm_source=cold_email` is superseded here: use `email` + `utm_medium=outbound` so GA4 source/medium grouping stays standard. No seventh parameter.

---

## Live IG exception

The bio link already in production:

```text
https://caesthetic.com/growth-score/?utm_source=instagram&utm_medium=organic_social&utm_campaign=phase1_launch&utm_content=bio
```

Keep it. Do not retag to `first_lead` from this lane (that would be an Instagram profile write). New IG routes (ManyChat, stickers) may use `utm_campaign=first_lead`.

---

## URL template

```text
https://caesthetic.com/growth-score/?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}
```

Optional:

```text
&utm_term={city_or_signal_class}
&utm_id={instantly_campaign_id}
```

Values: lowercase, `[a-z0-9_]` only, max 180 characters (analytics.js clip).

---

## Reporting

First-cohort questions the UTMs must answer:

1. Which channel created the Score request?
2. Which email touch?
3. Which partner, if any?
4. Did Instagram bio vs ManyChat differ?

Do not wait on Meta Pixel. GA4 ID remains a founder credential gap (funnel SSOT §5.11); server-side lead fields still store UTM even if GA4 is empty.
