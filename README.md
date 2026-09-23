# Roberta Jafet — Chapters 01–05

Five art-directed scenes: the opening, many forms, the pause, the story, and
the index. Productions, gallery,
press, contact, navigation and footer are deliberately not built; the page ends
after chapter 05.

No framework, no build step.

```
site/
  index.html              markup — light layers, name, roles
  assets/css/hero.css     chapter 01, in eleven numbered sections
  assets/css/unfurl.css   chapter 02, in eleven numbered sections
  assets/js/hero.js       drives the follow spot; the CSS does the rest
  assets/js/unfurl.js     builds the wall, writes --u from the page scroll
  assets/css/calm.css     chapter 03, in ten numbered sections
  assets/js/calm.js       one observer for both light chapters; smallest file here
  assets/css/story.css    chapter 04, in eight numbered sections
  assets/css/worlds.css   chapter 05, in eight numbered sections
  assets/js/worlds.js     decides which world is open; the CSS does the rest
  assets/js/lang.js       wires the PT / EN switch
  assets/img/             drop her photographs here (see README.txt inside)
  server.js               local preview only — not part of the deliverable
```

## Running it

```bash
node site/server.js
```

Then open `http://localhost:4173`. Any static host will do. Fonts come from
Google Fonts and each has a real fallback stack, so the page survives without
them.

## The idea

A follow spot in a dark room. It searches, finds her name, and opens on it.

**The name is only visible where the light falls.** It is set twice: a faint
ghost that is always there, and a bright copy masked to the spot. As the light
crosses the name, letters come up and fall away behind it. That mask is the
whole concept — she is revealed by being lit, not by being drawn.

Everything on screen is light, type, or the grain of the room. There is no line
work, no diagram and no drafting: the earlier architectural version was retired
because it explained her instead of presenting her.

Rose is the only hue on the page and it exists as light — the shaft from above,
the spot, the roles line, the haze in the air. The
ground stays a warm plum-black so the rose reads as illumination rather than
paint.

## Type

- **Libre Baskerville** for the name — Roberta's choice. Set in caps at display
  size with light tracking, which is where this face turns from a text serif
  into something classical and title-page-like.
- **Archivo** for the roles line, small and widely tracked, in rose.

The name is sized to about 69% of the viewport width on desktop and 79% in
portrait, where it stacks onto two lines rather than shrinking to fit one.

## The opening

`hero.js` writes five live values to `:root`; the CSS reads them and does
everything else.

| | |
|---|---|
| `--sx` `--sy` | where the light is, in px |
| `--sr` | how open it is, in px |
| `--lum` | how bright, 0 → 1 |
| `--tilt` | beam angle, so the cone always leans toward the spot |
| `--p` | scroll progress through the hero, 0 → 1 |

The path, in milliseconds:

| | |
|---|---|
| 380 | the light exists — small, low, off to the left |
| 380 → 2500 | it sweeps the room, riding up over the middle, searching |
| 2500 → 3250 | it slows and turns back toward centre |
| 3250 → 4900 | it opens on her, and the roles arrive |
| 5600 | the scroll cue |

This lives in code rather than in keyframes because it is a path through a room,
not a set of states: the light has to search, slow, change its mind, settle, and
then hand over to the cursor. Retime it via `T` and `CUES` at the top of the file.

After it settles the light belongs to the visitor — it leans a *fraction* of the
way toward the pointer and breathes when nobody is there. An operator nudges a
follow spot; they do not throw it. Any scroll, tap or keypress during the
opening fast-forwards to the lit stage.

## The scroll transition

Across a 210vh runway, `.hero__frame` stays pinned while `--p` runs 0 → 1: the
spot and its floor pool swell past the viewer, the name rises and grows, and the
blackout closes. At 1.0 the room is dark again.

## Handing off to chapter 02

The hero ends fully black, and chapter 02 opens from exactly that black. Nothing
leaks out of the hero: its CSS is scoped under `.hero`, `.light`, `.type` or a
phase class, and `hero.js` stops computing once the hero leaves the viewport.

## Behaviour worth preserving

