from pathlib import Path
path=Path(__file__).resolve().parent
css=(path/'style.css').read_text(encoding='utf8')
core=(path/'core.js').read_text(encoding='utf8')
app=(path/'app.js').read_text(encoding='utf8')
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="A simple educational assessment of exhaustion and workplace conditions."><title>Burnout Insight — Worklife assessment</title><style>'''+css+'''</style></head><body><a href="#main" class="text-link" style="position:absolute;left:-9999px;top:0;z-index:100" onfocus="this.style.left='12px'" onblur="this.style.left='-9999px'">Skip to content</a><div id="app"></div><script>'''+core+'''</script><script>'''+app+'''</script></body></html>'''
(path/'index.html').write_text(html,encoding='utf8')
print(path/'index.html',len(html))
