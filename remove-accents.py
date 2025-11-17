# -*- coding: utf-8 -*-
import os
import re

# Dictionnaire de remplacement
replacements = {
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'à': 'a', 'â': 'a', 'ä': 'a',
    'ù': 'u', 'û': 'u', 'ü': 'u',
    'ô': 'o', 'ö': 'o',
    'î': 'i', 'ï': 'i',
    'ç': 'c',
    'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
    'À': 'A', 'Â': 'A', 'Ä': 'A',
    'Ù': 'U', 'Û': 'U', 'Ü': 'U',
    'Ô': 'O', 'Ö': 'O',
    'Î': 'I', 'Ï': 'I',
    'Ç': 'C'
}

# Dossiers à exclure
exclude_dirs = {'node_modules', '.git', 'dist', 'build', 'uploads'}

# Extensions de fichiers à traiter
extensions = {'.js', '.jsx', '.md'}

files_modified = 0

def remove_accents(text):
    for accented, plain in replacements.items():
        text = text.replace(accented, plain)
    return text

def should_process_file(filepath):
    # Vérifier l'extension
    if not any(filepath.endswith(ext) for ext in extensions):
        return False
    
    # Vérifier si dans un dossier exclu
    path_parts = filepath.split(os.sep)
    if any(excluded in path_parts for excluded in exclude_dirs):
        return False
    
    return True

def process_file(filepath):
    global files_modified
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = remove_accents(content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            files_modified += 1
            print(f"✓ {filepath}")
            return True
    except Exception as e:
        print(f"✗ {filepath}: {e}")
    return False

# Parcourir tous les fichiers
for root, dirs, files in os.walk('.'):
    # Exclure les dossiers
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    
    for file in files:
        filepath = os.path.join(root, file)
        if should_process_file(filepath):
            process_file(filepath)

print(f"\n✨ Termine! {files_modified} fichiers modifies")
