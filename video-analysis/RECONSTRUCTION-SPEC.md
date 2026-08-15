# Palazzo Sogni website video decode

Analysis only. No website was built, edited, or tested.

## 1. Evidence and scope

- Source: `C:\Users\bisha\Downloads\2026-08-15 12-14-15~2.mp4`
- Container duration: 00:04:02.13
- Video: H.264 High, 1280 x 720, progressive, 60 fps, 16:9
- Audio: AAC-LC, 48 kHz stereo, approximately 191 kb/s
- Exact decoded video-frame count: 14,527
- Saved every-frame sequence: 14,527 JPEG files, all 1280 x 720
- Verification: no missing numbers, no duplicates, no corrupt images
- Evidence layers produced:
  - every decoded frame;
  - 243 one-second samples across 13 timestamped contact sheets;
  - per-frame visual-change data for every adjacent frame pair;
  - dense 0.1-second and 0.25-second transition sheets;
  - 26 lossless PNG keyframes at section and interaction boundaries.

The recording shows a single desktop-width experience. It does not show a mobile viewport, tablet viewport, browser resize, keyboard navigation, or reduced-motion mode. Responsive findings are therefore split into observed facts and recommendations/inferences.

Confidence labels used below:

- **Observed**: directly visible in decoded frames.
- **Strong inference**: the frames strongly imply the behavior, but the DOM/CSS/JavaScript was not inspected.
- **Not shown**: cannot be established from the recording.

## 2. Recording timeline

| Time | Visible experience |
|---|---|
| 00:00.00-00:02.78 | Branded loading screen with a pale-blue atmospheric background, subtle moving specks, monogram, wordmark, chromatic fill, and zoom-through exit. |
| 00:02.78-00:15.22 | Full-viewport cinematic hotel montage under a fixed white header. Nine visible shot changes. |
| 00:05.20-00:06.95 | Opening-date announcement card over the hero: “OPENING ON OCTOBER 1, 2026.” |
| 00:15.22-00:18.30 | Hero exits into the cream story area; uppercase positioning statement and scripted “Welcome” reveal. |
| 00:18.30-00:24.70 | Welcome/story and location content with arched media, editorial text, and facade photography. |
| 00:24.70-00:36.00 | “Rooms and Suites” scripted reveal, blurred-to-sharp arched photo, long landscape room photo, and hospitality statement. |
| 00:36.00-00:49.40 | Three-up room carousel; hover overlays, descriptions, title pills, arrows, pagination, and horizontal slide. |
| 00:49.40-01:00.60 | Charming Room overlay opens; six-image gallery is exercised; overlay closes. |
| 01:01.50-01:04.90 | Charming Room overlay is reopened and closed again. |
| 01:05.70-01:18.60 | Deluxe Double overlay opens; approximately twelve gallery positions are exercised; overlay closes. |
| 01:19.50-01:24.50 | Full-width rooftop/Duomo image leads into Dining. |
| 01:24.30-01:35.50 | Scripted Dining reveal, Segreto identity, restaurant/patio/music-room editorial blocks. |
| 01:35.50-01:43.50 | “Sotto le stelle” rooftop feature with wide image, centered description, arched image, and copy. |
| 01:43.50-01:47.90 | Large spa photograph. |
| 01:47.90-01:53.30 | Scripted “The Spa” reveal, arched blurred-to-sharp photo, and Wellness Rituals copy. |
| 01:53.00-01:58.00 | Scripted “Experiential Hotel,” Florence panorama, and Exclusive Services. |
| 01:58.00-02:00.50 | Info Request form panel. |
| 02:00.50-02:04.90 | Property facade and blue newsletter/footer. |
| 02:07.50-02:19.80 | Sticky-header navigation and long-distance smooth-scroll behavior are demonstrated; script and blur reveals replay as sections are crossed. |
| 02:20.90-02:23.90 | Book Now handoff: site cuts to a chocolate-brown particle loader. |
| 02:23.90-04:02.13 | External SynXis booking engine: guest controls, date picker, availability warnings, room/rate listing, and cart area. |

