# Claude personalization proposal, full write-up (relayed file)

Relayed through the owner as a ZIP on 2026-11-25 10:28 PM. Authorship not independently verified. Advisory only; the owner decides. Concept screens are mock-ups labeled CONCEPT, NOT BUILT; only backgrounds and widgets are real live-app images. Nothing built.

# Making ClassroomBoard the teacher's own classroom: Claude's proposal

From Claude (ClassroomBoard council). This is an independent proposal.

The concept screens in this folder are labeled **CONCEPT · NOT BUILT**:
- The backgrounds and widget images in them are real (taken from live v100).
- The cards, the classroom name on the board, the scenes menu and the share screen are mock-ups.
- They're styled in the brand direction under review (ChatGPT's palette with my changes), which hasn't been approved yet.

## The big idea: personalize by teaching, not by configuring

Teachers make a classroom theirs by using it: they put their name on the door, pin up their routine and arrange the room. ClassroomBoard should work the same way:

1. **It works the second it opens.** No setup stands between a teacher and a timer.
2. **Three small choices, each with an instant visible result.** Name, view, tools, then done.
3. **Everything after that is offered at the moment it's useful,** right next to what the teacher just did, and only once.

To keep it simple, I propose **one new idea instead of five: the "scene."** A scene is a saved arrangement:
- which tools are open, and where;
- the background;
- the timer length;
- optionally, a link to a teaching material.

"Lesson setups," "classroom routines," "saved arrangements," "templates" and "shareable themes" all become scenes. Teachers learn one word instead of five. Scenes can be saved, tied to a time in the schedule, and shared.

## 1. First-time journey (screens 1–5)

| Step | What the teacher sees | Why |
|---|---|---|
| 1 | The real classroom, already working, with the toolbar visible. One small card: "This is your classroom. Make it yours? About 20 seconds." with **Make it mine** and **Just start teaching**. | A teacher with a class arriving taps a tool and never sees another prompt. |
| 2 | "What do your students call this room?" As they type, **"Room 14 · Ms. Rivera"** appears on the board. | Seeing the classroom's own name on the board is the strongest moment of ownership. It's optional and never shared. |
| 3 | "Pick the view from your window." Six photos; tapping one changes the board behind the card. | An immediate, beautiful reward. |
| 4 | "What happens in your room most?" Activity chips (Keeping time, Calling on students, Quiet work, Explaining on the board, Group work, Daily routine, Quick votes). The toolbar below rebuilds as they tap. | Activities, not grade level, decide the toolbar. A 1st-grade teacher and a physics teacher may both pick "Keeping time." |
| 5 | Done. A single calm line: "Your classroom is saved on this computer. **Keep it on all your devices**" with a close button. | The account is offered after the teacher has made something worth keeping. Closing it hides it for good. |

**Rules:**
- The card never covers the whole screen, and Escape or tapping outside closes it.
- No step is required.
- It never appears again after it's finished or skipped.
- It doesn't appear on `?view=board`.

## 2. What teachers can personalize, and when it's offered

| What | When it's offered (only once) |
|---|---|
| Classroom name on the board | First visit (step 2). Later: tap the name on the board. |
| Background, including their own photo | First visit. Later: long-press the background → "Change view." |
| Toolbar | First visit (step 4). Later: when a tool from More is opened a third time: "Add Dice to your toolbar?" |
| Class list | Right after names are typed into the name picker: "Keep these 24 names for next time? Saved on this computer only." (screen 6) |
| Scene | When two or more tools are open and arranged: a small "Save this layout" in the classroom-name menu (screen 7). No pop-up. |
| Schedule | After the first schedule is made: "Use this for every Monday?" |
| Schedule linked to a scene | When a schedule exists and a scene exists: an optional "Open Quiet work at 10:30" toggle on that row. |
| Clock and date | Never prompted. Tap the clock → its settings. |

**Rule: at most one suggestion per class period, and never while the timer is running or the whiteboard is in use.**

## 3. Starting points

Use **activities, not grade-level presets** (step 4). The founder's instinct here is right, and I'd go further: no "Elementary / High school / Tutoring" packs at all. They make teachers sort themselves into a category before they've seen anything.

Ready-made scenes can still exist, as examples in More and as shared links: "Quiet study," "Morning arrival," "Group time," "Test conditions."

## 4. Ownership

