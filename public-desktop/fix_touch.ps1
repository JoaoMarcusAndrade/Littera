$file = 'c:\Users\Rafael\Desktop\LITTERA NOVO\js\script.js'
[string[]]$lines = @(Get-Content $file)

# Encontra a linha com "newNext.addEventListener"
$index = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -like '*newNext.addEventListener*') {
        $index = $i
        break
    }
}

if ($index -ge 0) {
    $touchCode = @(
        '',
        '        // Touch/Swipe Support',
        '        let touchStartX = 0;',
        '        let touchEndX = 0;',
        '',
        "        containerEl.addEventListener('touchstart', (e) => {",
        '            touchStartX = e.changedTouches[0].screenX;',
        '        });',
        '',
        "        containerEl.addEventListener('touchend', (e) => {",
        '            touchEndX = e.changedTouches[0].screenX;',
        '            handleSwipe();',
        '        });',
        '',
        '        function handleSwipe() {',
        '            if (touchStartX - touchEndX > 50) {',
        '                updatePosition(-step()); // Próximo',
        '            } else if (touchEndX - touchStartX > 50) {',
        '                updatePosition(step()); // Anterior',
        '            }',
        '        }'
    )
    
    # Insere após a linha encontrada
    $lines = $lines[0..$index] + $touchCode + $lines[($index+1)..($lines.Count-1)]
    
    Set-Content $file -Value $lines -Encoding UTF8
    Write-Host "✓ Touch/Swipe adicionado!"
} else {
    Write-Host "✗ Não encontrou newNext.addEventListener"
}
