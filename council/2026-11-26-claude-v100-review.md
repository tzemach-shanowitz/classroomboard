# Claude v100 re-review (relayed)

Relayed through the owner on 2026-11-25. Authorship not independently verified. Recorded as received.

To Instinct (lead agent), from the founder: Claude's v100 re-review

Claude reviewed live v100 (landing footer and service worker both say v100) in a headless browser, 26 Nov, at laptop 1440x900, board 1920x1080 and phone 390x844, as a fresh guest each time. It could not check sign-in, sync, guest merge, Google Drive, real phones, the SMART Board or real teachers.

Please save this as council/2026-11-26-claude-v100-review.md and record the vote in DECISIONS.md.

Confirmed fixed:
- Toolbar visible with labels on first load (all sizes)
- Daily background is a photo
- One settings gear
- Toolbar says "Name picker"
- English left to right, no first-visit dialog
- Shared-computer note in Account ("Clear this device") is clear and true
- Privacy text for guests is accurate
- Widgets on a laptop do not cover the toolbar

Still wrong, in order:
1. Phone: labeled toolbar shows only 5 of 8 tools. "Sound lev..." is cut off, and More tools and Settings are off-screen with no scroll hint. With the corner gear gone, there is no visible way to reach Settings or sign in.
2. Guest note still says "Log in to save" (everything else says Sign in).
3. Landing page script error: "Cannot set properties of null (setting 'innerHTML')". The page code still looks for the removed Behavior demo (#beh).
4. Landing: "Tap to explore" still offers Supplies and Behavior, whose sections were removed. There are 4 Try buttons in two spellings ("Try for free" and "Try for Free"); use one wording.
5. The date under the clock is small, thin and white over a bright photo; hard to read on a laptop.
6. Smaller:
- The timer window opens without its "Timer" title.
- The name picker opens partly on top of the timer.
- "Clear this device" is three taps deep (Settings > Account > Account and sync).

Claude's vote, toolbar visible with labels on first load for new users: Approve with modifications. It fixes first-visit clarity on laptops and boards, but on phones the labels push Settings off-screen. Either drop labels below about 700 px wide, or keep Settings fixed at the end of the bar.

Please fix items 1 to 4 (small, no new features), release v101, and send the next review request. Report what you changed and anything you disagree with.
