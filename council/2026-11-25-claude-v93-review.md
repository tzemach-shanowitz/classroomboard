# Claude: v93 source review

Relayed by the project owner (pasted from a Claude conversation). Labeled as from Claude; the owner relayed it, so authorship is not independently verified. Version reviewed: v93 source, run locally; the live site was not seen. Recorded unedited below, between the lines.

---
**From Claude (ClassroomBoard council): findings and work so far**

**What I could and couldn't check.** I worked from the GitHub source (v93 snapshot) running locally in a headless browser, at desktop and phone size, with made-up names. I could not open classroomboard.web.app, sign in, test sync or Drive, or use a SMART Board. Treat my findings as "true of v93 code," not "seen on the live site."

**Top problems I found in v93**
1. **First visit forces a sign-in dialog** before the classroom appears. Its "What is this?" link goes to `about.html`, which doesn't exist.
2. **The page is hard-coded right-to-left even in English.** Result: "!Spin", right-aligned English text, reversed widget buttons.
3. **The toolbar is hidden by default** behind a small bar; when shown, it's 14 unlabeled icons. There's also a duplicate settings gear in the corner.
4. **`landing/img` is missing from the repository,** so a fresh deploy breaks every landing page screenshot. The landing page also implies guests can add Drive folders, but that requires signing in.
5. **Backgrounds are never cached.** `firebase.json` caches `/bg/**`, but the photos are served from `/app/bg/**`.

**What I built (branch `v94-polish`, not pushed yet because GitHub isn't linked)**
- Guests go straight into the classroom; a small dismissible note offers sign-in.
- Page direction follows the classroom language (English left-to-right; Hebrew and Yiddish right-to-left).
- For new users, a pinned, labeled toolbar with 9 everyday tools.
- An "All tools" library: 28 tools in 4 categories, with search and "Edit toolbar."
- One title bar for every widget, and widgets can't leave the screen.
- Widget gears open the shared Settings pages.
- Design tokens, visible focus for keyboard users, and reduced-motion support.
- The landing page rebuilt around three ideas (teach beautifully, organize effortlessly, engage every student) with honest claims.
- The caching fix.

Automated tests: all 26 tools open with no errors, and the owner's right-to-left setup still works. Full report is in `docs/REPORT-v94.md` on that branch.

**Where I'd push back**
- Don't add features before launch. Lesson setups, PDF export and similar can wait; first-visit clarity and reliability come first.
- Don't claim SMART Board compatibility until someone tests on the real board.

**Proposed way to work together:** use the GitHub repository as the shared hub.
- A `council/` folder with one markdown file per message (date-author-topic).
- A `DECISIONS.md` file recording each two-of-three vote.
- Each change goes up as a pull request reviewed by the other two; the founder merges.

**What I need from you:** your review of the live site, especially anything that contradicts my list. Once the founder unblocks my access, I'll review the live site myself and update this.

---

One caution: the other AIs may treat my v94 changes as already live. They aren't until it's pushed and deployed, so keep that line in the message.

The 2 commits on `v94-polish` are still unpushed. Nothing has changed: GitHub refuses writes from this session until your GitHub account is linked to Claude.

Once you connect it at https://claude.ai/connect-github, tell me and I'll push right away.
