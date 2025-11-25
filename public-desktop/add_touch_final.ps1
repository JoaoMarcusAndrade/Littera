$path = 'c:\Users\Rafael\Desktop\LITTERA NOVO\js\script.js'
$content = Get-Content -Path $path -Raw -Encoding UTF8

$oldLine = 'newNext.addEventListener("click", () => updatePosition(-step()));'

$newLines = $oldLine + @'

        // Touch/Swipe Support
        let touchStartX = 0;
        containerEl.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
        containerEl.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? updatePosition(-step()) : updatePosition(step());
            }
        });
'@

$content = $content.Replace($oldLine, $newLines)
Set-Content -Path $path -Value $content -Encoding UTF8
"Touch adicionado com sucesso!"
