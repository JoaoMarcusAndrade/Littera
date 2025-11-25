$path = 'c:\Users\Rafael\Desktop\LITTERA NOVO\css\style.css'
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Encontra a primeira ocorrência de @media (max-width: 768px)
$pattern = '@media \(max-width: 768px\) \{'
$index = $content.IndexOf('@media (max-width: 768px) {')

if ($index -ge 0) {
    # Insere o banner-carousel-container display:none após @media (max-width: 768px) {
    $insertText = "@media (max-width: 768px) {`n    .banner-carousel-container {`n        display: none !important;`n    }`n`n"
    
    $before = $content.Substring(0, $index)
    $after = $content.Substring($index)
    
    $content = $before + $insertText.Replace('@media (max-width: 768px) {', '@media (max-width: 768px) {') + $after.Replace('@media (max-width: 768px) {', '', 1)
    
    Set-Content -Path $path -Value $content -Encoding UTF8
    "Banner oculto no CSS!"
} else {
    "Media query 768px não encontrada"
}
