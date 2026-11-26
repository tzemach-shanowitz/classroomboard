# Claude: v97 review and request (relayed)

Relayed by the project owner as a message addressed to Instinct; the full review text itself was not included, only the findings listed below and a fix request. Labeled as from Claude; authorship is not independently verified. Claude states it reviewed v97 by running the GitHub source locally and could not open the live site or see v98 or later. The text below is the owner's relayed message, unedited, between the lines.

---
Here's a prompt for Instinct (the lead agent). It passes on my review and asks for the fixes:

---

**To Instinct (lead agent), from the founder: act on Claude's v97 review**

Claude reviewed v97, running the GitHub source locally (it could not open the live site or see v98). Please do the following:

1. Save Claude's review as `council/2026-11-26-claude-v97-review.md`. Mark it as a review of v97 source run locally, not the live v98.

2. Check each point against v98, and say which are already fixed:
   - The toolbar is hidden on first load. A new teacher sees no tools, only a small bar at the bottom, and on phones the guest note covers it.
   - Daily backgrounds include flat drawn scenes; the first visit can open on one.
   - There's a duplicate settings gear (corner and toolbar).
   - Toolbar icons have no labels. "Randomizer" in the toolbar vs "Name picker" in Settings. The traffic light icon looks like a paperclip.
   - Sign-in wording is mixed: "Log in to save", "Log in", "Sign in", "Continue with Google".
   - Settings › Account has no shared-computer note.
   - Settings › Privacy says "Student names stay in your account," which isn't true for guests (their names stay in the browser).
   - The landing page is long (10 feature sections). The demo buttons feature Supplies and Behavior over universal tools.

3. Record Claude's votes in `DECISIONS.md`:
   - "All tools" library: **Approve with modifications.** A simple More menu with pinning, with no search or big catalog. With ChatGPT's vote, that's two of three.
   - New proposal from Claude: **show the toolbar on first load, with labels, for new users.**

4. Make the smallest fixes for anything still open in v98, in this order:
   1. The toolbar is visible with labels for new users.
   2. Photos only in the daily background rotation.
   3. One settings gear.
   4. One word, "Sign in", everywhere.
   5. "Name picker" everywhere.
   6. The privacy text for guests, plus a two-line shared-computer note in Account: where data is stored and how to clear it.
   7. Shorten the landing page.

   Don't add features.

5. Release it as v99, then ask ChatGPT and Claude to re-review. Claude needs either `classroomboard.web.app` allowed in its environment or the new version pushed to GitHub.

Report back: what was already fixed in v98, what you changed, and anything you disagree with and why.

---

Attach my full review with it. If you'd rather unblock me so I can review the live site myself, allow `classroomboard.web.app` in this environment's network settings and send me the same request again.

---
Follow-up relayed by the owner at 9:56 PM: the message says Claude can now open classroomboard.web.app and confirmed the live build is v99. Instinct has not verified this. It repeats the fix request and asks for a list of v97 to v99 changes (now in the hub release history and the review request page), a vote on the toolbar proposal, a next-review request page with version, areas and deadline (hub: review-request.html), and a decision on the unpushed v94-polish branch (see the Instinct check note).
