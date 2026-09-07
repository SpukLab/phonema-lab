# Phonema Lab Runtime Rules — RH01

Purpose: keep technical friction below the creative layer.

## Mandatory for new explorations

1. Start from a confirmed working renderer. Do not rewrite the engine for a visual variation.
2. Include `../runtime/phonema-runtime.js` and initialize it.
3. Use `PhonemaRuntime.dpr()` for canvas sizing.
4. Every visual subsystem must enter with `ctx.save()` and leave with `ctx.restore()`.
5. Do not leave `globalAlpha`, `globalCompositeOperation`, `shadowBlur`, transforms, font or fill/stroke state leaking into the next subsystem/frame.
6. Use Runtime limits for expensive operations: `blur()`, `maxFont()`, `count()`.
7. Use `PhonemaRuntime.raf(frame)` so runtime errors become visible rather than silently killing the canvas.
8. FULL is the artistic target. SAFE is an automatic survival mode, not an aesthetic preset.
9. A new exploration must be added to `explorations/manifest.json` and the Lab index in the same iteration.
10. Before considering publication complete, open `runtime/health.html`. All registered specimens must report PASS for publication + JavaScript syntax.

## Perception rule

Performance budget and creative budget are separate. Reduce redundant computation before reducing perceptual density.

## Known failure patterns discovered

- Undefined identifier inside a behavior that only activates later can look like a delayed crash.
- Canvas state leakage can make a cheap full-screen operation unexpectedly expensive on the next frame.
- Huge text scale + shadow blur + high DPR multiplies raster cost.
- Replacing the stable renderer while changing artistic behavior makes diagnosis ambiguous.
