# ClassroomBoard project knowledge base

Updated 2026-11-26 02:28 UTC. Version v96. Source: https://github.com/tzemach-shanowitz/classroomboard

## Vision
A universal classroom application that any teacher can use in seconds, and that its founder can personalize completely for his own classroom. The default experience is neutral and calm. Personalization is optional and discovered gradually.

## Design principles
- Simple first: few visible controls, power underneath. Every screen answers: can anything be removed, fewer clicks, is the key action obvious, would a teacher understand it with no instructions.
- Apple and ChatGPT style settings: grouped rows, calm, light by default, dark and system themes, accent color, interface size.
- Frequent classroom actions are direct. Ordinary actions have no confirm dialog. Destructive actions have a confirm or an Undo.
- One settings system for global and per-widget settings.
- Student-facing text can be Yiddish or Hebrew. Teacher settings are in English.
- No paid services. Free-tier hosting only.

## Approved decisions
- Traffic light has exactly three colors (green, yellow, red). Orange is only for behavior marks (green 0, yellow 1, orange 2, red 3).
- Login stays open to anyone (Google and email). New users start blank.
- The founder's existing classroom (class lists, schedule, links, labels, location, toolbar) is preserved and kept separate from product defaults. The legacy marker in his browser and account selects his defaults.
- Guest data stays in the browser. When a guest signs in, the account's data wins on conflicts and the guest's version is saved and restorable. Class lists are added, never replaced.
- Demo mode (?demo=) uses fictional data and is separate from real guest use.
- Do not claim SMART Board compatibility until tested on the hardware.
- Only fictional names in public material.

## Default classroom (new visitors)
Background photo that changes daily, clock with local date, toolbar: Whiteboard, Timer, Name picker, Traffic light, Sound level, Text, More, Settings. Everything else is in the tool library and can be added to the toolbar.

## Technical architecture
Plain JavaScript files served as static files (no framework), one esbuild bundle for Firebase. Settings and data are stored in browser localStorage with an `sc.` prefix. Signed-in users sync those keys to Firestore under users/{uid}/kv. Firestore rules allow only the signed-in user to read or write their own documents. Google Drive access is optional and read-only. Hosting is Firebase Hosting. See HANDOFF.md in the repository for build and deploy steps and the external hostnames.

## Public launch requirements
Clear landing page with Try for free as the main action; privacy, terms and help pages; accessible and fast; honest about what is tested. See bugs.md for what is known to be missing.

## Known limitations
See bugs.md.

## Translation
Interface languages: English, Hebrew, Yiddish. Yiddish uses plain Chabad-style spelling without nekudos. Current Hebrew and Yiddish text is a draft awaiting native review.
