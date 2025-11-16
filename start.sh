#!/bin/bash

# Script de démarrage pour Railway
echo "🚀 Starting Do It Backend..."

# Naviguer vers le dossier server
cd server

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Démarrer le serveur
echo "✅ Starting server..."
npm start