- **Reduced motion** — the lit room is still delivered, just arrived at rather
  than performed. No sweep, drift, grain flicker or scroll scaling. Section 11.
- **No JavaScript** — the CSS defaults are the *settled* state, so the page
  renders fully lit. The `.js` class on `<html>` is what hands control to the
  sequence.
- **Screen readers** — the name is a real `<h1>` with an `.sr-only` copy; both
  visual layers are `aria-hidden`, as is every light element.
- **Two mask gotchas**, if you move things: the lit layer must stay full-bleed
  and positioned against `.type`, because that is what puts its mask in viewport
  coordinates so `--sx`/`--sy` can address it directly. And the beam is a conic
  gradient rather than a clipped polygon — a polygon gives the cone two hard
  edges that survive any amount of blur and read as a graphic wedge.

---

# Language

She lives in the United States and works in Brazil, so the site opens in both
and lets the visitor choose. A small `EN — PT` switch sits fixed at the top
left, appearing with the scroll cue so it never interrupts the opening.

**The swap is CSS, not script.** Each translated element carries `data-l="en"`
or `data-l="pt"`, and one rule in `hero.css` §13 hides the other one:

```css
:root[data-lang="en"] [data-l="pt"],
:root[data-lang="pt"] [data-l="en"] { display: none; }
```

That keeps inline markup intact in both languages — the italic show titles, the
company name set in her colour — which a `textContent` dictionary would flatten.
`display: none` also takes the hidden copy out of the accessibility tree.

The choice is made **before first paint** by the inline script in `<head>`: it
reads a remembered choice from `localStorage`, and otherwise follows the
browser's own language. `lang.js` only wires the buttons, so the page never
flashes the wrong language.

**Adding a string:** write both versions as sibling elements with `data-l` and
matching `lang` attributes. Nothing else is needed.

**One thing to watch:** Portuguese runs longer than English. When you add copy,
check the line ends against the layout at both languages rather than only one.

---

---

# The Menu

`assets/css/menu.css` · `assets/js/menu.js`

A full-screen overlay, not a drawer. The site opens with a follow spot searching
a dark room for her name; the menu is that room again — it shuts the page out,
comes up black under the same rose bloom, and lights the chapters one after
another. A drawer sliding in from the side is furniture borrowed from somebody
else's site. This costs the same to build and belongs to hers.

**The button does not become an X.** Three unequal lines converge into one — a
beam closing to a slit — and open again on the way out. An X is the mark every
site uses; a closing aperture is the mark this one has been making since the
first frame.

The panel opens as a `clip-path` circle expanding from the button's own corner,
so the room arrives from where it was asked for rather than fading in over
everything.

## What the script actually handles

Everything visual is CSS reacting to `.menu-open` on `<html>`. The script keeps
four things honest:

- **Scroll position.** `overflow: hidden` on `<html>` drops the page to the top,
  so the position is saved on open and put back by hand on close.
- **Focus.** Tab is trapped inside the panel. An overlay that lets focus wander
  onto the page behind it is its own kind of trap — the ring disappears
  somewhere nobody can see.
- **Escape**, and closing on any chapter link before the smooth scroll runs.
- **The button on paper.** Chapters 03 and 04 are light and a chalk button
  vanishes into them. A thin observer band across the top of the screen flips it
  to `--paper-ink` while either is directly behind it — the button only cares
  what is under it, not what is on screen.

## What needs you

**The contact address.** The foot links her CV (the PDF from her current site)
and had a contact link, which was removed rather than guessed. A wrong `mailto:`
on a working actress's site sends her enquiries into a void.

---

# Chapter 02 — Many Forms

`assets/css/unfurl.css` · `assets/js/unfurl.js`

**One artist. Many forms.** A wall of her work unfolds out of the dark:
portraits, performance, stage, backstage, production, creative work, personal
pictures.

Adapted from the 21st.dev *3D parallax unfurling gallery*. Two things were
changed deliberately.

## 1. No nested scroll

The original wraps itself in `h-screen overflow-y-auto` and hands that element
to `useScroll` as `container`. That puts a second scroller inside the page, and
the wheel visibly changes hands at the section boundary.

