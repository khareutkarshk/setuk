<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes (Setuk website)

- Read `README.md` first for the architecture: two root layouts (`app/(en)`, `app/(hi)`), typed dictionaries in `content/`, and a framework-free Three.js engine in `lib/sadan/` that is lazy-loaded by `components/home/story/story-controller.tsx`.
- All copy lives in `content/en.ts` and `content/hi.ts`, both typed by `content/types.ts`. Don't hard-code user-facing strings in components.
- Use the Lok Navy tokens (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `text-accent-ink`, `bg-accent-soft`), not raw colours.
- Import icons only through `components/icons.ts`.
- Layout modes: `classic`, `band` and `side` are chosen by media queries in `components/home/story/story.module.css` (exposed as `--story-mode`). Keep the queries in step with the compact-mode checks in `story-controller.tsx` and `app/globals.css`. Compact framing for a stop lives in its `c` entry in `STOPS`. Never hide copy on small screens.
- Story cards (`chapters.tsx`) and camera stops (`STOPS` in `lib/sadan/engine.ts`) are paired by index. The office scenes (chapters 2, 3 and 5 to 8) are driven by `update()` in `lib/sadan/office-set.ts` from the same progress value; the Run close-up feeds the camera through `office.shot`.
- Strings drawn in the 3D scene live in `scene` in both dictionaries (`SceneLabels` in `content/types.ts`).
- Decorative patterns: use `Pattern`, `CornerPattern` and `Lotus` from `components/site/pattern.tsx` with `text-*` and `opacity-*` classes. Don't add raw SVG backgrounds.
- Anything new in the set that animates must keep `animating` honest, so the engine can idle and cap frames.
- Textures under `public/sadan/v1/` are cached as immutable. Put changed files in a new version folder.
