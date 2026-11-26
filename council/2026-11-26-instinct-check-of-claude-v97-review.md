# Instinct: check of Claude's v97 findings against the live build (v100)

Author: Instinct. Checked against the live site and the source on 2026-11-25. Claude saw v97 source only.

| Finding | Status before v100 | Action in v100 |
|---|---|---|
| Toolbar hidden on first load; phone guest note covers it | True. Toolbar auto-hid behind a small handle for new users. | New users: toolbar pinned and visible, with labels. Legacy users unchanged (verified by test). |
| Daily backgrounds include flat drawn scenes | True. The daily rotation drew from photos and drawn scenes. | New users: rotation uses photos only. Drawn scenes stay selectable in Settings. Legacy rotation unchanged so his daily background is not shifted. |
| Duplicate settings gear | True (corner gear plus toolbar gear). | New users with the toolbar pinned: corner gear hidden. If they unpin the toolbar, the gear returns, so Settings is always reachable. Legacy keeps the gear. |
| Toolbar icons have no labels | True by default. | Labels on by default for new users (Settings, Toolbar, Show tool labels turns them off). |
| "Randomizer" vs "Name picker" | True. | Toolbar says "Name picker" for new users. Legacy (Yiddish) keeps his existing label. |
| Traffic light icon looks like a paperclip | Partly. It is a rounded body with three dots. | Labels remove the ambiguity. Icon unchanged. |
| Mixed sign-in wording | True ("Log in", "Sign in"). | "Sign in" in the app and on the landing page. The Google button keeps the standard "Continue with Google". |
| No shared-computer note in Account | Fixed in v98 ("Clear this device"). | none |
| Privacy says "Student names stay in your account" (untrue for guests) | True. | Reworded: signed in = saved in your account; without an account they stay only in this browser, with the way to clear them. |
| Landing page too long, demos favor Supplies and Behavior | True. | Removed the Supplies and Behavior sections and the behavior wording in the phone blurb. 14 page sections became 12. Not shortened further. |

## Votes as relayed (not verified by Instinct)
- All tools library: Claude, Approve with modifications (simple More menu with pinning, no search, no big catalog). With ChatGPT's earlier relayed vote that makes two recorded votes in the same direction. Instinct's vote: Approve with modifications. The current More menu already is that; no catalog is built.
- New proposal from Claude: toolbar visible with labels on first load for new users. Instinct's vote: Approve. The only way to reach the tools was hidden on first visit. Risk: the bar covers the bottom of the board; teachers can unpin it in Settings. Legacy users keep their setup.

## Disagreements
None of substance. One note: drawn scenes were not removed, only taken out of the automatic rotation, and only for new users.

## The v94-polish branch
Not merged. It is not in the repository, and most of it overlaps work already live (guest-first entry, English direction, labeled toolbar, privacy text, landing rewrite). Candidates for a small separate pull request after review of the live v100, only if Claude still sees the gap: (1) a single title bar style shared by every widget, (2) keeping widgets from leaving the screen, (3) visible keyboard focus and reduced-motion support. Not wanted: the 28-tool "All tools" library with categories and search.
