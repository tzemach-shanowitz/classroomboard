# Instinct feasibility note: ClassroomBoard Cast (nothing here is tested)

Written 26 Nov 2026. Sources are listed; anything marked "recall" is not verified.

## Shape of it
Teacher's laptop opens a sender page, picks a screen or tab (browser asks permission each time), and sends video over WebRTC to the ClassroomBoard widget on the board. A tiny signaling step (pairing code, offer/answer) goes through Firebase. The video itself never touches Firebase.

## Free tier (Firebase Spark)
- Signaling is tiny text. Realtime Database on the no-cost Spark plan: 1 GB stored, 10 GB/month downloads, no billing (https://firebase.google.com/docs/database/usage/billing). Pairing sessions would use a few KB each, so cost is not the concern.
- Spark has a hard cap on simultaneous connections; I could not confirm the number from the page I fetched. Recall: it is low (around 100), which is fine for one teacher or a small pilot, not a school-wide launch. Needs a check.
- Code and sender page live on Hosting, already free.
- Does the project use the Spark plan or Blaze? Not checked. Anything needing Cloud Functions (for example short-lived TURN credentials, rate-limiting codes server-side) requires the Blaze plan, which needs a payment method. That is a billing decision for the founder, not mine.

## TURN relay (the part that can cost money)
- Direct peer-to-peer works on many home and some school networks using free STUN. On strict school firewalls it fails and a TURN relay carries the video.
- Cloudflare Realtime TURN: $0.05 per GB, first 1,000 GB per month free, shared with their SFU (https://developers.cloudflare.com/realtime/sfu/platform/pricing/). Needs a Cloudflare account; I have not checked whether it needs a card on file.
- Metered Open Relay: a free plan with about 20 GB per month (https://www.metered.ca/tools/openrelay/, plan details from a Metered blog page).
- Rough bandwidth, my estimate, not measured: a readable 1080p screen at a modest frame rate is roughly 1 to 3 Mbit/s, so about 0.5 to 1.5 GB per hour per relayed session. A teacher sharing 3 hours a day on relay would use well under 1,000 GB a month. Direct connections use none.
- Never put a TURN secret in the public repo or in client code; short-lived credentials need a small server function (see Blaze note).

## SMART Board browser (the real unknown)
- The board only needs to receive and play video, not capture the screen. Receiving WebRTC needs RTCPeerConnection and H.264 or VP8 decode. Whether the board's built-in browser supports that is unknown until tested on the hardware. It is the first test to do, before any building: a one-page test that opens a WebRTC loopback and reports pass or fail.
- If it fails, alternatives would be a different method (for example streaming through a media server), or using Chrome on the board if it is installable. Not investigated.
- No SMART Board claim until tested.

## Phones and tablets
- Sending: getDisplayMedia is documented for desktop Chrome, Edge, Firefox and Safari on Mac (https://caniuse.com/mdn-api_mediadevices_getdisplaymedia, https://openpwa.net/reference/capabilities/screen-capture/). Mobile browsers: I did not confirm. Recall: iPhone Safari and Chrome on Android do not offer full-screen sharing to a web page. Treat phone as unsupported for sending until verified. Do not promise it without a native app, which does not exist.
- Receiving on a phone or tablet as a viewer is likely fine, not tested.

## Other limits to state plainly
- Browser asks for permission every time, so "remembered classrooms" can remember the pairing, not the screen grant.
- Audio sharing: browser support varies (tab audio on Chrome and Edge, system audio on some desktop setups). Unverified.
- School firewalls often block unknown UDP; TURN over TCP 443 helps but is not guaranteed.
- Security: pairing code needs expiry, attempt limits and an approval tap on the board. Server-side rate limiting needs a function (Blaze) or database rules only (weaker).

## Suggested order if the founder says go
1. One-page SMART Board WebRTC receive test (needs him at the board for 2 minutes).
2. Isolated prototype in a separate folder, not in the production app: sender page, receiver page, Firebase pairing, free STUN only. Test on two different networks.
3. Add TURN only if step 2 fails on a real school network, and decide on cost then.
4. Only after a demo, integrate as a toolbar tool for new accounts.
