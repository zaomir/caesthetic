# Monroe — Social evidence pass

Checked 2026-09-10. Public evidence only. No Lead Intake, account changes, messages, follows or private analytics.

## Decision

Social is now partly assessed directly, not merely discovered in search. There are two verified opportunities: the network website links to an unpopulated Instagram destination; Queen City's established shared account presents Charlotte in its expanded bio without naming Monroe or sinus. Neither observation independently justifies $2,500. The first may be one incorrect link; the second may be a small bio edit. A larger body of social work needs a confirmed local service and an evidenced shared priority.

## Official identities and coverage

| Entity | Official site → social destinations | What was directly inspected |
|---|---|---|
| ENT Urgent Care network | [Website](https://enturgent.com/) → [Instagram](https://www.instagram.com/enturgent), [Facebook](https://www.facebook.com/enturgent), [LinkedIn](https://www.linkedin.com/company/enturgent/) | Website DOM anchors and Instagram profile. Facebook/LinkedIn content not assessed. |
| Queen City ENT | [Website](https://www.queencity-ent.com/) → [Instagram](https://www.instagram.com/queencity_ent/), [Facebook](https://www.facebook.com/QueenCityENT), [YouTube](https://www.youtube.com/@QueenCityENT) | Official HTML links, expanded Instagram bio, visible highlight titles, first loaded grid, two full dated posts. |
| CornerStone ENT | [Website](https://cornerstoneent.com/) → [Instagram](https://www.instagram.com/cornerstoneent/), [Facebook](https://www.facebook.com/CornerStoneENT/), [YouTube](https://www.youtube.com/@CornerStoneENTVideo), LinkedIn company | Official HTML links, expanded Instagram bio, highlight titles, first loaded grid and one full dated post. |
| CEENTA | [Website](https://www.ceenta.com/) → [Instagram](https://www.instagram.com/ceenta1923/), [Facebook](https://www.facebook.com/ceenta1923), [YouTube](https://www.youtube.com/user/WeJustMakeSense), LinkedIn company | Official website DOM anchors, expanded Instagram bio, highlight titles and first loaded grid captions. |

Queen City's Facebook tracking-pixel URL was excluded from the identity inventory. The actual social profile URLs above were extracted from anchors in official HTML. The ENT and CEENTA raw HTTP reads returned 403, but their public sites were successfully read through the browser. Web extraction of some social content was throttled or limited; the available browser session successfully displayed the public Instagram profiles. This limitation did not imply inactivity.

## Reproducible observations

**ENT network:** the exact Instagram destination linked from enturgent.com displays 0 posts and **No posts yet**, a default profile image, and no practice description, location or external website link. The screenshot records the rendered state. Website linkage establishes the intended public destination, not legal ownership or control of the account. It might be a wrong href or an unfinished official account; verify before deciding the repair.

**Queen City:** expanded Instagram bio lists three ENT doctors, a practice administrator and three audiologists, plus the Charlotte address at 8924 Blakeney Professional Drive. Monroe and sinus are not named in that bio. Existing physician award posts are pinned. Visible highlight labels include Events, Audiology, Allergies, Ear Plugs, Top Doctors, Sleep Apnea, ReSound and Sponsor. Highlight contents were not played; the first visible strip is not evidence that no sinus highlight exists elsewhere.

**CornerStone:** expanded bio explicitly names sinus, allergy and hearing care in Charlotte, Monroe and Indian Land, followed by in-office sinus procedures and other services. Its single address field also shows Charlotte. The differentiator is the three-city service statement, not having only one physical address field. Visible highlights include Sinus and Walkin Clinic. Both Queen City and CornerStone link to their homepages; no broken social link or absent booking is established.

**CEENTA:** bio presents the broader network and several specialties. The visible grid includes clinician-led posts tying a condition, named clinician, named office and public next step together. The observed same-day example concerns Rock Hill; the pediatric ENT example concerns Blakeney. These must not be described as Monroe examples. CEENTA is a qualitative reference for content structure, not a matched audience-size benchmark.

## Dated content sample

Target window: 2026-06-13 through 2026-09-10. This is a purposive sample, not a complete census. Exact dates below were read from rendered Instagram time elements.

| Account | Published | Post | Observed meaning |
|---|---|---|---|
| Queen City | 2026-07-31 | [Seasonal allergy and sinus pressure](https://www.instagram.com/p/DbdZvlYGGbO/) | Discusses seasonal triggers and invites allergy testing. No Monroe or same-day statement in this caption. |
| Queen City | 2026-07-29 | [Airplane ear](https://www.instagram.com/p/DbY15cxmaKa/) | Educational content and a visit invitation for lingering symptoms. No Monroe or same-day statement in this caption. |
| CornerStone | 2026-07-14 | [Same-day specialist care](https://www.instagram.com/p/Dax4HlyicIX/) | Says specialists can often see patients the same day in Charlotte, Monroe or Indian Land, and supplies a phone number and scheduling address. This is a published promise, not verified slots. |

The first CornerStone grid also displayed Sep 10 and Sep 3, Aug 26 and Aug 10, and July posts; Queen City's first loaded grid included the two July posts plus older material. These observations are not sufficient to report a complete 90-day publication count or an inactivity period. Indexed-only Queen City service content mentioning balloon/sinus was retained as reconnaissance, not used in a numerical comparison.

## What can be offered

1. **Resolve the website-linked network Instagram destination.** Confirm the intended authorized account, fix the href or complete the authorized profile with accurate branding and location navigation. Acceptance: the official website opens the agreed account and the published description/link passes a direct check.
2. **Present Monroe and its confirmed priority service in the existing Queen City account.** A bounded bio/local navigation update is a small task. A fuller module could include an approved Monroe service/provider introduction and an organized highlight only if local services, publishing rights and the larger priority are confirmed. Acceptance: published facts, location, provider/service and destination agree with the approved website information.
3. **Use a concrete competitor example when appropriate.** CornerStone demonstrates how to name location and same-day availability explicitly. Queen City's actual policy must be confirmed before similar copy is proposed. Two sampled posts do not prove that Queen City never communicates this elsewhere.

Do not sell rebuilding all SMM, promise reach/leads/revenue, or claim a conversion deficit from these observations. Stronger existing Queen City audience and provider content should be preserved. Network and partner accounts belong to different implementation scopes.

## Screenshot evidence

- `/workspace/scratch/monroe-social-queen-city-profile-20260910.jpg`
- `/workspace/scratch/monroe-social-cornerstone-profile-20260910.jpg`

These two available files are directly captured public profile areas, excluding message panels and private account navigation. The ENT network profile was also captured and visually inspected, but that browser-produced file did not synchronize to the main workspace; do not give a broken link to it. The screenshot comparisons record the evidence date, not permanent conditions. Structured sources, limitations and acceptance criteria are in `social.json`.
