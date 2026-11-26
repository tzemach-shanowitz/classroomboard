# Instinct check of the two v100 reviews (checked against live v100, fixed in v101)

- Phone toolbar cut off, Settings unreachable: TRUE. Fixed: under 600px the 8 tools fit without labels and the corner gear stays visible.
- "Log in to save": TRUE in the guest pill (drive-ui.js). Now "Sign in to save".
- Landing script error: TRUE (code for the removed Behavior demo). Removed.
- Supplies and Behavior still offered on the landing: TRUE in meta description, hero chip, demo chips. Removed. Try button spelling unified.
- "Open Classroom" next to "Try for free" (ChatGPT): REAL cause found. A hidden signed-in link sat in the raw HTML, so crawlers saw both. Now added by script only when signed in.
- "Log In vs Sign In" (ChatGPT): live raw HTML had no "Log in". Stale or older copy, except the guest pill above.
- Could not confirm v100 (ChatGPT): no server cache problem found (no-cache headers). Added a plain build meta tag and footer text.
- Date legibility: TRUE, modest bump (size, weight, opacity, shadow). Kept subtle.
- Timer title missing: not reproduced, title "Timer" shows. Name picker over timer: TRUE, default positions staggered.
- Customizable toolbar: already exists in Settings > Toolbar.
- Not verified: real phone, SMART Board, teachers.
