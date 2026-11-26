# ChatGPT "Classroom Studio" personalization redesign (relayed 25 Nov 2026, 11:02 PM)

Source: pasted by the founder on WhatsApp (wamid ...QUNERDhEMEI5MDExMkQwQUFCMwA=), signed "ChatGPT, Lead Designer". Relayed, authorship not independently verified. Advisory only; the owner decides. Not built yet.

---

ClassroomBoard — Lead Designer’s Personalization Redesign

From ChatGPT, Lead Designer, ClassroomBoard Council.

The founder has appointed me to lead the visual design and user experience.

The current personalization functionality is a good foundation. However, we need to substantially elevate its presentation, visual quality, discoverability, and ease of use.

Our target is a premium, professionally designed product, not a settings panel with additional functionality.

1. Creative concept: Classroom Studio

Treat customization as a dedicated visual design experience.

The teacher is designing their classroom, not configuring software.

Create a feeling of creativity, ownership, freedom, and immediate satisfaction.

Use the approved ClassroomBoard brand identity, “Teach from one screen.”

2. Overall editor layout

On desktop:

* A slim, elegant header containing Undo, Restore defaults and Done.
* A customization panel approximately 300–340 pixels wide.
* A large live classroom preview occupying the remaining space.
* Clear navigation between customization categories.
* No unnecessary nested windows or overlapping popups.

The actual classroom must remain the visual centerpiece.

Do not make the customization panel dominate the screen.

3. Design system

Apply the approved permanent brand guidelines.

Suggested component specifications:

* Standard spacing increments: 4, 8, 12, 16, 24 and 32 pixels.
* Main panel spacing: 24 pixels.
* Standard control height: 44–48 pixels.
* Minimum mobile touch target: 44 pixels, preferably larger.
* Panel corner radius: 12–16 pixels.
* Button corner radius: 8–10 pixels.
* Consistent icons: approximately 20–24 pixels.
* Main editor heading: 24–28 pixels.
* Section headings: 16–18 pixels.
* Body text: 14–16 pixels.
* Secondary descriptions: 12–14 pixels.

Use restrained shadows, subtle borders, generous whitespace and one primary accent color.

Avoid excessive decorative containers, gradients, inconsistent colors, and oversized headings.

4. First-time experience

A new teacher should immediately see a beautiful classroom and a prominent invitation:

“Make this classroom yours.”

Supporting text:

“Choose your favorite tools, find your perfect background, and create a board that works for you.”

Primary action:

“Customize my board”

Secondary action:

“Start teaching”

Do not require registration or force a long onboarding process.

Once the teacher enters customization, immediately show the actual board changing.

5. Toolbar customization

This should be one of the most visually impressive parts of the editor.

Show every available classroom tool in a beautiful, organized visual gallery.

Each tool should have:

* A professionally designed icon.
* A clear, familiar name.
* A visible selected or unselected state.
* A short explanation when needed.

Do not put everything inside dropdown menus.

Organize the full tool collection into understandable categories when necessary.

The teacher should be able to select tools directly and see them appear immediately in the live toolbar.

Support dragging, tapping to add or remove, and accessible move-left and move-right controls.

Allow teachers to choose toolbar position, size, labels, spacing, and visibility.

Keep frequently used options prominent and advanced appearance options unobtrusive.

6. Background gallery

Do not treat backgrounds as an ordinary settings option.

Make the background gallery exceptionally beautiful.

Use large photographic thumbnails with consistent cropping and immediate full-board previews.

Include categories such as:

Nature, Mountains, Ocean, Forest, Minimal, Solid colors, Favorites, and My uploads.

Support daily rotation, fixed backgrounds, brightness, dimming and blur.

Show photography before showing technical controls.

When a teacher chooses a background, the board should transition smoothly without covering the screen with loading indicators.

7. Direct clock and date customization

The teacher should be able to tap the clock directly in editing mode.

Show a subtle selection outline around it.

Open the relevant controls without making the teacher navigate through unrelated settings.

Provide:

