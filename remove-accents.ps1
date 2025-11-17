# Script PowerShell pour remplacer tous les caractères accentués
# par leurs équivalents non accentués dans le projet

Write-Host "🔄 Début du remplacement des caractères accentués..." -ForegroundColor Cyan

# Dictionnaire des remplacements
$replacements = @{
    [char]0x00E9 = 'e'  # é
    [char]0x00E8 = 'e'  # è
    [char]0x00EA = 'e'  # ê
    [char]0x00EB = 'e'  # ë
    [char]0x00E0 = 'a'  # à
    [char]0x00E2 = 'a'  # â
    [char]0x00E4 = 'a'  # ä
    [char]0x00F9 = 'u'  # ù
    [char]0x00FB = 'u'  # û
    [char]0x00FC = 'u'  # ü
    [char]0x00F4 = 'o'  # ô
    [char]0x00F6 = 'o'  # ö
    [char]0x00EE = 'i'  # î
    [char]0x00EF = 'i'  # ï
    [char]0x00E7 = 'c'  # ç
    [char]0x00C9 = 'E'  # É
    [char]0x00C8 = 'E'  # È
    [char]0x00CA = 'E'  # Ê
    [char]0x00CB = 'E'  # Ë
    [char]0x00C0 = 'A'  # À
    [char]0x00C2 = 'A'  # Â
    [char]0x00C4 = 'A'  # Ä
    [char]0x00D9 = 'U'  # Ù
    [char]0x00DB = 'U'  # Û
    [char]0x00DC = 'U'  # Ü
    [char]0x00D4 = 'O'  # Ô
    [char]0x00D6 = 'O'  # Ö
    [char]0x00CE = 'I'  # Î
    [char]0x00CF = 'I'  # Ï
    [char]0x00C7 = 'C'  # Ç
}

# Extensions de fichiers à traiter
$extensions = @('*.js', '*.jsx', '*.md', '*.json', '*.html', '*.css')

# Dossiers à exclure
$excludeDirs = @('node_modules', '.git', 'dist', 'build', 'uploads')

# Compteurs
$filesProcessed = 0
$replacementsMade = 0

# Fonction pour vérifier si un chemin est exclu
function Test-ExcludedPath {
    param($path)
    foreach ($dir in $excludeDirs) {
        if ($path -like "*\$dir\*" -or $path -like "*/$dir/*") {
            return $true
        }
    }
    return $false
}

# Traiter tous les fichiers
foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path "." -Filter $ext -Recurse -File
    
    foreach ($file in $files) {
        # Vérifier si le fichier est dans un dossier exclu
        if (Test-ExcludedPath $file.FullName) {
            continue
        }
        
        try {
            # Lire le contenu du fichier en UTF-8
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $originalContent = $content
            $fileChanged = $false
            
            # Appliquer tous les remplacements
            foreach ($key in $replacements.Keys) {
                if ($content -match [regex]::Escape($key)) {
                    $content = $content -replace [regex]::Escape($key), $replacements[$key]
                    $fileChanged = $true
                }
            }
            
            # Si le fichier a été modifié, l'écrire
            if ($fileChanged) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                $filesProcessed++
                
                # Compter le nombre de remplacements
                $diff = ($originalContent.Length - $content.Length)
                if ($diff -ne 0) {
                    $replacementsMade++
                }
                
                Write-Host "✅ $($file.Name)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "❌ Erreur avec $($file.Name): $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n✨ Terminé!" -ForegroundColor Green
Write-Host "📊 Statistiques:" -ForegroundColor Cyan
Write-Host "   - Fichiers modifiés: $filesProcessed" -ForegroundColor Yellow
Write-Host "   - Remplacements effectués: $replacementsMade" -ForegroundColor Yellow
Write-Host "`n💡 Conseil: Verifiez les changements avec git diff avant de commit" -ForegroundColor Magenta