## 3. Information architecture

### Main site

The visible main site is one long editorial page with persistent anchor navigation:

1. Loader
2. Cinematic hero montage
3. The Palace / Welcome
4. Location and property story
5. Rooms and Suites introduction
6. Room carousel
7. Room detail overlays
8. Rooftop visual bridge
9. Dining introduction
10. Segreto restaurant content
11. Sotto le stelle rooftop dining
12. Spa image bridge
13. The Spa / Wellness Rituals
14. Experiential Hotel
15. Exclusive Services
16. Info Request form
17. Property facade, newsletter, social link, privacy, and credits
18. External Book Now handoff

### Persistent desktop header

**Observed** at the full 1280-pixel recording width:

- Header remains pinned to the top while scrolling; it does not visibly shrink or hide.
- Approximate height: 56 px.
- Off-white background with a faint shadow or lower divider.
- Left navigation: THE PALACE, ROOMS & SUITES, DINING, SPA.
- Center: blue PALAZZO SOGNI wordmark with very small FIRENZE below.
- Right: CONTACTS, ITA / ENG, and BOOK NOW.
- ENG is underlined as the active language.
- BOOK NOW uses a muted-blue filled badge with thin double-line detailing and ornamental concave corners.
- Navigation is restrained uppercase text with generous tracking.

## 4. Visual system: what creates the premium feeling

### Palette

Representative pixels sampled from lossless frames:

- Warm blush/stone story background: `#EDE3DA`
- Header/off-white: approximately `#F8F3EC`
- Booking CTA blue: approximately `#738EA4`
- Dining ice-blue: approximately `#F1F5F7`
- Spa sage-grey: approximately `#D4D9D1`
- Experiential ivory: approximately `#F0EFE4`
- Footer powder blue: approximately `#9CB6C5`
- Room modal: approximately `#F9F4F3` to `#FDF6F3`
- Text: near-black warm charcoal, not pure black
- Accents: dusty rose watercolor, muted antique gold, powder blue, and occasional dark teal/navy from the photography

The palette avoids the obvious black-and-gold luxury cliché. It feels premium through low-saturation color, historical references, and material softness.

### Typography

**Observed categories; exact font families are not identifiable from video alone.**

- Editorial high-contrast serif for large body statements, room titles, modal headings, and footer labels.
- Fine monoline handwritten/script display for Welcome, Rooms and Suites, Dining, Sotto le stelle, The Spa, and Experiential Hotel.
- Small uppercase sans or low-contrast roman for navigation and micro-labels.
- Generous letter spacing in navigation, all-caps labels, and calls to action.
- Large serif body copy uses loose leading and narrow measures rather than dense full-width paragraphs.

### Botanical, floral, and tactile layers

- Pale line-art vines, leaves, flowers, berries, butterflies/moths, and botanical studies spread across the ice-blue and sage backgrounds.
- The motifs are extremely low contrast, functioning like printed wallpaper rather than illustration content.
- Cream and blush fields have a faint paper/fabric character instead of looking digitally flat.
- Dusty-rose and gold watercolor swashes sit behind selected handwritten headings.
- Fine floral drawings appear at section corners and behind arched images, especially around Rooms and Suites.
- A postage-stamp treatment with the monogram appears in the Info Request panel.
- Small star/leaf-like arrow icons, thin circles, dots, and hairline rules repeat throughout controls.

### Composition

- Large areas of breathing room are treated as content.
- Image ratios change deliberately: full-bleed cinematic strips, arched portrait cutouts, wide editorial photographs, tall room cards, and compact floating photos.
- Sections alternate centered monumentality with asymmetric two-column editorial layouts.
- Images and text rarely align into a rigid corporate grid; the layout feels like a magazine spread.
- Arched/scalloped masks echo Florentine doors, mirrors, and palace architecture.
- The page moves between warm blush, cool ice blue, sage, ivory, and powder blue to create chapters without heavy borders.
- Photography supplies saturated blue, rose, gold, stone, and fresco color while the interface stays quiet.

