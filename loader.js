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

    analysis.addAnalysisTool({
        id: 'sgsProcessingGhBtn',
        name: 'SGS Processing',
        title: 'Run SkylineGlobe Server processing workflows (tool loaded from GitHub)',
        icon: BASE + 'SGSProcessing/sgsProcessing.svg',
        action: "ghTools.open('SGSProcessing/SGSProcessing.html', 'SGS Processing')"
    });
})();
