# Ducati 3D Model Archive

This folder contains the Ducati Panigale V4 R interactive 3D model implementation that was originally featured in the Hero Manifesto section.

It was archived to reduce the website payload and improve performance by eliminating the Three.js and GLTF loading overhead.

## Files Archived:
- \`manifesto.js\`: The main logic for loading Three.js, initializing the scene, setting up lighting, handling touch/mouse drag inertia, and render-on-demand loops.
- \`manifesto.config.js\`: Configuration settings (camera angles, lighting intensities, colors, and inertia damping).
- \`assets/ducati_v4r.glb\`: The 3D model.

## Original Integration Points (Removed from Live Site):
1. **HTML:** 
   - An \`importmap\` block was present in the \`<head>\` of \`index.html\` to resolve bare \`three\` imports.
   - An HTML comment \`<!-- Ducati 3D canvas injected here by manifesto.js -->\` was inside the \`.manifesto-tagline-row\` of \`index.html\`.
2. **JavaScript:** 
   - \`script.js\` imported \`initManifesto\` from \`manifesto.js\` and called it during DOMContentLoaded.
3. **CSS:**
   - \`hero.css\` contained styles for \`.manifesto-ducati-wrap\`, \`.is-dragging\`, and \`#manifesto-ducati-canvas\`.

## How to Restore:
1. Move the files back to \`sections/hero/\`.
2. Add the \`initManifesto()\` call back to \`script.js\`.
3. Add the \`importmap\` for Three.js back to the top of \`index.html\`.
4. Restore the CSS block in \`hero.css\` for the Ducati wrap and canvas positioning.