Here the scene is measured against the **document** scroll, exactly the way
`hero.js` measures itself — a sticky 100vh frame inside a 560vh runway. There is
no scrollable element anywhere in the section. Verified in the rendered page:
zero nested scrollers.

## 2. React/Framer, ported to this project

This site is plain HTML, CSS and vanilla JS with no build step (see **Stack**).
Framer's `useSpring` is replaced by a lerp toward the raw scroll position, which
gives the same eased, slightly-trailing settle without a runtime. `unfurl.js`
writes one number, `--u`; `unfurl.css` does the rest.

## The transition out of the hero

The hero ends on black with her rose still in the air. `.unfurl__ember` holds
exactly that glow, and only lets go once the first pictures have come out of
depth — so the two chapters overlap rather than butt together. The wall arrives
from `translateZ(-1050px)` into an unframed, full-bleed dark. The original
component opened an inset rounded plate with a hairline edge at this point; on
screen that read as a card floating on the page, so it was removed outright.

| `--u` | |
|---|---|
| 0 → .16 | the hero glow is held as the wall comes out of the dark |
| .08 → 1 | the wall travels forward out of depth, rotation settling |
| .12 → .32 | *More than one way* — large, high left, over the pictures |
| .50 → .73 | *to tell a story.* — large, low right, further forward |
| .74 → .93 | the exit: the wall recedes and fades, the tilt unwinds to square |
| .88 → .94 | her sentence alone on the black — the beat that lets it be read |
| .93 → 1 | the sentence leaves last; a rose glow stays behind |

## The exit

This is what makes the scene read as finished rather than cut off, and it was
missing at first. Without it the wall is still at full strength when the sticky
frame releases, so the next chapter guillotines it mid-picture and mid-word.

Three things happen, in this order:

1. The pictures recede and fade (`--pe`, .74 → .93). They are faded on
   `.frame`, never on `.unfurl__col` — opacity on a column would flatten its
   children out of the 3D space and collapse the depth.
2. **The tilt unwinds to square.** rotateY runs −26° → −5° on the way in and
   then back to 0° on the way out, so the last thing on screen is read
   face-on rather than in perspective.
3. Her sentence holds through all of it and leaves last (`--pz`, .93 → 1).
   Measured at `--u` .90: the pictures are down to 15% and both halves are at
   100% — that gap is the beat that lets the sentence be read.

The rose glow is deliberately *not* faded out with the rest. It is what chapter
03 opens out of.

## The seams, and two things about 3D contexts

Both joins into and out of this chapter were showing a hard horizontal line —
the wall arriving and leaving on a straight edge instead of continuing the
black. Two separate causes, both worth knowing before touching this section.

**1. `perspective` creates a 3D rendering context, and its children sort by Z,
not by `z-index`.** The edge fade was inside `.unfurl__stage`, which carries
the perspective. It sat at Z 0 with `z-index: 5`, while frames run to +95 and
the type ran to +580 — so everything in front rendered straight through it and
could not be faded at all. The fix is not a bigger z-index: the overlay has to
live **outside** the stage, as a sibling in `.unfurl__frame`, where it is plain
2D and covers the lot. That is `.unfurl__edges`.

**2. Type brought forward in perspective is also thrown outward.** The statement
used to ride inside the matrix, and the exit gave it a `translateZ` to cancel
the wall receding. Coming forward magnifies it *and* pushes it away from the
vanishing point, so both halves drifted toward the edges — into the new fade —
at exactly the moment they were meant to be read. It now lives in
`.unfurl__type`, flat 2D above the fade, with its own small rise and cursor
drift. Measured across the scroll, the first line moves 39px instead of 130px,
and neither half ever enters a band.

Chapter 03 completes the fix from its side: `.calm__dawn` holds **pure ink to
21%** before it starts to warm, so the join reads as the black continuing rather
than as an event.

## Where pink went

In chapter 01, rose is light. Here it takes a new job: `.unfurl__leak` sits at
`translateZ(-760px)`, **behind** the whole wall, and shows through the gaps as
the columns part. The pink is literally behind her world rather than painted on
top of it.

