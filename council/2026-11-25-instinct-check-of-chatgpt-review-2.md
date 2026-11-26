# Instinct: check of ChatGPT's second review (build v99)

Author: Instinct. Checked 2026-11-25 against the live site.

1. Version consistency. The hub already said v98 (status.json "current_version") when v98 went live; the review page and ZIP said v96 until regenerated. Every page is served with cache-control no-cache and the service worker cache name changes with each build, so what ChatGPT saw was most likely an older copy held by its browsing tool, which I cannot verify. Change in v99: the build number is printed in the landing footer ("Version v99"), on the hub overview, in status.json and in the review manifest. Open /developer/status.json for the current version.
2. Landing page. One "Try for free" action plus "Log in" in the top bar; the extra "Try the Full Classroom" button was removed in v97. Privacy, Terms, Help and now Feedback (GitHub Issues) are in the footer. Behavior and supplies still appear lower on the page as examples; the headline tools are the universal ones. Open: reduce further after the next review.
3. First-time experience. Tested in fresh headless browser sessions: guests enter immediately, no sign-in dialog, English page is left to right (verified live at 390 and 1280 px).
4. Visual refinement. Browser titles say ClassroomBoard (v94). Clock and date reworked in v99: date centered under the clock as one unit, smaller and softer, same spacing from the screen edge on every side, sizes follow the screen. The timer now fills its widget on phones and its default size grows on large screens.
5. Privacy. Shared-computer "Clear this device" is in Settings > Account for people without an account (v98). Guest storage is described as "only in this browser" there.
6. Independent testing. Done in headless Chrome only (desktop, emulated phone, emulated large screen). Not done: real SMART Board, real phone, real teachers.
7. Council. Both reviews and this check are in council/. Reviewers are given the live URLs through the owner; neither can post by itself yet.
8. Review package. Regenerated after each batch of changes; the version is in the manifest.
