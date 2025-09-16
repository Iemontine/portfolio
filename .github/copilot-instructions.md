# Copilot Instructions for This Repo

Purpose: Help AI agents work productively in this Vite + TypeScript single-page portfolio with a custom window manager, CRT-styled UI, and ASCII side panel.

## Big Picture
- This is a static SPA: `index.html` loads `src/main.ts` which initializes a custom `WindowManager` (no framework).
- UI has three pillars:
  - Desktop icons grid (`#desktop`) that opens “content windows”: `research`, `projects`, `experience`, `contact`.
  - A persistent, separate “About Me” window with its own sizing and animations.
  - An ASCII art panel that shows (with enter/exit animation) on desktop when any content window is open, or when About Me is visible.
- Styling is mostly handcrafted in `src/style.css` with Tailwind v4 utilities layered in via PostCSS.

## Build & Run
- Dev server: `npm run dev` (Vite opens on `http://localhost:3000`).
- Type-check + build: `npm run build` (first runs `tsc`, then `vite build`).
- Preview production build: `npm run preview`.
- Deploy to GitHub Pages: `npm run deploy` (publishes `dist/` via `gh-pages`).
- Vite base path is `/portfolio/` (see `vite.config.ts`) to match GitHub Pages.

## Architecture & Key Files
- `src/main.ts`: Core logic. The `WindowManager`:
  - Tracks content windows in `Map<string, HTMLElement>`; z-index via `zIndexCounter`.
  - Maintains a shared maximize state for all content windows (`isContentWindowMaximized`).
  - Manages a distinct About Me window (not in the windows `Map`) with its own maximize/restore and FLIP animation.
  - Updates the ASCII panel based on active content window or About Me visibility; resizes with `ResizeObserver` and window `resize`.
- `src/ascii-art.ts`: Source of ASCII art per window ID; default/fallback also defined.
- `src/style.css`: CRT effects, layout, window/titlebar controls, icon masks, and Tailwind import (`@import "tailwindcss"`).
- `index.html`: Mount points (`#desktop`, `#window-container`) and header; loads `src/main.ts` as module.
- `public/`: Static assets served at root (e.g., `/favicon.ico`, `/clem.png`, `/noise-image.png`). Put new images here for stable URLs.

## Project Conventions
- Window IDs are canonical: `research`, `projects`, `experience`, `contact`, and special `about-me`.
- About Me window behavior is independent: do not add it to the generic window map; use `showAboutMe()`, `toggleAboutMe()`, `layoutAboutMeDefault/Maximized()`.
- ASCII panel sizing relies on `calculateOptimalFontSize()` and a deferred font-size application during typing transitions; avoid replacing this with generic CSS scaling.
- Mobile breakpoint: `window.innerWidth <= 768` disables maximize for content windows and ensures About Me visibility rules.
- Assets referenced with absolute paths (e.g., `/favicon.ico`) work in production because of Vite `base`.

### Switching & Toggling Rules
- Desktop icon clicks use `toggleWindow(windowId)` — if the window is already open, clicking its icon closes it. Otherwise it opens/switches to it.
- Only one content window may be visible at a time. When opening a window:
  1) Set `currentContentWindow = windowId` and call `updateAsciiWindow()` immediately so the ASCII art swaps first.
  2) Call `closeAllContentWindows({ exceptId: windowId, instant: true, suppressAscii: true })` to guarantee at-most-one window visible.
  3) Create the new window with `createWindow(config)`.
- `closeWindow(id, opts)` supports `{ instant?: boolean; suppressAscii?: boolean }`. Use `suppressAscii: true` when closing due to a switch to avoid flicker/double updates.
- About Me remains independent of the content windows Map; its visibility influences ASCII fallback when no content window is active.

### ASCII Panel Behavior
- Visibility: ASCII shows only on desktop when either a content window is active or About Me is visible. Otherwise it hides.
- Animations: `updateAsciiWindow()` applies `ascii-enter` on show and `ascii-exit` on hide. It cancels in-flight animations safely using `asciiEnterHandler`/`asciiExitHandler` to avoid races during rapid close→open sequences.
- Hidden-state cleanup: On exit completion, the panel is `display: none`, `.ascii-art` text is cleared, typing state is reset, and `--ascii-line-height` is removed so the next show recomputes sizing. This prevents the “old art deletes in the new font size” artifact.
- Art selection: When visible, art is chosen by `currentContentWindow || "about-me"` (desktop only). Typing uses fixed-step delete/type with a deferred font-size (`pendingFontSize`) applied at the correct phase.

## Adding a New Section (Example: “blog”)
1. Add a desktop icon in `initializeDesktop()` by extending the `icons: DesktopIcon[]` array: `{ id: "blog-icon", label: "Blog", windowId: "blog" }`.
2. Provide content in `getWindowConfig()` with a case `blog` pointing to a new `getBlogContent()` method you add.
3. Add ASCII art in `src/ascii-art.ts`: `asciiArts['blog'] = `...`;`.
4. Optionally define an icon mask in `src/style.css` under “ICON MASKS”: `.desktop-icon[data-window="blog"] .icon { mask-image: url("data:image/svg+xml,..."); }`.
5. No routing is required; prefer `WindowManager.toggleWindow('blog')` for icon clicks so users can close the section by clicking again. For programmatic opens, call `openWindow('blog')` which enforces single-window visibility.

## When Editing or Extending
- Preserve separate responsibilities:
  - Content windows (Map + shared maximize) vs About Me (standalone) vs ASCII panel (display + typing/sizing).
- Keep DOM operations in `WindowManager` consistent (no frameworks). Avoid cross-file global state; use existing fields.
- Respect TypeScript `strict` settings in `tsconfig.json`; no `any` unless intentional (e.g., `window as any` surface).
- Put new static files in `public/` and reference with absolute paths.
- If changing layout metrics that affect ASCII fit, update both CSS variables in `style.css` and sizing logic in `calculateOptimalFontSize()` coherently.

## Debugging Tips
- Dev-only logs guarded via `import.meta.env.DEV` exist in `main.ts`.
- Resize behavior can mask layout issues; test both mobile (<=768) and desktop sizing, including maximize/restore.
- If ASCII appears oversized on first show, ensure `asciiElement.textContent` is set before deferring font-size, as in `updateAsciiWindow()`.
- If the art box fails to reappear after a rapid close→open during the exit animation, make sure `updateAsciiWindow()` cancels any in-flight `ascii-exit` (remove its listener and class) before applying `ascii-enter`.

## CI/Deploy Notes
- Site expects to live at `/portfolio/` on GitHub Pages. If you change repo name or hosting path, update `vite.config.ts: base`.