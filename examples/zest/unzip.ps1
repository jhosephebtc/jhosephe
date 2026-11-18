$zip = 'C:/Users/Administrador/.gemini/antigravity/brain/5ff0bbc8-f3d0-4786-b3a5-05ed849d6eba/.user_uploaded/media_1794846041513_4dca8a1a.zip'
New-Item -ItemType Directory -Force 'examples/zest/assets' | Out-Null
Expand-Archive -Force -Path $zip -DestinationPath 'examples/zest/assets/kit'
Get-ChildItem 'examples/zest/assets/kit' -Recurse -File | ForEach-Object { "$($_.FullName) $($_.Length)" }
