# Script PowerShell pour remplacer les caracteres accentues
# Encodage: UTF-8 BOM

Write-Host "Debut du remplacement des caracteres accentues..." -ForegroundColor Cyan

# Compteurs
$filesProcessed = 0
$totalReplacements = 0

# Extensions de fichiers a traiter
$extensions = @('*.js', '*.jsx', '*.md')

# Dossiers a exclure
$excludeDirs = @('node_modules', '.git', 'dist', 'build', 'uploads')

# Fonction pour verifier si un chemin est exclu
function Test-ExcludedPath {
    param($path)
    foreach ($dir in $excludeDirs) {
        if ($path -like "*\$dir\*") {
            return $true
        }
    }
    return $false
}

# Fonction de remplacement
function Remove-Accents {
    param([string]$text)
    
    $text = $text -replace 'é', 'e'
    $text = $text -replace 'è', 'e'
    $text = $text -replace 'ê', 'e'
    $text = $text -replace 'ë', 'e'
    $text = $text -replace 'à', 'a'
    $text = $text -replace 'â', 'a'
    $text = $text -replace 'ä', 'a'
    $text = $text -replace 'ù', 'u'
    $text = $text -replace 'û', 'u'
    $text = $text -replace 'ü', 'u'
    $text = $text -replace 'ô', 'o'
    $text = $text -replace 'ö', 'o'
    $text = $text -replace 'î', 'i'
    $text = $text -replace 'ï', 'i'
    $text = $text -replace 'ç', 'c'
    $text = $text -replace 'É', 'E'
    $text = $text -replace 'È', 'E'
    $text = $text -replace 'Ê', 'E'
    $text = $text -replace 'Ë', 'E'
    $text = $text -replace 'À', 'A'
    $text = $text -replace 'Â', 'A'
    $text = $text -replace 'Ä', 'A'
    $text = $text -replace 'Ù', 'U'
    $text = $text -replace 'Û', 'U'
    $text = $text -replace 'Ü', 'U'
    $text = $text -replace 'Ô', 'O'
    $text = $text -replace 'Ö', 'O'
    $text = $text -replace 'Î', 'I'
    $text = $text -replace 'Ï', 'I'
    $text = $text -replace 'Ç', 'C'
    
    return $text
}

# Traiter tous les fichiers
foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path "." -Filter $ext -Recurse -File
    
    foreach ($file in $files) {
        if (Test-ExcludedPath $file.FullName) {
            continue
        }
        
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $newContent = Remove-Accents $content
            
            if ($content -ne $newContent) {
                Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
                $filesProcessed++
                Write-Host "OK: $($file.Name)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "ERREUR: $($file.Name) - $_" -ForegroundColor Red
        }
    }
}

Write-Host "`nTermine!" -ForegroundColor Green
Write-Host "Fichiers modifies: $filesProcessed" -ForegroundColor Yellow
Write-Host "Verifiez avec: git diff" -ForegroundColor Cyan
