# 🚀 Guide de Déploiement Vercel - Do IT

## 📋 Prérequis

- Compte Vercel (https://vercel.com)
- Compte GitHub connecté à Vercel
- Backend déployé sur Render, Railway ou Heroku

---

## 🎯 Étape 1 : Configuration des Variables d'Environnement

### Sur Vercel Dashboard :

1. **Allez dans votre projet Vercel**
2. **Settings → Environment Variables**
3. **Ajoutez ces variables** :

```env
VITE_API_URL=https://votre-backend.onrender.com/api
VITE_SOCKET_URL=https://votre-backend.onrender.com
```

⚠️ **IMPORTANT** : Remplacez `votre-backend.onrender.com` par l'URL réelle de votre backend !

---

## 🔧 Étape 2 : Configuration du Projet

### 2.1 Vérifier vercel.json

Le fichier `client/vercel.json` doit contenir :

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2.2 Vérifier package.json

Dans `client/package.json`, assurez-vous d'avoir :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 📦 Étape 3 : Déploiement sur Vercel

### Méthode 1 : Via Dashboard (Recommandée)

1. **Connectez-vous à Vercel** : https://vercel.com
2. **Cliquez sur "Add New Project"**
3. **Importez votre repo GitHub** : `Bechir-Lahoueg/Freelancing-App`
4. **Configuration Build** :
   - **Framework Preset** : Vite
   - **Root Directory** : `client`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. **Ajoutez les variables d'environnement** (voir Étape 1)
6. **Cliquez sur "Deploy"**

### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Aller dans le dossier client
cd client

# Déployer
vercel --prod

# Suivre les instructions et configurer :
# - Root directory: ./
# - Build command: npm run build
# - Output directory: dist
```

---

## 🐛 Résolution des Problèmes Courants

### ❌ Erreur : "Failed to compile"

**Cause** : Erreurs de syntaxe ou dépendances manquantes

**Solution** :
```bash
cd client
npm install
npm run build
```

Si le build local réussit, l'erreur vient de Vercel.

---

### ❌ Erreur : "Module not found"

**Cause** : Import incorrect ou dépendance manquante

**Solution** :
```bash
# Vérifier les dépendances
cd client
npm install --save-dev @vitejs/plugin-react

# Rebuild
npm run build
```

---

### ❌ Erreur : "CORS" après déploiement

**Cause** : Backend ne permet pas l'origine Vercel

**Solution** : Dans votre backend (`server.js`), ajoutez :

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://votre-app.vercel.app', // Ajoutez votre URL Vercel
    'https://do-it-freelancing.vercel.app' // Exemple
  ],
  credentials: true
}));
```

---

### ❌ Erreur : "API calls failing"

**Cause** : Variables d'environnement incorrectes

**Solution** :
1. Vérifiez `VITE_API_URL` dans Vercel Settings
2. Assurez-vous que l'URL backend est correcte
3. Testez l'URL backend dans le navigateur : `https://votre-backend.com/api/health/ping`

---

### ❌ Erreur : "Page not found on refresh"

**Cause** : Routing SPA non configuré

**Solution** : Le `vercel.json` doit avoir la règle de rewrite (déjà configuré)

---

## 🔍 Vérifications Post-Déploiement

### 1. Tester les pages principales

- ✅ `https://votre-app.vercel.app/` (Home)
- ✅ `https://votre-app.vercel.app/services` (Services)
- ✅ `https://votre-app.vercel.app/login` (Login)
- ✅ `https://votre-app.vercel.app/register` (Register)

### 2. Vérifier les appels API

Ouvrez la console (F12) et vérifiez qu'il n'y a pas d'erreurs réseau.

### 3. Tester l'authentification

- Créez un compte
- Connectez-vous
- Vérifiez que le token est sauvegardé

### 4. Tester Socket.IO

- Connectez-vous
- Vérifiez que les notifications en temps réel fonctionnent

---

## 📊 Commandes Utiles

```bash
# Build local pour tester
cd client
npm run build
npm run preview

# Voir les logs Vercel
vercel logs [deployment-url]

# Redéployer
vercel --prod

# Voir les déploiements
vercel list
```

---

## 🎨 Optimisations Recommandées

### 1. Activer la compression

Déjà configuré dans `vite.config.js` avec `build.rollupOptions`.

### 2. Lazy loading des routes

```javascript
// Dans App.jsx
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 3. Activer le Cache des Assets

Déjà configuré dans `vercel.json` avec headers `Cache-Control`.

---

## 🔒 Sécurité

### Variables d'environnement à NE JAMAIS exposer :

- ❌ `JWT_SECRET`
- ❌ `MONGODB_URI`
- ❌ `CLOUDINARY_API_SECRET`
- ❌ `GOOGLE_CLIENT_SECRET`

### Variables SAFE pour le frontend :

- ✅ `VITE_API_URL`
- ✅ `VITE_SOCKET_URL`
- ✅ `VITE_APP_NAME`

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Vercel** : Dashboard → Deployments → [Votre déploiement] → Logs
2. **Testez le build en local** : `npm run build`
3. **Vérifiez les variables d'environnement**
4. **Testez l'API backend** : `curl https://votre-backend.com/api/health/ping`

---

## ✅ Checklist de Déploiement

- [ ] Backend déployé et fonctionnel
- [ ] Variables d'environnement configurées sur Vercel
- [ ] CORS configuré dans le backend pour Vercel
- [ ] Build local réussit (`npm run build`)
- [ ] `vercel.json` présent et configuré
- [ ] Projet importé sur Vercel
- [ ] Root directory configuré sur `client`
- [ ] Déploiement réussi
- [ ] Pages principales accessibles
- [ ] API calls fonctionnent
- [ ] Authentification fonctionne
- [ ] Socket.IO connecté

---

## 🎉 Déploiement Réussi !

Une fois toutes les étapes complétées, votre application sera accessible sur :
`https://votre-projet.vercel.app`

**Domaine personnalisé** : Vous pouvez ajouter un domaine personnalisé dans Vercel Settings → Domains.

---

**Last Updated** : 15 Novembre 2025
**Version** : 1.0.0