Everywhere else it is only an edge: a 7% inner ring on each frame, and one word
of the statement.

## What was pulled back from the original

| | original | here |
|---|---|---|
| rotateY | −45° → −8° | −26° → −5° |
| rotateX | 25° → 4° | 15° → 3° |
| rotateZ | 15° → 2° | 8° → 1.5° |
| translateZ | −800 → 0 | −1050 → 0 |
| perspective | 1000px | 1500px |

Deeper start, flatter arrival — it reads as cinematic rather than as a
perspective stunt.

The frames also lost their component-library behaviour: no `hover:scale`, no
dimmed resting state, no uniform tile. Each is a floating photographic frame
with its own height and its own position in depth, and the only hover is light
arriving on it.

## The photographs

Her own — 21 of them, pulled from the full-resolution originals behind
robertajafet.com and resized to 1400px on the long edge (28 MB down to 1.8 MB).
They go up **ungraded**: most were shot on black already, which is why they sit
in this page without any help.

The untouched originals are archived outside the deployable folder, in
`FOTOS ORIGINAIS/` at the project root, together with the production logos the
scan also turned up.

Adding, removing or reordering is one array — `ROBERTA_IMAGES` at the top of
`assets/js/unfurl.js`:

```js
{ src: "assets/img/stage-ensemble.jpg", ar: 1.398, kind: "stage" }
```

| | |
|---|---|
| `src` | where the file lives |
| `ar` | the picture real width ÷ height |
| `kind` | what it is of — sets how far the frame floats in front or behind |

`ar` is what stops the wall looking invented: **the frame takes the shape of the
photograph**, so nothing is forced into a crop it was not shot for. Her set is
genuinely mixed — 10 portrait, 8 landscape, 3 square — and the frames simply
admit it. The one thing imposed is a 52vh ceiling so a single tall portrait
cannot run a whole column, and where that ceiling bites the crop is biased
upward, taking it off her feet rather than her face.

`kind` is one of `portrait · performance · stage · backstage · production ·
creative · personal`, mapped to a depth in the `DEPTH` table just below the
array. Performance and stage sit furthest back so the wall has somewhere to
recede to.

## Responsive

Desktop 4 columns · tablet 3 · phone 2, with rotation, depth and perspective
reduced at each step, so small screens get bigger pictures rather than four
slivers.

## Reduced motion

A genuinely simplified experience rather than a disabled one: the sticky frame
and the 3D are dropped entirely, and the wall becomes a flat, static, wrapping
grid with the statement set as ordinary centred type. Everything
is still delivered; nothing moves.

---

# Chapter 03 — The Pause

`assets/css/calm.css` · `assets/js/calm.js`

Somewhere to breathe.

## The idea is the change of gear

Chapters 01 and 02 are both pinned scenes scrubbed by the wheel: a choreography
runs and the page itself never moves. **This section sits in normal flow**, so
after two scenes of held motion the page finally just scrolls.

That is the pause — more than any amount of white space would be. It is also why
`calm.js` is the smallest file on the site: there is no per-frame loop here at
all, because there is nothing to scrub. An `IntersectionObserver` marks each
element as it is reached, once, unobserves it, and disconnects when the section
is done.

## The first light

The page has been black since the first frame. Here the house lights come all
the way up, onto warm off-white paper.

- `.calm__dawn` carries the dark of chapter 02 into the top of this section and
  lets it burn off. It runs opaque stops all the way down — black, through her
  plum and rose, into paper — rather than a translucent dark laid over the
  paper, which produced a grey-mauve smear instead of light. This is finally the
  ramp the site has wanted since chapter 02: **black → pink → warm off-white.**
- `.calm__dusk` takes it back down at the bottom, where her productions begin to
  surface, so the section hands off toward the dark again.

## The spread

Asymmetric on purpose. The words hold the left, the picture holds the right, and
the space between them is the point — this is the section that is meant to
breathe.

