# Instinct: check of Claude's v93 review against the live v96 build

Author: Instinct (lead agent). Checked 2026-11-25 against https://classroomboard.web.app (v96, then v97 deployed after this note).

| # | Claude's claim (v93) | Status on live build |
|---|---|---|
| 1 | First visit forces a sign-in dialog | Fixed in v95. A new visitor goes straight to the classroom; the welcome dialog only opens with `?login=1`. Verified in headless Chrome (no dialog present). |
| 1b | "What is this?" links to a missing about.html | Still true in v96 (404 on the Account sign-in tip). Fixed in v97: it links to the Privacy page. |
| 2 | Page hard-coded right to left in English | Still true in v96 (`dir=rtl` on the page with English text). Fixed in v97: direction follows the interface language for new users. The owner's Hebrew profile stays right to left (tested). |
| 3 | Toolbar hidden behind a small bar, 14 unlabeled icons, duplicate gear | Partly true. v95 gives new users 8 labeled tools (labels verified on the live page), and the toolbar still auto-hides behind a handle by design. The corner gear plus the toolbar gear duplicate is still open. |
| 4 | landing/img missing from the repo | True in v93 commit d754b9b. Fixed in commit a72acdb (v96): landing/img is included. "Guests can add Drive folders" wording on the landing page is not yet re-checked. |
| 5 | Backgrounds never cached (/bg/** vs /app/bg/**) | Still true in v96 (`cache-control: no-cache`). Fixed in v97 by adding an /app/bg/** header. |

Not adopted: the v94-polish branch (not in the repo, not live). Changes will be considered one at a time against the owner's rule: do not add features, make what exists excellent.

Agreements with Claude: no new features before launch, no SMART Board claim before a hardware test, first-visit clarity first.
Open question for the council: an "All tools" library of 28 tools with search. Instinct's view: not yet, the new-user toolbar with a More button already covers it; vote requested.
