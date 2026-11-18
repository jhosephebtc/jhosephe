$ff = 'examples/lunarcrush/.render-tmp/_ffmpeg/node_modules/ffmpeg-static/ffmpeg.exe'
$targets = @(
  'lunarcrush-dial-coin-3x2',
  'lunarcrush-financial-dark-3x2',
  'lunarcrush-ephemeris-3x2',
  'lunarcrush-nvidia-green-3x2',
  'lunarcrush-alphabet-green-3x2',
  'lunarcrush-spotify-green-3x2'
)

foreach ($t in $targets) {
  $inPattern = "examples/lunarcrush/.render-tmp/$t/frames/frame_%04d.png"
  $outMp4 = "examples/lunarcrush/$t-1080.mp4"
  Write-Host "Encoding $t..."
  & $ff -y -framerate 60 -i $inPattern -c:v libx264 -pix_fmt yuv420p -crf 14 -preset slow -movflags +faststart $outMp4
  if (Test-Path $outMp4) {
    $len = (Get-Item $outMp4).Length
    Write-Host "SUCCESS: $outMp4 length $len"
  } else {
    Write-Host "FAILED: $outMp4"
  }
}
