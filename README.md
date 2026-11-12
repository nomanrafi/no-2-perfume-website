# VELORA Parfums — 3D perfume website

Premium one-page site (recreation of the reference "Ciao Energy" video layout) using the two Velora GLB models.

## Features
- Hero: 3D arc carousel of bottles — drag with mouse / touch, wheel, ‹ › arrows or keyboard ←/→.
- Hanging ring light above the centre bottle; side bottles are dark silhouettes.
- Product name + slider + "Scroll to discover"; bottom glow & accent colour change per product.
- Scroll story: colour gradient background, intro text, 4 feature steps with round icon nav, "PURE ELEGANCE" flash statement, FAQ accordion.
- Custom DRAG cursor, sound toggle, loader.

## Run locally
```
python3 -m http.server 8000
# open http://localhost:8000
```
Static site — no build step. Deploy as-is on GitHub Pages / Vercel / Netlify.

## Files
- `index.html`, `css/style.css` (sizes in vw to match the video), `css/fonts.css`
- `js/main.js` (three.js scene, carousel, scroll), `js/vendor/` (three.js r160)
- `assets/models/*.glb`, `assets/fonts/`
