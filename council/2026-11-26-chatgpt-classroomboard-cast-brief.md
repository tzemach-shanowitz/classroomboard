# ChatGPT "ClassroomBoard Cast" wireless screen sharing brief (relayed 26 Nov 2026, 1:09 AM)

Source: pasted by the founder on WhatsApp (wamid ...MEI1MjFCMzMwOTk2NTNBRDMA), signed "ChatGPT, Lead Designer". Relayed, authorship not independently verified. Advisory only; the owner decides. Not built.

---

ClassroomBoard — Wireless Screen Sharing

From ChatGPT, Lead Designer, ClassroomBoard Council.

I propose developing a native ClassroomBoard screen-sharing feature that allows teachers to wirelessly display their computer screen directly inside their classroom.

Core objective

Make it possible to share a laptop screen, application window, or browser tab to ClassroomBoard without HDMI, cables, additional software on supported browsers, or requiring both devices to be connected to the same Wi-Fi network.

The experience should be as simple as possible.

1. ClassroomBoard Cast

Create a new customizable toolbar tool called Screen Share or ClassroomBoard Cast.

When opened, display a beautiful, minimal pairing interface containing:

* A temporary six-digit connection code.
* A QR code.
* A simple connection address.
* Connection status.
* Clear, minimal instructions.

2. Sender interface

Create a dedicated, lightweight sender page that teachers can bookmark on their computers.

Suggested address:

classroomboard.web.app/cast

The teacher should be able to enter the classroom connection code and select a screen, application window, or browser tab using the browser’s native screen-sharing permissions.

Provide optional audio sharing when supported.

Do not require account creation for temporary sessions.

3. Remembered classrooms

Allow teachers to securely remember a trusted classroom connection on their personal devices.

On subsequent visits, provide a simple “Share to my classroom” button.

Do not attempt to bypass browser screen-capture permission requirements.

Provide a way to remove previously trusted devices.

4. Technical architecture

Investigate using:

* WebRTC for real-time video transmission.
* Screen Capture API for screen selection.
* Firebase for signaling and temporary pairing.
* STUN for connection establishment.
* TURN relay infrastructure for networks where direct peer connections fail.

The feature must work across separate internet connections wherever technically supported.

Do not rely exclusively on local network discovery.

Investigate school firewalls, restricted networks, browser limitations, bandwidth requirements and infrastructure costs.

5. Classroom viewing experience

Display the shared screen inside a beautifully designed ClassroomBoard widget.

Provide:

* Full-screen mode.
* Resizing.
* Moving.
* Fit-to-window.
* Original aspect ratio.
* Minimize.
* Disconnect.
* Audio controls.
* Whiteboard annotation overlay.

Teachers should be able to use a timer or other ClassroomBoard tools while sharing their screen.

Allow the teacher to temporarily hide the shared screen without necessarily ending the connection.

6. Sender controls

Provide a small, simple control interface showing:

* Connected classroom.
* Current sharing status.
* Stop sharing.
* Change shared source where supported.
* Audio controls.
* Pause presentation.

When paused, show a neutral screen or freeze the presentation according to the teacher’s preference.

7. Performance

Prioritize readable text and responsive interaction.

Investigate adaptive streaming quality, 720p and 1080p options, efficient frame rates, and automatic recovery from interrupted connections.

Test real presentations, websites, documents and video.

Avoid introducing unnecessary complexity to the user interface.

8. Security and privacy

Use secure, temporary, expiring pairing codes with rate limiting and explicit connection approval.

Prevent unauthorized devices from connecting or interrupting an existing session.

Encrypt communications using appropriate WebRTC and HTTPS security mechanisms.

Never record screen contents by default.

Do not store video feeds in Firebase.

Make sharing status unmistakable.

Provide immediate disconnection from both devices.

Do not allow remote computer control in the initial version.

9. SMART Board compatibility

This is particularly important.

The founder frequently uses ClassroomBoard directly inside the SMART Board’s built-in browser without a laptop connected by HDMI.

Test whether the embedded browser can receive and decode WebRTC streams.

The receiving device should not need screen-capture support itself.

Investigate alternatives if WebRTC reception is unsupported.

Do not claim universal SMART Board compatibility until physically tested.

10. Mobile compatibility

Investigate receiving shared screens on phones and tablets.

Determine which mobile platforms support browser-based screen transmission.

Clearly explain limitations, particularly regarding full-screen sharing from iPhones and Android devices.

Do not promise functionality that requires a native application unless that application is actually developed.

11. Design

Follow our approved permanent ClassroomBoard brand identity.

The experience should feel like a native feature, not a separate video conferencing application.

No unnecessary controls, complicated networking terminology, or technical configuration for ordinary users.

Connect. Share. Teach.

12. Testing and approval

First create an isolated working prototype.

Test it across two genuinely different internet connections.

Test Chrome, Edge, different operating systems, restricted networks, and the standalone SMART Board browser.

Measure connection reliability, latency, image quality and infrastructure costs.

Provide actual test results and clearly identify untested hardware.

Consult Claude regarding architecture, privacy, security, scalability and browser compatibility.

Send the visual interface to ChatGPT for design review.

Present a working demonstration and cost estimate to the founder before integrating the feature into production.

The ultimate objective is to make wireless screen sharing so simple that teachers no longer need to think about cables, adapters, or complicated connection procedures.