**The picture sits inside the page margin rather than running off it.** It bled
off the right edge at first, which on screen read as a slab shoved into the
corner: all of the air ended up on one side of it. Now the spread has two edges,
and the negative space is between the two elements instead of behind one of
them.

Its column is sized so the crop stays portrait (about 0.8) rather than squaring
her off — if you change the column ratio, check that number, because
`object-fit: cover` will happily crop a tall photograph into a letterbox.

## Copy

Placeholder, in both languages:

> A life shaped by performance, curiosity and the courage to keep *evolving*.
>
> Explore the roles, productions and worlds that shaped her journey.

*evolving* is the one word in her colour — the sentence turns on it, so it is
the only word that gets it. The invitation is a line of type with a rule under
it, not a button: it reads as the last sentence of the paragraph, because that
is what it is.

## How it hands over

The pause ends on the statement and the portrait, and hands straight to the
story. Two things used to live down here and have both moved: the production
titles (they ran twice, here and again in the index) and the invitation (it
handed over before the story had been told).

---

# Chapter 04 — The Story

`assets/css/story.css` · `assets/js/band.js` (the lift is shared with chapter 03, in `calm.js`)

Her biography, set as a magazine profile rather than a résumé.

## Why it sits here

Not in chapter 02 — that is the moving wall, and prose would fight it. Not in
chapter 03 either: the pause is meant to stay short, and filling it undoes the
reason it exists. So the story gets its own room, on the same paper as the
pause, between the breath and the index.

The invitation moved down here with it. At the end of chapter 03 it was handing
over to the productions before the story had been told.

## Two lines, and everything sits on one of them

The copy is hers, unedited. What is designed is its shape.

**The first version of this was messy and got rebuilt.** It gave each movement
its own indent — columns 1, 5, 2 and 6 — so no block aligned with any other
block and the page read as scattered. Asymmetry only works against something
regular; four different left edges is not asymmetry, it is noise.

There are now **two vertical lines**, column 1 and column 7, and every single
element starts on one of them. Variation comes from measure, scale and which
line a movement sits on — never from moving the line.

| | | |
|---|---|---|
| **the work** | line A | largest — the lede, opposite the opening picture |
| **the training** | line B | smallest, under that picture — the fine print of a life |
| **the producing** | line A | middle weight |
| **now** | line B | lifts again, and the only prose in the serif |

Rows are explicit rather than auto-placed, so the opening spread — lede left,
picture right, on one row — is a deliberate pairing and not whatever the flow
produced. Nothing is numbered and nothing is labelled; the shape of the text
does that job, which is the difference between a profile and a CV.

The first picture runs off the right edge beside the lede. The second is a
full-bleed plate carrying the Elphaba photograph, edge to edge and nearly the
full height of the screen — the one moment in the chapter that ignores the text
measure entirely.

## Edge to edge, whole, and moving — pick two

Three things were wanted here at once: the picture reaching the edges of the
screen, the whole picture, and a parallax. **Any two of those fit and the third
does not**, and it is worth knowing which one bends before touching this.

A parallax needs slack: the frame has to be shorter than the picture, and the
difference is the travel. The photograph is 3:2, so bled to a 1905px screen it
stands 1268px tall — far taller than a 945px viewport. A frame tall enough to
show all of it has no travel; a frame with travel cannot show all of it at once.

**So the width is whole and permanent, and the height is what gives.** That is
the right way round: cropping the sides would take the broomstick and the corn,
which is the reason the photograph is any good. Cropping a slice off the top and
bottom takes sky and shadow, and the drift hands both back as you scroll — the
whole picture is seen, just not in a single instant.

Sides are guaranteed by geometry rather than by `object-fit`: the image is
`width: 100%` at `height: auto`, so it renders at its own ratio and there is no
horizontal crop available for the browser to make.

## The plate works in pixels, not percentages

`band.js` measures `img.offsetHeight - frame.clientHeight` and drifts exactly
that far. The picture's height is whatever its ratio makes of the screen width,
which changes with every viewport and cannot be written into a stylesheet — so
the travel is measured rather than guessed, and no edge is ever exposed at any
size without a magic number anywhere.

