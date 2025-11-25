$file = 'C:\Users\Rafael\Desktop\LITTERA NOVO\css\style.css'
$content = [IO.File]::ReadAllText($file)
$fixed = $content -Replace '\.popup-overlay\.show \{\s*opacity: 1;', '.popup-overlay.show { display: flex; opacity: 1;'
[IO.File]::WriteAllText($file, $fixed)
Write-Host 'CSS fixed!'