* Clock style previews.
* Font size.
* Position.
* Text color.
* 12-hour and 24-hour formats.
* Gregorian and Hebrew date options.
* Date visibility.
* Clock visibility.

Keep the clock and date visually aligned and proportionate on every screen size.

8. Home screen customization

Give teachers complete control over what appears when they open their classroom.

They should be able to choose whether to display:

* Classroom name.
* Clock and date.
* Daily schedule.
* Welcome message.
* Favorite tools.
* Selected widgets.
* Background.

Allow teachers to create a completely minimal screen or a more informative classroom dashboard.

Do not impose one preferred arrangement on everyone.

9. Direct widget editing

In customization mode, teachers should be able to select any visible widget directly.

Show a subtle selection outline and relevant resizing handles.

The customization panel should automatically display that widget’s available options.

Provide consistent controls for appearance, position, size, transparency, behavior, and applicable widget-specific settings.

Avoid opening another unrelated dialog over the editor.

All changes must appear immediately.

10. Intelligent navigation

The teacher should be able to customize in two ways:

A. Select a category in the editor.

B. Select the actual element on the board.

Both should open the same underlying controls.

Touching the clock should open clock settings.

Touching the toolbar should open toolbar settings.

Touching the background should open background settings.

Touching a widget should open that widget’s settings.

There should be no duplicate settings architecture.

11. Editing feedback

Use subtle visual feedback to make customization satisfying.

Examples:

* A gentle selection animation.
* Smooth insertion of tools into the toolbar.
* Background crossfades.
* Live resizing.
* A brief saved indicator.
* Clear selected states.

Animations should generally last 120–220 milliseconds, with longer background transitions when appropriate.

Never make the teacher wait for decorative animations.

Support reduced-motion preferences.

12. Mobile experience

Do not simply shrink the desktop editor.

Create a dedicated mobile editing experience.

The classroom preview should remain visible at the top.

Customization controls should appear beneath it or in a swipeable bottom sheet.

Use large, finger-friendly controls.

Provide simple tap-based alternatives to dragging.

Teachers discovering ClassroomBoard on social media must be able to create their own classroom immediately from their phones.

13. Permanent accessibility

Every teacher must be able to return to personalization easily, including existing users.

Make the entry point obvious without permanently cluttering the teaching workspace.

Customization should be available to every user, not only new users.

Provide an intuitive way to enter editing mode directly from the classroom.

14. Settings integration

Do not eliminate the existing settings system.

Use the visual editor for appearance, layout, tools, and classroom personalization.

Use general settings for account management, privacy, data, language, device compatibility, and other administrative preferences.

All shared options must use the same underlying settings and saving system.

15. Reliability and ownership

Preserve existing teacher configurations.

Save changes reliably without requiring registration.

Keep Undo, Restore defaults, and Done easy to understand.

Make it clear whether changes are saved locally or synced to an account.

Never unexpectedly erase a teacher’s classroom.

16. Accessibility and language

Support English, Hebrew and Yiddish.

Test RTL layouts properly.

Ensure readable typography, appropriate contrast, visible keyboard focus, descriptive controls, and touch accessibility.

Do not rely solely on color to indicate a selected option.

Test long translated labels without clipping.

17. Design review before implementation

Before committing to major visual changes, provide actual desktop and mobile mockups of:

* First-time classroom.
* Customization entry point.
* Tool gallery.
* Background gallery.
* Direct clock editing.
* Widget editing.
* Completed personalized classroom.

Send these to ChatGPT for visual criticism and Claude for technical and accessibility criticism.

Do not treat the first implementation as the final design.

18. Final design acceptance criteria

A teacher who has never seen ClassroomBoard should immediately understand:

* How to personalize their board.
* How to choose their favorite tools.
* How to change its appearance.
* How to edit an individual element.
* How to finish and start teaching.
* How to return and make changes later.

They should not need instructions.

The experience should feel beautiful, effortless, and enjoyable.

The editing mode should offer extensive control.

The teaching mode should remain exceptionally simple.

Maximum personalization. Minimum complexity.

— ChatGPT, Lead Designer, ClassroomBoard Council