Percentages were the earlier version and they were guesswork: `translateY(%)`
resolves against the element's own height, so every change to the frame or the
crop meant re-deriving the numbers by hand and getting them slightly wrong.

**The cap.** The drift takes at most 46% of the frame height, with any leftover
slack split evenly above and below so the picture stays centred on its subject.
On an ordinary desktop that cap sits above the slack and does nothing, which is
the intent — a cap that bites on normal screens is exactly how earlier attempts
ended up invisible. It engages only on wide, short viewports where the hidden
strip runs past 900px and the picture would read as sliding.

Because `y` stays within `[(slack-travel)/2, (slack+travel)/2]` and travel never
exceeds slack, the frame is covered at both extremes by construction.

**--vw, not 100vw.** `band.js` writes the document width without the scrollbar
into `--vw`, and the plate is sized from that. Plain `100vw` counts the
scrollbar and pushed the right-hand 15px of the picture off the screen — on a
plate whose whole point is reaching the edges, that is the one edge you would
notice. `100vw` remains the fallback.

**Measured working:** 380.7px of picture against 1003px of scroll on a 1905px
screen — a 38% differential — with `edgeExposed: false` throughout, frame at
`left: 0` and width exactly `clientWidth`.

## The measurement trap that cost three rounds

Worth reading before debugging anything scroll-linked in this project.

Three separate reports of "no parallax" were investigated in environments that
**were not painting frames** — the preview pane, which runs at a 0x0 viewport,
and later an automated Chrome tab that was `document.hidden`. In a tab that is
not being painted:

- `requestAnimationFrame` callbacks are never delivered, so anything loop-driven
  reads as dead
- `IntersectionObserver` callbacks are not delivered either, so `.lift` never
  gains `.is-in` and **every light-chapter element sits at `opacity: 0`** — the
  page screenshots as blank cream paper
- CSS transitions stay pinned at their start value
- a `ViewTimeline` reports `currentTime: null` while still saying
  `playState: "running"`

Every one of those looks exactly like a bug in the stylesheet, and none of it is
admissible evidence. The tell is cheap: check `document.visibilityState` and
count whether a bare `requestAnimationFrame` actually fires before trusting a
single reading.

Two implementations were rewritten on the strength of readings taken that way.
Both were probably fine.

Elphaba now appears in three places — the wall in chapter 02, this band, and
the Wicked entry in the index. That reads as a signature rather than a repeat,
but it is worth knowing it is deliberate.

## Emphasis

Taken from the bold in her own markup, not invented. Her bolding is heavy — she
marks nearly every proper noun: the shows, her mentors, the schools, the
degrees, the theatre, the orchestra, the company. Reproducing that as a typeface
change would turn each paragraph into a patchwork, so it is split into two tiers:

- **Show titles** carry her colour. The productions are the spine of the whole
  site and this is where they are first named in full.
- **Everything else she bolded** stays in the body face and simply comes up to
  full-strength ink against 78% body — present on the page, quiet in the hand.

27 emphasised phrases and 6 titles per language.

## Mobile is rebuilt, not narrowed

Position carries the hierarchy on desktop, and position cannot survive a
375px screen. So on a phone the hierarchy is rebuilt out of scale and rhythm
instead: every movement runs full measure, the lede stays clearly larger than
the detail, the close larger still, and the space between movements does the
separating the staggered columns did. Measured at 375px: 17px lede, 15px
detail, 21px close.

The plates go edge to edge, which is the one thing a phone does better than a
desktop.

## The copy is hers in both languages

The English is **not a translation** — it is her own, from the `/english` page
of her current site. An earlier pass here did use a translation; it was replaced
once the original was found, because her English differs from a literal reading
of the Portuguese in ways that matter. She calls herself an *entertainment
executive* rather than a cultural entrepreneur, the show is *Once Upon a Time*
rather than *Era Uma Vez*, and she names herself in the third person in places
the Portuguese does not.

One typographic liberty: her copy sets show titles in quotation marks **and**
bold. Here they are italic and in her colour, with the quotes dropped — italic
already marks a title, and three signals for one job is two too many.

