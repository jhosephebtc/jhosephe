node examples/zest/generate.mjs
$env:THEME = 'light'
node examples/zest/generate.mjs
Remove-Item Env:THEME
$names = @('zest-hero-3x2','zest-track-record-3x2','zest-q3-loans-3x2','zest-collateral-vaults-3x2','zest-rates-3x2','zest-clmm-3x2','zest-quote-vault-3x2','zest-quote-mission-3x2')
foreach ($v in @('', '-light')) {
  $bg = if ($v -eq '') { '#050505' } else { '#FFF6F0' }
  foreach ($n in $names) {
    node .agents/skills/jhosephe-svg-motion/scripts/export-video.mjs --svg "examples/zest/$n$v.svg" --width 1620 --height 1080 --duration 8 --bg $bg --scratch "examples/zest/.render-tmp/$n$v" --preview | Out-Null
  }
}
'done'