- **The classroom name on the board** is the single most valuable addition: one line of text, and the board becomes theirs.
- **Their own photo as the background** (already possible; make it more visible).
- **Scenes named in the teacher's own words** ("Mishnayos," "Silent reading").
- **A quiet greeting, off by default:** "Good morning, Room 14" shown for a few seconds at the first open of the day. It fades away and never interrupts.
- **Signing in is described as keeping, not unlocking.** Nothing is ever locked behind an account.
  - Guest work stays usable.
  - Signing in only adds "on all your devices."
  - Everything made as a guest moves into the account (existing merge; I haven't tested it).

## 5. Reasons to come back (real value, no manipulation)

1. **Ready when you walk in.** The board opens with the name, the view and the scene for this time of day.
2. **Tomorrow is ready.** At home on a laptop, put scenes into tomorrow's schedule. At school, the right scene is there at the right time. The board only *offers* the scene ("Quiet work is next · Open"), so the teacher stays in control.
3. **Nothing gets lost.** Lists, schedules, whiteboards and scenes are kept.

**Never:** streaks, badges for teachers, push notifications, "you haven't visited" emails, or countdown pressure to sign up.

## 6. Account creation

- **One offer at the moment of value:** after the first visit is finished, or after a class list or scene is saved, whichever comes first.
- **A second natural trigger** the teacher starts themselves: choosing "Open on my laptop or phone."
- **Closing the offer hides it.** A small "Saved on this computer" line stays in Settings.
- **The words:** "Keep your classroom." Never "Sign up to continue."

## 7. Sharing (screen 8)

- **What gets shared:** a **scene**, as a link or QR code.
- **No server needed:** the scene's settings travel inside the link itself, in the part after the `#`, which browsers never send to the server. So:
  - nothing new is stored on our side;
  - there's nothing to moderate;
  - it works for guests too.
- **Included:** tools, positions, built-in background, timer length, the scene's name, and Text widget content *only if the teacher ticks it*.
- **Never included:** student names, class lists, behavior marks, schedules containing people's names, uploaded photos, or Drive files.
- **What the receiver sees:** an "Includes / never includes" panel, then **Try it now** (temporary) or **Add to my classroom** (a copy they can change).
- **Growth effect:** every shared link opens a working classroom that ends with "Make it yours."

## 8. Marketing connected to personalization

- **"Set up your room in 20 seconds"**: a real screen recording of steps 1–4. It's the strongest possible demo because something changes on every tap.
- **"Scene of the week"**: a scene a teacher shared, published only with their permission and only by first name or initials.
- **A back-to-school campaign:** "Your room, ready for day one."
- **The share card itself:** "Quiet work, a classroom scene shared with you." It sells the product without an ad.

## 9. Prioritized plan

Effort sizes are my estimate.

| # | What | Effort | Why this order |
|---|---|---|---|
| 0 | Fix basics first: phone toolbar, one brand applied, reliable saving | S | Personalization is worth nothing if saving fails or Settings can't be reached. |
| 1 | Classroom name on the board + first-visit card (steps 1–5) | M | Biggest ownership gain for the least added complexity. |
| 2 | "Keep these names" moment + one-time account offer | S | Turns real investment into a reason to sign in. |
| 3 | Scenes: save, switch, rename, delete | M | One idea replaces five; the base for sharing and "tomorrow." |
| 4 | Share a scene by link or QR (in the link, no server) | M | Organic growth without storing anything or moderating. |
| 5 | Scenes in the schedule ("Quiet work is next · Open") | M | Daily habit: the room is ready at the right time. |
| Later | A curated gallery of shared scenes | L | Needs hosting and moderation; only if links prove popular. |

## 10. Risks

- **Getting in the way of urgent use.** Mitigation: the card is optional and never covers the toolbar; "Just start teaching" is equally prominent.
- **Scenes grow into a feature maze.** Mitigation: scenes have exactly three actions (save, switch, share), and there are no folders.
- **Student data leaking through sharing.** Mitigation: an allow-list of what can be shared, Text excluded by default, and an "Includes" panel before sending.
- **Long links.** Mitigation: built-in backgrounds only, sent by ID; scene settings are small.
- **Sync conflicts between home and school.** Mitigation: the latest edit to each scene wins, with Undo; test this before stage 5.
- **Right-to-left languages.** Mitigation: every card and the board name must be checked in Hebrew and Yiddish.
- **Breaking our own privacy promise while measuring.** See below.

## 11. How we'd know it actually helps

**This needs a decision from the founder.** The privacy page promises "no analytics trackers," and that promise is part of the brand. I suggest:

1. **A pilot first.** Recruit 10–15 real teachers across different grade levels and school types. Check in after week 1 and week 3 (15-minute calls) and ask:
   - Did you name your classroom?
   - What did you reuse?
   - Did you share anything?
   - What annoyed you?
2. **Counts anyone could look at.** If numbers are needed: anonymous, opt-in, counts only, no IDs, and announced on the privacy page. Count only:
   - first visits that open a tool within 60 seconds;
   - first visits that finish or skip the card;
   - scenes saved;
   - share links opened, and copies kept.
3. **Signals of success:**
   - Most first-time visitors use a tool within a minute, whether or not they personalize.
   - Teachers in the pilot open it on most school days in week 3.
   - Shared scenes get kept by the receiver.
4. **Signal to stop:** if pilot teachers call any card "in the way," cut it.

## Where I challenge the brief

- **"Exciting" personalization:** calm beats exciting. The reward is seeing your room appear, not animation.
- **Separate lesson setups, routines, templates and themes:** that's four objects too many. Make them all scenes.
- **Grade-level starting points:** skip them; activities are enough.
- **Saved teaching materials inside every scene:** keep it to one optional link per scene, or scenes become file managers.
- **Measuring engagement:** don't, without telling teachers; the trust we'd lose is worth more than the data.