---

# Chapter 05 — The Worlds She Stepped Into

`assets/css/worlds.css` · `assets/js/worlds.js`

An index where **the titles are the interface**. No cards, no thumbnails, no
grid — five names down the page at poster scale, and the credits, the rule and
the strength of the ink all answer to whichever one you are on.

## Type, and nothing else

There are **no photographs in this chapter**. Two versions had them and both
were cut. The first clipped the picture *inside* the letters with
`background-clip: text`, pinned to the viewport so the glyphs stayed in register
with the layer behind. The second dropped that and opened the photograph large
behind the whole list on hover, as a `clip-path` curtain. That one read as
tacky and went the same way.

What is left is the version that was always underneath: the active name comes
up to full strength, the rest sit back at 55%, a rule grows in her colour and
the credits arrive from the right. The list reads as one name lit at a time,
and the claim that *the titles are the interface* is now literally true rather
than a description of the caption under the picture.

It is also the cheapest chapter on the site — no image layers, no sticky stage,
no cursor loop.

## Everything answers to one class

`worlds.js` decides which world is open and nothing more. The change of
strength, the growing rule and the credits are all CSS reacting to `.is-open`.

## Mobile is a translation, not a fallback

There is no hover, so **the centre of the screen does the pointing**: an
observer with a `-46%` band top and bottom opens whichever title is crossing the
middle and closes it as it leaves. One world at a time, a definite hand-over,
and the credits move under the name because there is no room beside it.

Keyboard focus is wired to the same states as hover, so tabbing the list is not
a silent experience.

## Two bugs worth remembering

Both were image bugs, and both effects are gone — kept because the lessons are
not specific to this chapter.

**1. `url()` inside a custom property resolves against the stylesheet, not the
document.** Worth knowing before feeding a path through a custom property again:
it resolves relative to the CSS file that *uses* it, not the HTML that sets it,
so `assets/img/x.jpg` became `assets/css/assets/img/x.jpg` and every title came
up blank.

**2. Compound vs descendant selectors.** `worlds.js` marked the image layer
itself, so the rule had to be `.world-img.is-open`, not `.is-open .world-img`.
With the descendant version the pictures never revealed at all.

## The production opens underneath the title

Clicking a title unrolls the production below it and pushes the rest of the list
down. Not a new page, not a lightbox.

That is this chapter's own argument held to: **the titles are the interface.**
Sending a click to `/wicked` would be admitting they are only labels for
somewhere else. Opening in place also means two productions can be compared
without losing your position in the list.

**Hover and click are different states, deliberately.** Hover (or focus) is
`.is-open` — a preview that follows the cursor freely: the title comes to full
strength, the rule grows, the credits arrive. Click is `.is-expanded` — it
stays until dismissed, and one at a time, so the list never becomes a wall.

**The height animates with `grid-template-rows: 0fr → 1fr`.** That is the one
technique that transitions to *content* height. `max-height` needs a guessed
ceiling: too low clips long galleries, too high spends most of the easing on
empty space, which reads as a lag before anything moves.

**The strip is one height and natural widths.** Her stills mix 3:2 landscape
with tall portrait — measured at 587px and 267px wide against a common height.
A grid of equal cells would have to crop one of those, and cropping a production
still throws away the staging. Verified: 6730px of strip in a 1771px window,
scrolling sideways, with the row bleeding off the right edge so it reads as
continuing past the screen.

**`width`/`height` are declared on every still.** With `width: auto; height: 100%`
an unloaded image is zero pixels wide, so the strip would start empty and jolt
as each file landed.

The title row is a `<button>`, not an `<a href="#">`. It opens a panel; it does
not go anywhere, and the old anchor lied about that to the keyboard and to
search engines.

## *Once Upon a Time* is in the index now

It was missing, and its absence was the worst thing on the site. She conceived
and produced it — the bio calls her a pioneer of Brazil's post-pandemic return
for it — and an index of five acting credits with her own production left out
said she was a performer only. Her own site has always listed six.

