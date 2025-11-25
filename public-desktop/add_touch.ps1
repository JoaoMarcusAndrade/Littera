$filePath = 'c:\Users\Rafael\Desktop\LITTERA NOVO\js\script.js'
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Encontra e adiciona touch ao carousel
$touchCode = @'

        // Touch/Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;

        containerEl.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        containerEl.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            if (touchStartX - touchEndX > 50) {
                updatePosition(-step()); // Próximo
            } else if (touchEndX - touchStartX > 50) {
                updatePosition(step()); // Anterior
            }
        }
'@

# Substitui procurando pelo padrão único
$search = 'newNext.addEventListener("click", () => updatePosition(-step()));'
$replacement = $search + $touchCode

$content = $content -replace [regex]::Escape($search), $replacement

Set-Content -Path $filePath -Value $content -Encoding UTF8
Write-Host 'Touch/Swipe adicionado ao carousel!'