## 5. Section-by-section decode

### Loader

- Pale cloudy blue background with soft organic/floral shadows and tiny drifting white specks.
- Centered PS monogram above PALAZZO SOGNI and small FIRENZE.
- 00:00.00-00:01.50: mostly white mark over the gently moving background.
- 00:01.50-00:02.30: the white mark takes on a multicolour photographic/metallic fill in blue, rose, gold, and charcoal.
- 00:02.30-00:02.78: logo scales rapidly toward the viewer, becomes partially cropped, and exits with motion blur into the first hotel shot.

### Hero

- Full-viewport imagery with no large headline competing with the property photography.
- Fixed navigation stays legible in an off-white bar.
- A circular “SCROLL DOWN” indicator sits near bottom centre.
- The hero behaves like a tightly edited video montage rather than a conventional slow crossfade carousel.
- Visible hard-cut times: about 00:02.78, 00:03.57, 00:05.00, 00:06.95, 00:08.15, 00:09.97, 00:11.25, 00:12.48, 00:13.73, and 00:15.22.
- Shots include a blue-and-rose bedroom, alternate suite view, decorated ceiling/fresco, champagne call button, minibar/tea alcove, monogrammed pillow/bed, floral textile, bed, blue onyx bathroom, and architectural fresco detail.
- Individual clips contain subtle camera movement/zoom, giving the montage life without interface animation.

### Opening announcement

- Begins faintly around 00:05.20 and is substantially settled by 00:05.40.
- White portrait card with ornamental corner border, monogram, opening-date copy, and a fine floral emblem.
- Background is darkened but not heavily blurred.
- Small close control at the card’s upper-right.
- Remains visible through 00:06.90 and disappears at the 00:06.95 hero cut. The recording does not prove whether that disappearance is automatic or user-triggered.

### The Palace / Welcome

- Uppercase positioning statement: PALAZZO SOGNI IS A LUXURY BOUTIQUE HOTEL IN THE HISTORIC HEART OF FLORENCE. CREATED TO OFFER A TRULY UNIQUE EXPERIENCE.
- “Welcome” script draws continuously from left to right between approximately 00:16.60 and 00:18.10.
- A dusty-rose/gold watercolor swash develops underneath.
- An arched interior photo sits left of an editorial text block; the photo arrives blurred and resolves as it moves deeper into view.
- Location block uses an oversized serif paragraph on the left and the illuminated facade on the right.
- Visible location copy identifies Via de’ Martelli 4 in Florence and proximity to the Duomo.

### Rooms and Suites introduction

- Script begins drawing at approximately 00:24.60 and is complete around 00:26.50-00:26.60.
- Large dusty-rose swash behind the title.
- Arched room photo below-left; uppercase lead and serif body copy on the right.
- The arch photo is intentionally blurred while low in the viewport. It begins resolving around 00:26.60 and is clear by approximately 00:27.30 as the whole module enters.
- Low-contrast botanical line art grows from the lower corners around the image.
- A large landscape room photograph follows and is paired with the centred line “AN AUTHENTIC HOSPITALITY EXPERIENCE.”

### Room carousel

- Three tall portrait cards are visible at once at 1280 px.
- Narrow gutters preserve an image-led presentation.
- Each card has a small ornate white title pill near its bottom edge.
- Visible room labels include Junior Suite, Heritage Suite, Majestic Suite, Charming Room, and Deluxe Double/Deluxe Room across carousel positions.
- Outer left/right arrow controls use small decorative star/leaf forms.
- Tiny dot pagination and an “OTHER ROOMS” label sit below/right.
- The carousel advances horizontally by one card group; the observed slide takes approximately 0.6-0.8 s and uses a smooth ease-out feel.

### Room-card hover

