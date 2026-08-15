# Flora project checkpoint

Saved on 15 August 2026 in `C:\Users\bisha\OneDrive\Documents\ChatGPT\Flora`.

## Completed

- Built the multi-page Next.js Flora hotel site: Home, Dining, Spa, four room detail routes, and booking flow.
- Copied the supplied `C:\Users\bisha\Videos\homeVideo.mp4` to `public\hero.mp4` and connected it to the homepage hero with a poster/reduced-motion fallback.
- Added scroll-scrubbed word reveals, title entrances, image parallax, blur-to-sharp reveals, botanical textures, room carousels, room quick-view overlay, gallery/lightbox, responsive navigation, guest controls, two-month calendar, example room results, and demo cart state.
- Added locally stored placeholder photography, photo credits, accessibility labels, keyboard controls, and reduced-motion handling.
- TypeScript and the optimized production build passed before the final room-overlay layering adjustment.
- Browser QA completed for desktop hero/rooms/dining/spa/booking and mobile hero/navigation/room overlay. No browser errors remained.

## Last source edits saved, awaiting one final rebuild

- Calendar unavailable dates now show a red invalid marker and a validation message when selected.
- Room quick-view is rendered through a document portal, and its close button is fixed above the overlay on mobile.

## Resume after a restart

Open PowerShell in this folder and run:

```powershell
pnpm install
pnpm run typecheck
pnpm run build
pnpm start --hostname 127.0.0.1 --port 3000
```

Then open <http://127.0.0.1:3000>.

For faster editing instead of production mode, run `pnpm dev` after `pnpm install`.

## Remaining final check

1. Rebuild after the fixed mobile overlay close button.
2. Verify the mobile quick-view close button is visible and dismisses the overlay.
3. Verify clicking a future hatched date shows the red marker and validation copy.
4. Leave the localhost server running and hand off the site.

All source files and the supplied hero video are already on disk. Large generated every-frame video analysis files remain in `video-analysis\every-frame` but are intentionally excluded from Git; the reconstruction specification, keyframes, contact sheets, and sequence sheets are included in the project checkpoint.
