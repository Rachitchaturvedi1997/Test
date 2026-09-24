# Moholla — cinematic website

Vite + React + TypeScript + Tailwind + Framer Motion.

```
npm install
npm run dev          # local dev server
npm run build        # production build in dist/
```

## Where the visuals come from
Every phone screen is a real capture of Moholla-native v4.2.0: the Roborazzi
screenshots in `android/app/build/outputs/roborazzi/`, converted to WebP in
`public/screens/`. Card text (posts, alerts, events, society, verses) is copied
from `assets/demo.json` inside the APK. Re-run the screenshot tests and
re-export to refresh them.

## Structure
- `src/sections/Film.tsx` — hero + the one continuous sticky "camera" through 10 chapters
- `src/data/chapters.ts` — each chapter's copy, screens, camera pose and zoom
- `src/sections/Overlays.tsx` — floating layers (posts, alerts, events, society, mesh, verse)
- `src/sections/Montage.tsx` — fast feature montage
- `src/sections/Finale.tsx` — the app's real splash → intro → welcome, fade to title
- `src/audio/engine.ts` — generative soundtrack + UI sounds (Web Audio, no files)
- `src/pages/` — "Inside the app" gallery (#screens) and "Why Moholla" (#story)