- Hover darkens only the active card through a translucent charcoal scrim.
- A centred descriptive paragraph fades in over the image and appears to rise by roughly 8-12 px.
- The room-name pill remains visible and clickable.
- Hover-in and hover-out are restrained, roughly 0.25-0.45 s.
- Other cards remain bright, preserving the active target’s contrast.

### Room detail overlay

**Opening motion**

- Click begins around 00:49.40.
- Background starts softening by 00:49.50 and reaches heavy blur/dimming around 00:49.70.
- White modal panel fades in around 00:49.70-00:49.90.
- Text and gallery are readable by 00:50.00; the first full room photo settles by 00:50.20.
- Total click-to-settled state: about 0.8 s.
- The panel appears to fade rather than fly in from a large distance; any scale change is subtle.

**Desktop layout**

- Panel spans approximately x=96 to x=1184 and y=36 to y=684 in the 1280 x 720 recording: about 85% of viewport width and 90% of viewport height.
- Warm off-white/pale-pink surface; square form with very slightly softened corners.
- Circular outlined X at upper-right.
- Monogram, room title, size, and occupancy centred at the top.
- Left half: “FEATURES AND AMENITIES” in three narrow columns.
- Right half: large 3:2 room gallery with a black bottom gradient, ornate arrows, and dot pagination.
- Background page remains visible but strongly blurred and desaturated; page scroll position does not move while the overlay is active, strongly implying body-scroll lock.

**Charming Room visible content**

- CHARMING ROOM
- 28 m² · 2 Adults
- Queen size bed or twin bed
- Onyx bathroom
- Walk-in shower
- Fine Florentine fabrics
- Rivolta Carmignani linens and towels
- Santa Maria Novella bath amenities
- Curated minibar selection
- Coffee machine with tea selection
- Mirror-integrated Smart TV
- High-speed Wi-Fi
- Six visible gallery dots/positions.

**Deluxe Double visible content**

- DELUXE DOUBLE
- 36 m² · 2 Adults
- King-size bed or twin bed
- Onyx bathroom
- Spacious walk-in shower
- Fine Florentine fabrics
- Rivolta Carmignani fabrics and towels
- Santa Maria Novella bath amenities
- Complimentary minibar selection
- Coffee machine with tea selection
- Mirror-integrated Smart TV
- High-speed Wi-Fi
- Relaxation corner
- Original decorated ceilings
- Approximately twelve visible gallery dots/positions.

**Gallery motion**

- Horizontal track: outgoing image slides left while the incoming image enters from the right.
- Adjacent image is visible during the transition, proving a translating track rather than a simple opacity crossfade.
- Typical observed transition: approximately 0.35-0.55 s with an ease-out finish.
- Active dot changes to muted beige/gold; inactive dots remain white.
- Recorded room-media examples include beds, windows, doors, bathrooms, sinks, onyx walls, decorated ceilings, the champagne call button, monogrammed textiles, lounge seating, minibar/tea station, breakfast tray, and bronze tapware.

**Closing motion**

- Stable through about 01:00.00; panel begins fading by 01:00.10.
- Panel is mostly gone by 01:00.40.
- Backdrop blur clears after the panel and is fully restored around 01:00.50-01:00.60.
- Total close motion: approximately 0.5 s.

### Rooftop and Dining

- Full-width dusk rooftop photograph with the Duomo on the right forms a cinematic chapter break.
- Dining script starts around 01:24.30 and is complete around 01:25.40: about 1.1 s under the recorded scroll speed.
- Dining uses an icy-white botanical wallpaper field.
- Arched restaurant photo enters blurred and resolves as the module reaches the active viewport area.
- Lead text: “A DREAMER’S EXPERIENCE.”
- Large gold SEGRETO wordmark follows, then alternating photos and editorial copy.
- Visible sub-content references Segreto Restaurant and Sala della Musica dining room, plus patio/interior imagery.
- “Sotto le stelle” uses gold script overlapping a wide night rooftop image, followed by centred uppercase/body copy and a smaller arched rooftop photo.

### Spa

