$filePath = 'c:\Users\Rafael\Desktop\LITTERA NOVO\css\style.css'
$content = Get-Content -Path $filePath -Raw -Encoding UTF8
$search = '@media (max-width: 768px) {'
$replacement = '@media (max-width: 768px) {
    .banner-carousel-container {
        display: none !important;
    }

'
$content = $content -replace [regex]::Escape($search), $replacement
Set-Content -Path $filePath -Value $content -Encoding UTF8
