#!/bin/bash
# Script de vérification de l'installation du système de commentaires

echo "🔍 Vérification du système de commentaires Do It..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier les fichiers serveur
echo "📂 Vérification des fichiers serveur..."
FILES=(
    "server/models/Comment.js"
    "server/controllers/commentController.js"
    "server/routes/commentRoutes.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file"
    fi
done

echo ""
echo "📂 Vérification des fichiers client..."
FRONT_FILES=(
    "client/src/components/CommentForm.jsx"
    "client/src/components/CommentsModeration.jsx"
    "client/src/components/TestimonialsSection.jsx"
    "client/src/components/TaskCard.jsx"
)

for file in "${FRONT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file"
    fi
done

echo ""
echo "📚 Vérification de la documentation..."
DOCS=(
    "COMMENT_SYSTEM_GUIDE.md"
    "IMPLEMENTATION_SUMMARY.md"
    "API_TESTING_GUIDE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${RED}✗${NC} $doc"
    fi
done

echo ""
echo "🔗 Vérification des imports..."

# Vérifier que commentRoutes est importé dans server.js
if grep -q "commentRoutes" "server/server.js"; then
    echo -e "${GREEN}✓${NC} commentRoutes importé dans server.js"
else
    echo -e "${RED}✗${NC} commentRoutes NON importé dans server.js"
fi

# Vérifier que TestimonialsSection est importé dans Home.jsx
if grep -q "TestimonialsSection" "client/src/pages/Home.jsx"; then
    echo -e "${GREEN}✓${NC} TestimonialsSection importé dans Home.jsx"
else
    echo -e "${RED}✗${NC} TestimonialsSection NON importé dans Home.jsx"
fi

# Vérifier que CommentsModeration est importé dans AdminDashboard.jsx
if grep -q "CommentsModeration" "client/src/pages/AdminDashboard.jsx"; then
    echo -e "${GREEN}✓${NC} CommentsModeration importé dans AdminDashboard.jsx"
else
    echo -e "${RED}✗${NC} CommentsModeration NON importé dans AdminDashboard.jsx"
fi

echo ""
echo "✅ Vérification terminée!"
echo ""
echo "📋 Résumé du système de commentaires:"
echo "   - Les utilisateurs peuvent laisser des avis sur les tâches complétées"
echo "   - Les administrateurs approuvent/rejettent les commentaires"
echo "   - Les avis approuvés s'affichent sur la landing page"
echo "   - Interface de modération dans le dashboard admin"
echo ""
echo "🚀 Pour tester:"
echo "   1. Démarrer le serveur: npm start (dans le dossier server)"
echo "   2. Démarrer le client: npm run dev (dans le dossier client)"
echo "   3. Consulter COMMENT_SYSTEM_GUIDE.md pour les détails complets"
echo ""