- A large, nearly full-width spa treatment-room photograph arrives as a visual bridge.
- Media near the bottom boundary is visibly soft; it resolves as it rises into fuller view.
- The Spa script begins around 01:47.90 and is effectively complete around 01:49.20: about 1.3 s at the recorded scroll speed.
- Background is pale sage-grey with repeating botanical leaves, berries, insects, and flowers.
- Arched spa image starts heavily blurred; it sharpens as the section’s focal area becomes visible.
- Right-side lead: WELLNESS RITUALS, followed by a narrow serif paragraph.

### Experiential Hotel and services

- Background shifts back to soft ivory.
- “Experiential Hotel” begins drawing around 01:52.90 and completes around 01:54.90: approximately 2.0 s for the longer phrase.
- Large Florence river/Ponte Vecchio panorama below.
- EXCLUSIVE SERVICES appears beneath the image with four sparse text columns.
- The section relies on whitespace rather than icon-heavy amenity lists.

### Info Request

- Large white editorial panel centred on ivory.
- INFO REQUEST in spaced blue-grey caps at top-left.
- Blue postage-stamp monogram at top-right.
- Left: large Message textarea.
- Right: paired Name/Surname, Check In/Check Out, Guests/Rooms, then full-width Email and Mobile fields.
- Very pale botanical illustration overlaps the central divider.
- Consent checkbox and an ornate SEND pill.
- Recording does not show validation, focus, error, or submission states.

### Footer

- Large framed facade photo bridges the ivory page into a powder-blue footer.
- Visible business information: Palazzo Sogni, Via de’ Martelli 4, 50129 Firenze, Italia, +39 055.9946700, reservations@palazzosogni.com.
- Newsletter title, email field, consent checkbox, and ornate Subscribe button.
- Instagram control under “Follow us.”
- Privacy Policy and Credits links at lower-right.

## 6. Motion system

### A. Handwritten title reveal

- This is a continuous path/clip reveal, not a typewriter and not a simple word fade.
- Stroke appears from the first pen movement and advances left-to-right across the connected script.
- The watercolor swash and nearby media reveal are choreographed with it.
- Recorded elapsed times vary with section length and scroll velocity:
  - Welcome: approximately 1.5 s
  - Rooms and Suites: approximately 1.9-2.0 s
  - Dining: approximately 1.1 s
  - The Spa: approximately 1.3 s
  - Experiential Hotel: approximately 2.0 s
- **Strong inference:** timing is driven or heavily influenced by scroll progress (for example a scrubbed SVG path/clip mask), not a fixed-duration keyframe alone. Evidence: durations vary with scrolling, titles visibly redraw on re-entry, and partially written states correlate with viewport position.
- Apparent easing: mostly linear through the stroke with a slightly softer finish. Because scroll speed affects the result, a fixed cubic-bezier cannot be proved.

### B. Bottom-edge blur-to-sharp reveal

- Elements entering at the bottom edge are intentionally out of focus even though surrounding copy is sharp.
- Blur decreases continuously as the element reaches fuller visibility.
- The treatment is clearest on the Rooms arched image, Dining arched image, Spa arched image, and large chapter photographs.
- Visual blur appears roughly equivalent to `blur(8px-16px)` at maximum, resolving to `blur(0)`.
- Some elements also gain a little opacity/contrast, but blur is the dominant cue.
- Trigger appears to begin as the media’s top edge crosses the lower 10-20% of the viewport and finish around the lower-middle/central viewing zone.
- **Strong inference:** the filter is scrubbed against element/viewport intersection. It does not behave like a one-time fixed reveal.
- This creates the premium feeling the user noticed: content outside the viewer’s attention is soft, then optically “develops” when it becomes the focal object.

### C. Long-distance anchor scrolling

