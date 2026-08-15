# Flora project checkpoint

Saved on 15 August 2026 in `C:\Users\bisha\OneDrive\Documents\ChatGPT\Flora`.

## Current state

- The working site includes Home, Dining, Spa, four room detail routes, and the interactive booking prototype.
- The supplied `C:\Users\bisha\Videos\homeVideo.mp4` is safely copied to `public\hero.mp4` and connected to the homepage hero, with a poster and reduced-motion fallback.
- The homepage has been rebuilt around the decoded reference recording: compact ivory navigation, pale-blue monogram loader, opening notice, editorial section rhythm, fine script headings, scroll-written paragraphs, blur-to-sharp imagery, domed image masks, blush/ice/sage mood sections, botanical linework, room cards, and the pale room quick-view panel.
- Dining, Spa, room-detail, booking, form, and footer pages now share the same visual system. The Spa hero specifically uses an arched pale-mineral treatment-room image instead of the earlier tropical placeholder.
- Room galleries, quick view, lightbox, guest controls, two-month calendar, unavailable/invalid dates, room results, demo cart state, mobile navigation, keyboard controls, and reduced-motion handling are implemented.
- Placeholder photo licensing and sources are recorded in `PHOTO-CREDITS.md`.

## Verification completed

- `pnpm run typecheck` passes.
- `pnpm run build` passes with all static and dynamic routes generated successfully.
- Browser QA was completed at 1280 × 720 and 390 × 844 for the homepage hero, navigation, Rooms section, room overlay, Dining, Spa, room detail, booking calendar/results, information form, and footer.
- The tested browser flows showed no console errors.

## Resume after a restart

Open PowerShell in this folder and run:

```powershell
pnpm install
pnpm run typecheck
pnpm run build
pnpm dev --hostname 127.0.0.1 --port 3000
```

Then open <http://127.0.0.1:3000>.

## Before a real launch

- Replace editorial placeholder photography with final property-specific assets.
- Replace bracketed address, phone, email, privacy, and operating-detail placeholders.
- Connect real booking inventory, policies, payments, enquiry delivery, and newsletter services.
- Review the supplied hero video for any reference-property branding embedded directly in the footage; the website cannot remove marks baked into the video itself.

All source files and the supplied hero video are on disk. Large generated every-frame video-analysis files remain in `video-analysis\every-frame` but are intentionally excluded from Git; the reconstruction specification, keyframes, contact sheets, and sequence sheets remain available in `video-analysis`.
