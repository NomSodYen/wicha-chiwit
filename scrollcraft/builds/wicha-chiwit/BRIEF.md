# BRIEF · วิชาชีวิต

**Self-authored, not interviewed.** Sootlor asked for the app to be redone with
scroll-craft ("มันไม่สวยอ่ะ แถมข้อมูลก็มีน้อย ใช้ scroll-craft ปรับปรุงหน้าแอปด้วยได้มั้ย")
and did not answer the eight interview questions. The answers below are
authored from the existing app, its README, and that request. Anything marked
*assumption* should be confirmed with the owner.

## The eight topics

1. **Vibe in three to five words.** A kind teacher's notebook. Calm, practical,
   a little warm. References (non-web): a well-used school exercise book with a
   teacher's red-pen corrections; a printed government how-to leaflet that is
   actually readable; the Thai saying the app already uses, "ไม่รู้ ≠ ไม่เก่ง".
2. **Journey, section by section.** Title page (what this is) → the things you
   never got taught → how one lesson works → every area of life → the lessons
   themselves → a closing page you keep (hotlines) with the one action.
   *assumption*
3. **Energy curve.** Quiet open, one loud moment early (the peak), then calm and
   useful for the long working part (the library), ending quiet and settled.
4. **Feeling, stage by stage, and the one moment.** See the curve below. The one
   moment is the red pen crossing out "ไม่รู้".
5. **One thing no other site does.** Scrolling literally corrects your
   notebook: a red pen strikes through each thing you did not know and writes
   "รู้แล้ว" next to it, linked to the lesson that teaches it.
6. **Distance from premium-minimal.** Editorial. Paper, folios, measure,
   restraint. Not luxury-dark.
7. **One unbroken world or distinct scenes?** Distinct chapters, hard cuts. A
   learning app is read, not flown through.
8. **Assets.** None. No photography, no footage, no API key for generation. The
   world is paper and type, which is genuinely the brand (a notebook), so this
   is the illustrated/typographic route rather than a fallback.

## Step 1

- **What is it, for whom:** a free Thai web app of short life-skills lessons
  (tax, ID cards, renting, money, emergencies) for young adults and anyone who
  was never taught these things.
- **What the visitor must believe by the end:** "Not knowing this is normal, and
  I can learn it in a few minutes."
- **The one action:** เริ่มบทเรียนแรก (open the first unfinished lesson). Same
  label everywhere.

## Grammar

**Chaptered editorial.** The app already calls itself "สมุดบทเรียน" (a lesson
notebook); the content is long-form substance read chapter by chapter.

Why the others lost: *filmic one-shot* needs footage and a single persuasive
arc, and this is a tool people return to. *Live surface* fits the library but
bans display type and any hero, and the first visit needs a title page.
*Continuous world* has no geography to travel. *Typographic poster* cannot hold
a 47-item working library. *Gallery/catalog* bans the peak's argument shape.
*Split stage* has no two-sided argument. *Rhythmic cutlist* is the wrong energy
for a calm teacher.

Grammar consequences honoured: no fixed marketing bar (a folio in the margin
instead), no drift (each chapter is a hard change of ground), no scrub, no
magnet, no spotlight, title page with no media above the fold, close is a
colophon with the CTA as running text.

## Journey and feeling curve

| # | Chapter | Feeling | What causes it |
|---|---|---|---|
| 0 | Title page | Curiosity | A notebook title page, three paper planes separating as you start to scroll |
| 1 | ไม่รู้ (the peak) | Recognition, then relief | Five honest "I don't know how to…" lines; scroll drives a red pen through each one and "รู้แล้ว" is written beside it |
| 2 | One lesson | Confidence | A real lesson page wipes in, step, checklist, quiz |
| 3 | Twelve areas | Breadth | The twelve areas of life travel sideways as an index |
| 4 | The library | Control | The working list: search, filter, follow a path, mark done |
| 5 | Colophon | Calm, settled | Hotlines set like a printed back page, one line of running text to start |

**The peak.** Chapter 1. Sentence a visitor would say: *"you scroll and a red pen
crosses out everything you didn't know, and writes รู้แล้ว next to it."*
It gets the largest span on the page (3.2 viewport-heights) and the quietest
act in front of it (the title page settles to plain paper before the pin).

**Tell-someone sentence.** It's the site where scrolling takes a red pen to the
things you never got taught.

**Authored silence.** None. The library is long on purpose: it is the working
surface, not filler, and is plain flow.

## Score

| Chapter | Device | Why |
|---|---|---|
| Title page | `parallax` (three paper planes) | Depth with no media: the page lifts off the desk |
| ไม่รู้ | `pin` + bespoke red-pen strike from `--sc-p` | Held breath, then each strike is a release |
| One lesson | `reveal` | A blank page becoming a lesson is a change of state |
| Twelve areas | `pan` | Lateral reads as breadth, not hierarchy |
| Library | `flow` + `in` | The tool. Compressed, no pinning |
| Colophon | `reveal` (up) | The back page closes the book |

Five families, no family twice in a row, zero scrub, one pin.

## Signature move

**The red pen.** An SVG pen stroke per line, its `stroke-dashoffset` driven from
the peak act's progress, drawn sequentially through each "ไม่รู้" line, followed
by a handwritten-weight "รู้แล้ว" margin note that is a real link into the
lesson. Under reduced motion the page shows the corrected state.

## Length

Title page ~1, peak 3.2, lesson ~1.4, areas 2.8, library ~4 (47 rows), colophon
~1.2. Roughly 13 to 14 viewport-heights on desktop. The library is a tool and
is not counted as an act to be paced.

## Verification (2026-11-05)

Harness: `shoot.mjs` from scroll-craft, run against `python3 -m http.server`
with installed Chrome, at 1440×900, 390×844, and 1440×900 reduced motion.

- Dead scroll: none detected in all three runs.
- Cues never reaching full opacity: none. The page uses no engine cues; the
  peak publishes its painted state through `data-sc-verify-state`, so its five
  strokes are checked for dead scroll too.
- Contrast: the harness only grades `[data-sc-cue]` text and this page has
  none, so a page-local pass (`contrast.mjs`, same method: hide text, re-shoot
  the frame, grade each visible line against the worst composited pixel on the
  ink's side, fixed chrome hidden) graded ~200 text elements per run. Phone:
  0 failures. Desktop: 2 rows left, both inside the lesson sample in chapter 2:
  one is a frame mid-wipe where the clipped half of the line is not painted,
  the other is the answer box's own 1.5px border falling inside the text box.
  Neither is a visible defect (checked on the full-size frame).
- Pan overflow measured: the rail is wider than the viewport at both widths.
- Reduced motion: no transforms, pen shows the corrected state, rail becomes a
  native scroll region, every chapter readable.

Not verified: a real phone (iOS Safari / Android Chrome), keyboard-only pass
beyond tab order spot checks, screen reader.

## Feel check (cold scroll, then diffed)

| Chapter | Intended | Felt | Change made |
|---|---|---|---|
| Title page | Curiosity | Calm, a bit sparse | Tightened the headline so it holds two lines, no orphan word |
| ไม่รู้ | Recognition → relief | Relief, clearly the biggest moment | Correction raised so it no longer collides with Thai tone marks |
| One lesson | Confidence | Confidence | None |
| Twelve areas | Breadth | Breadth | Phone tiles made taller so the stage is not mostly empty |
| Library | Control | Control | None |
| Colophon | Calm, settled | Settled, ends on content | None |

The peak is the largest visual change on the contact sheet and holds the most
scroll (3.2 vh). The title page in front of it is the quietest screen.