- Header links trigger fast but readable smooth travel rather than an instant jump.
- At about 02:07.50, the page moves from the footer back toward The Palace in roughly 1 s, passing intermediate sections.
- At about 02:09.50, a longer downward navigation passes location, Rooms, room cards, rooftop, and reaches Dining in roughly 2.9 s.
- At about 02:12.50, travel continues through Dining toward Spa, reaching Spa around 02:13.30-02:14.50.
- Scroll-triggered title drawing and blur continue to react during the journey, so navigation and section animation feel part of one system.
- Apparent easing: fast acceleration, strong middle velocity, eased deceleration near the anchor; roughly a `power2`/cubic ease-in-out family.

### D. Image behavior

- Large chapter images have oversized crops and preserve a clear focal point.
- **Strong inference:** some full-width images use shallow parallax or overscan because the internal image focal point drifts more slowly than the section boundary during scroll.
- No aggressive scale pulses or 3D rotations are visible.
- Motion stays on transform, clip/mask, opacity, and blur.

### E. Hover and control feedback

- Room-card scrim/copy hover: roughly 0.25-0.45 s.
- Carousel horizontal advance: roughly 0.6-0.8 s.
- Gallery horizontal advance: roughly 0.35-0.55 s.
- Modal open: roughly 0.8 s including gallery settlement.
- Modal close: roughly 0.5 s, with backdrop blur clearing after the panel.
- Announcement fade-in: visible from about 00:05.20 and settled by 00:05.40.
- Buttons and pills appear to use restrained fill/border feedback; the recording does not give enough close hover evidence to specify every button state.

### F. Booking handoff

- Book Now action occurs around 02:20.90.
- At 02:21.00 the site cuts to a full chocolate-brown field with tiny moving white particles.
- Loader persists until approximately 02:23.90.
- External booking page appears pale pink at approximately 02:23.90; controls and skeleton cards fade in by 02:24.00-02:24.50.

## 7. External booking engine decode

The booking portion is visibly a separate SynXis experience (`be.synxis.com` in the browser URL), not the same highly art-directed front-end.

Visible components:

- Header hero with room photography and Palazzo Sogni identity.
- Summary boxes for Guests, Check In, Check Out, and “Your Cart: 0 Items.”
- “Select a Room” area.
- View By, Sort By Recommended, and Filters controls.
- Guest popover with adult/child selection and child-age controls.
- Two-month calendar picker with many unavailable/disabled dates, selectable dates, arrows, legend, warning copy, and Search action.
- Inline yellow warnings for invalid guest/child-age combinations and unavailable inventory.
- Skeleton/loading cards with circular spinners.
- Room cards with thumbnail, title, occupancy, description, room details, rate names, cancellation terms, credit-card guarantee, breakfast inclusion, prices, and BOOK NOW buttons.
- Visible example at about 03:44 onward: Charming room, opening rate around EUR 380 per night and a flex rate around EUR 475 per night. This is transient recorded inventory, not a stable design requirement.
- Other visible room labels lower in the list include Deluxe Room, Junior Suite, Heritage Suite, and Majestic Suite.
- Browser chrome/taskbar become visible later in the recording; those are recording-environment artifacts, not website UI.

The booking engine is functional and information-dense, but visually much more conventional. The luxury main site acts as the emotional sales layer; SynXis acts as the transactional layer.

## 8. Responsive findings

### Directly observed

- Only a 1280 x 720 recording exists.
- Main site is shown at a desktop layout for its entire visible portion.
- Header keeps all navigation labels, languages, logo, and CTA on one row.
- Story and modal content use multi-column layouts.
- Room carousel is three-up.
- Info Request form is two-column.
- Room overlay uses an almost full-viewport desktop panel.
- No navigation collapse, stacking, touch layout, or mobile modal is shown.

### Cannot be claimed from this video

- Exact CSS breakpoints.
- Mobile menu style.
- Tablet carousel card count.
- Mobile modal order.
- Small-screen type sizes.
- Touch gestures/swiping.
- Landscape-phone behavior.
- Whether the botanical pattern is reduced on narrow screens.

### Build recommendations inferred from the desktop system

These are recommendations for a later implementation, not recorded facts:

