Get-ChildItem -Recurse -File -Path . -Include *.woff2,*.ttf,*.otf -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules|\.next|zest\\assets' } | Select-Object -First 25 | ForEach-Object { "$($_.FullName) $($_.Length)" }
Test-Path 'node_modules/playwright'
Test-Path 'package.json'
Get-ChildItem -Directory -Path 'examples/lunarcrush' -Force | ForEach-Object { $_.Name }
