$ffDir = 'examples/zest/.render-tmp/_ffmpeg'
if (-not (Test-Path "$ffDir/node_modules/ffmpeg-static/ffmpeg.exe")) {
  New-Item -ItemType Directory -Force $ffDir | Out-Null
  Push-Location $ffDir
  npm init -y | Out-Null
  npm i ffmpeg-static | Out-Null
  Pop-Location
}
$ff = (Resolve-Path "$ffDir/node_modules/ffmpeg-static/ffmpeg.exe").Path
$names = @('zest-hero-3x2','zest-track-record-3x2','zest-q3-loans-3x2','zest-collateral-vaults-3x2','zest-rates-3x2','zest-clmm-3x2','zest-quote-vault-3x2','zest-quote-mission-3x2')
foreach ($v in @('', '-light')) {
  $bg = if ($v -eq '') { '#050505' } else { '#FFF6F0' }
  $jobs = foreach ($n in $names) {
    Start-Job -ArgumentList "$n$v", (Get-Location).Path, $ff, $bg -ScriptBlock {
      param($n, $cwd, $ff, $bg)
      Set-Location $cwd
      $env:FFMPEG_PATH = $ff
      node .agents/skills/jhosephe-svg-motion/scripts/export-video.mjs --svg "examples/zest/$n.svg" --out "examples/zest/$n-1080.mp4" --width 1620 --height 1080 --fps 60 --duration 8 --bg $bg --scratch "examples/zest/.render-tmp/$n" 2>&1 | Select-Object -Last 1
    }
  }
  $jobs | Wait-Job | Receive-Job
}
Get-ChildItem examples/zest/*-1080.mp4 | ForEach-Object { "$($_.Name) $($_.Length)" }