- Collapse the desktop nav to logo, menu, and persistent Book/Check Availability action.
- Change three-up room cards to one-up with a controlled next-card peek on phones and two-up on tablets.
- Make room overlays full-screen on mobile; place gallery first, then room facts and features in one column; keep the close button sticky.
- Allow gallery swipe as well as arrow buttons.
- Stack every editorial two-column spread in intentional reading order rather than merely shrinking it.
- Preserve arched masks and botanical texture but reduce pattern density behind text.
- Make the Info Request form single-column and keep controls at least 44 px high.
- Keep script headings within safe width; do not force the entire phrase onto one tiny line.
- Lower blur radius and decorative particle count on low-power devices.
- Provide a reduced-motion mode that shows fully written titles and sharp media immediately.

## 9. Accessibility, performance, and UX observations

### Positive traits visible in the design

- Strong booking CTA in persistent navigation.
- Large photographic targets and simple room names.
- Modal separates decision details from the long page.
- Room facts, occupancy, and amenities are surfaced before booking.
- Content chapters are visually clear without relying on heavy borders.

### Risks to address in a reconstruction

- Some serif copy and micro-labels are very small and low-contrast on pale backgrounds.
- Script headings must still exist as semantic text, even if an SVG path supplies the visual writing effect.
- Modal must trap focus, announce its title, restore focus to the triggering room card, support Escape, and lock background scroll accessibly.
- Carousel and gallery arrows need visible focus, accessible names, keyboard operation, and a non-color-only active indicator.
- Thin ornate buttons need larger invisible hit areas.
- Long smooth scrolling and blur must respect `prefers-reduced-motion`.
- Repeated `filter: blur()` over large images can be expensive; restrict the animated layer, use compressed responsive media, and stop updating when off-screen.
- Hero montage should not delay the first meaningful paint; use a poster and load video progressively.
- Reserve image dimensions to avoid layout shift.
- Use AVIF/WebP where appropriate, responsive `srcset`, lazy loading below the fold, and preloading only for the first critical hero/poster.
- Forms need explicit labels, required-state guidance, inline errors, success state, privacy explanation, and honest submission behavior.
- Third-party booking navigation should be disclosed and preserve the selected language/dates/guests when possible.

## 10. Reconstruction-ready component inventory

- Branded loader with particle field and logo mask/zoom exit
- Fixed desktop header
- Mobile header/menu design to be supplied later because it is not shown
- Hero montage/video and Scroll Down indicator
- Opening-date announcement card
- Positioning statement block
- Script-title renderer with path/clip reveal
- Watercolor swash layer
- Botanical wallpaper layer
- Arched/scalloped image-mask component
- Scroll-progress blur-to-sharp media wrapper
- Editorial two-column story block
- Full-width chapter image with optional shallow parallax
- Room-card carousel
- Room-card hover scrim and description
- Room detail modal
- Feature/amenity grid
- Modal gallery track, arrows, and dots
- Restaurant identity/editorial mosaic
- Rooftop feature
- Spa feature
- Experiential Hotel feature
- Exclusive Services columns
- Info Request form
- Newsletter/footer
- Full-page brown particle transition
- External booking-engine handoff

## 11. Compact build brief for a future task

### Creative direction

Florentine quiet luxury expressed through editorial pacing, fresco and textile color, low-contrast botanical wallpaper, arched architectural masks, restrained antique detailing, and scroll motion that optically develops each image as it becomes the viewer’s focal point.

### Page scope

One long hospitality page plus an external booking-engine destination. Do not invent additional pages unless a later brief asks for them.

### Desktop layout targets from the recording

- Reference viewport: 1280 x 720.
- Fixed header: about 56 px.
- Main editorial max-width: roughly 1030-1080 px depending on section.
- Modal: about 85vw x 90vh at the reference viewport.
- Room cards: three-up with narrow gutters.
- Section spacing: very generous, often 120-200 px around the principal composition.
- Body copy measures: narrow, usually 35-55 characters per line.

### Motion targets

