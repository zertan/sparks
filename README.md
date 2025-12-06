# Desert Runner Playground

This repository now hosts two parts:
- A legacy Vite/Three.js vignette of the red desert runner (still runnable for quick previews).
- A **Unity URP** setup (in `unity/`) focused on achieving the bright, foggy atmospheric look with global illumination, depth of field, and bloom.

## Unity path (recommended for final visuals)
See `unity/README.md` for importing the `Assets` folder into a URP project and enabling the `AtmosphereSetup` component. It seeds global volume overrides for exposure, bloom, fog, and depth of field to hit the desired glowing-horizon mood.

## Web demo (legacy)
The original Three.js scene remains for lightweight previews.

### Getting started (Vite)
After installing a Node.js environment, install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open the printed local URL (typically http://localhost:5173). To create an optimized build for static hosting:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```
