$ErrorActionPreference = 'Stop'
$html = Get-Content -Raw "$PSScriptRoot\..\index.html"
$css = Get-Content -Raw "$PSScriptRoot\..\styles.css"

if ($html -notmatch 'name="viewport" content="width=device-width, initial-scale=1"') { throw 'Falta viewport móvil.' }
if (([regex]::Matches($html, 'class="date-picker-native"')).Count -ne 6) { throw 'Deben existir seis datepickers móviles.' }
if ($css -notmatch '@media \(max-width: 560px\)') { throw 'Falta breakpoint para teléfonos.' }
if ($css -notmatch 'input\[type="number"\].*font-size: 16px') { throw 'Los inputs móviles deben usar 16px para evitar zoom en iOS.' }
if ($css -notmatch 'date-picker-native.*width: 44px !important;.*height: 44px !important') { throw 'El datepicker no alcanza el área táctil mínima.' }
if ($css -notmatch 'body \{[^}]*overflow-x: hidden') { throw 'Falta protección contra desbordamiento horizontal.' }

Write-Output 'Auditoría móvil estática superada.'