Credits as she publishes them: *Idealização* Roberta Jafet · Dir. Bruno Sigrist ·
Music Dir. Rafael Marão · Chor. Mariana Barros · Prod. RJ Produções ·
*Realização* Ministério do Turismo · Fundação Bachiana.

## What still needs you

- **Five of the six galleries are empty.** Wicked has its 12 real stills, pulled
  from her own page and optimised from 3088px originals to 932KB for the set.
  Her other five pages are paginated galleries of the same kind; the mechanism
  is built, so each is a harvest and a data entry, not new code.
- **The credits are real** — role and house come from her own casting sheet.
  **No dates are shown**, because none could be verified. Add them beside the
  house when confirmed rather than guessing.
- **Les Misérables, Annie, School of Rock and The Addams Family have no credits
  yet** beyond role and house. Her pages carry Dir. / Music Dir. / Chor. / Prod.
  for each, the way Wicked and *Once Upon a Time* now do here.

---

# Chapter 06 — The Press

`assets/css/press.css`

Four pieces other people wrote about her, and the coda to the site.

## Not a news feed

The same four items under a heading that says NEWS read as a page that stopped
being updated in 2023; the dates become an accusation. Under PRESS they are
credentials and the dates are provenance. Nothing about the content changes.
The frame decides whether it says *she is covered* or *nothing has happened
lately*.

## On paper, and that is about rhythm

It was black first, continuing out of the index. But the site alternates: dark
wall, paper pause, paper story, dark index. Two black chapters back to back
flatten that, and the page stops breathing exactly where it should be winding
down. Paper is also the right material for the content, since these are
newspapers and magazines and they were printed.

A 34vh ramp carries the dark of the index into paper rather than cutting. Short
on purpose: the first sunrise on this site ran to 118vh and had to be cut back
after it read as a colour you scroll inside.

## Four columns, not four rows

Her own layout, and the better one. Stacked rows read as a chronology: four
entries down a page, each older than the last, finishing on 2017. Side by side
they are a body of coverage. Nothing is buried, the 2017 pieces stop looking
like the end of something, and four is exactly the number that fits a screen
without shrinking. Two columns under 1180px, one under 640px.

`margin-top: auto` on the read-more pushes it to the bottom of each column, so
the four sit on one line however uneven the excerpts are.

## What is verbatim, and what is mine

**The headlines are not translated.** Two were published in English and two in
Portuguese, and they stay as printed in both versions of the site. A headline is
a quotation of what an outlet ran. Only the label, the dates and the read-more
switch language.

**The photographs are an editorial choice.** Nobody has thumbnails of these
articles, and a screenshot of somebody else's web page is not a photograph. Each
column carries one of hers instead: the two 2017 pieces are both about the *Les
Misérables* cast and carry *Les Misérables* stills, the two profiles carry
portraits. The articles do not specify any of that.

**The fourth piece has no link.** *Mundo dos Musicais* appears on her page with
no source URL, so that column plainly does not click rather than pretending to.
Add the URL and its read-more appears on its own.

## No em dashes

Not anywhere the visitor can see one, including the tab title, which goes
through `lang.js`. If you add copy, use a comma, a colon or a middle dot.

---

# Stack

**This project is plain HTML + CSS + vanilla JavaScript.** There is no
`package.json`, no `node_modules`, no React, no TypeScript, no Tailwind and no
shadcn — checked before this chapter was built.

Chapter 02 was therefore ported into the existing stack rather than installed as
a React component. Converting the site to React and Tailwind would have meant
rebuilding the approved hero, which is out of scope.

**If you want to migrate later**, the standard path is:

```bash
npx create-next-app@latest roberta --typescript --tailwind --eslint --app
cd roberta
npx shadcn@latest init
npm install framer-motion
```

`shadcn init` writes `components.json` and sets the component alias, normally
`@/components/ui`. Keeping reusable UI there is worth doing on purpose: it is
where the shadcn CLI installs and updates components, so anything added by hand
sits alongside them instead of scattering across the tree, and the
`@/components/ui/...` alias stays stable no matter where a file imports from.

The current site needs none of this to run — `node site/server.js`, then open
the page.
