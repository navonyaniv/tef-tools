# TEF tools on GitHub Pages

TerraExplorer Fusion (TEF) analysis tools served from GitHub Pages instead of the SGS `tef/custom/tools/` folder.
To update a tool, push to this repo; the TEF config doesn't change.

## How a TEF config loads a tool
Paste `loader.js` into the config's startup script (SGS Admin → TEF configurations).

The loader fetches the tool's HTML from `https://navonyaniv.github.io/tef-tools/` and shows it in TEF's tool panel through `srcdoc`.
The tool then runs with TEF's own origin, so `parent.SGWorld` and the SGS session work as they would for a tool in `./custom/tools/`.
A `<base>` tag makes the tool's relative files load from GitHub.

Pointing `analysis.openAnalysisToolURL` at a github.io URL directly does not work.
The browser blocks a cross-origin iframe from using `parent.SGWorld`.

## Tools
| Folder | Tool |
|---|---|
| `SGSProcessing/` | Runs SkylineGlobe Server processing workflows (3DML → 3D Tiles, Extract Raster, …) |
