// TEF tools hosted on GitHub Pages – paste into a TEF config's startup script.
//
// Why not just analysis.openAnalysisToolURL({url: 'https://<user>.github.io/...'})?
// The tool would then run in an iframe from another origin (github.io), so the browser blocks
// parent.SGWorld / parent.projectTree, and the tool's SGS calls would be cross-site.
// Instead the HTML is fetched from GitHub (Pages allows CORS) and shown in TEF's tool panel
// through srcdoc, so it runs with TEF's own origin, exactly as if it were in ./custom/tools/.
// A <base> tag makes the tool's relative files (icons, scripts) load from GitHub.
(function () {
    var BASE = 'https://navonyaniv.github.io/tef-tools/';   // GitHub Pages root of the tools repo

    window.ghTools = {
        open: function (path, title) {
            fetch(BASE + path + '?v=' + Date.now(), { cache: 'no-store' })
                .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
                .then(function (html) {
                    var dir = BASE + path.replace(/[^\/]*$/, '');
                    html = html.replace(/<head([^>]*)>/i, '<head$1><base href="' + dir + '">');
                    try { analysis.closeViewshed(); } catch (e) {}
                    panel.addAndShow({ type: 1, content: 'about:blank', name: 'gh:' + path, title: title,
                                       closeCallback: analysis.closeAnalysisTool });
                    $('#panelIframe').attr('srcdoc', html);
                    analysis.state.toolURLOpened = true;
                })
                .catch(function (e) { alert('Could not load the tool from GitHub: ' + e.message); });
        }
    };

    // TEF is served with Cross-Origin-Embedder-Policy: require-corp, so an <img src="https://...github.io/...">
    // is blocked. The icon is fetched (GitHub Pages allows CORS) and shown from a local blob URL instead.
    function addTool(item, iconPath) {
        item.icon = '';
        analysis.addAnalysisTool(item);
        fetch(BASE + iconPath)
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
            .then(function (b) { $('#' + item.id + ' img').attr('src', URL.createObjectURL(b)); })
            .catch(function (e) { console.warn('tool icon', iconPath, e); });
    }

    addTool({
        id: 'myToolGhBtn',
        name: 'Area (GitHub)',
        title: 'Terrain area – tool loaded from GitHub (navonyaniv/tef-tools)',
        action: "ghTools.open('MyAnalysisTool/MyTool.html', 'Terrain Area (GitHub)')"
    }, 'MyAnalysisTool/myTool.png');

    addTool({
        id: 'sgsProcessingGhBtn',
        name: 'Processing (GitHub)',
        title: 'Run SkylineGlobe Server processing workflows – tool loaded from GitHub',
        action: "ghTools.open('SGSProcessing/SGSProcessing.html', 'SGS Processing (GitHub)')"
    }, 'SGSProcessing/sgsProcessing.svg');
})();