- Keep title writing linked to scroll progress and reversible/replayable on re-entry.
- Blur media only while it is at the lower attention boundary; resolve by the central viewing zone.
- Avoid stacking blur, scale, opacity, and rotation on every object.
- Use transform-based carousel/gallery motion with calm ease-out timing.
- Modal open target: about 0.7-0.8 s; close target: about 0.5 s.
- Long-distance anchor scrolling should ease in and out and allow native interruption.
- Reduced-motion path: instant written titles, no scroll-scrub blur, direct anchor jumps or very short scrolling, and simple modal fades.

### Media requirements

- One cinematic hero montage or a supplied set of short video clips.
- Strong poster image for the hero.
- Property exterior and location imagery.
- At least 6 polished photos per room; premium room categories may use 10-12.
- Correct room-to-image mapping.
- Dining interiors, patio, rooftop/Duomo, spa treatment room, details/amenities, and Florence destination image.
- Botanicals and watercolor swashes should be original/licensed assets or code/SVG created specifically for the project.

### Validation targets

- Compare the loader, title-writing states, blur threshold, card hover, carousel movement, modal timing, gallery movement, and booking handoff at 60 fps.
- Test at phone, tablet, 1280 desktop, and large desktop widths; the video only validates the 1280 desktop reference.
- Test mouse, touch, keyboard, Escape, focus return, and reduced motion.
- Confirm no horizontal overflow, clipped scripts, unreadable patterned text, or off-screen modal controls.
- Verify image loading, layout shift, animation smoothness, and scroll performance on mid-range mobile hardware.

## 12. Facts, inferences, and unknowns

### Confirmed from frames

- Exact video/frame metadata and complete extraction.
- Section order and desktop compositions.
- Header labels and sticky behavior.
- Script titles are progressively drawn.
- Bottom-entry media is blurred and resolves in view.
- Room cards have hover descriptions and horizontal carousel movement.
- Room details use a blurred-background overlay with features and multi-photo gallery.
- Main page uses a large enquiry form and newsletter footer.
- Book Now hands off to SynXis.

### Strong inferences

- SVG path/clip drawing with scroll-progress control.
- Scroll-progress blur interpolation.
- Scroll-trigger reset/replay on re-entry.
- Body-scroll lock and focus-oriented modal architecture.
- Shallow parallax/overscan on some full-width images.
- Distance-aware eased anchor scrolling.

### Unknown from the recording

- Source framework, component library, animation library, DOM structure, or proprietary implementation.
- Exact fonts, breakpoints, CSS easing curves, blur formula, and scroll library.
- Mobile/tablet layouts.
- Accessibility implementation behind the visuals.
- Form submission behavior.
- Whether the opening notice closes automatically or from a click.
- Whether room galleries support touch drag, autoplay, looping, or keyboard input.
- Live-site behavior today; no live DOM/site inspection was performed.

## 13. Keyframe manifest

Lossless keyframes are in `keyframes-fullres`:

1. 00:00.00 loader
2. 00:02.50 loader zoom
3. 00:03.00 hero
4. 00:06.00 opening announcement
5. 00:18.00 Welcome reveal
6. 00:21.50 location block
7. 00:27.00 Rooms and Suites with blurred arch image
8. 00:32.00 large rooms image
9. 00:38.00 room-card hover
10. 00:46.00 later carousel position
11. 00:50.50 Charming Room overlay
12. 01:07.50 Deluxe Double overlay
13. 01:25.50 Dining with blurred arch image
14. 01:30.00 Segreto content
15. 01:37.50 Sotto le stelle
16. 01:49.00 Spa with blurred arch image
17. 01:54.50 Experiential Hotel
18. 01:58.75 Info Request
19. 02:01.50 footer
20. 02:07.50 anchor-navigation start
21. 02:20.00 pre-booking page state
22. 02:24.00 external booking blank/load state
23. 02:28.00 external booking header/controls
24. 02:46.00 calendar state
25. 03:44.00 room/rate listing
26. 04:02.00 final guest-control state

