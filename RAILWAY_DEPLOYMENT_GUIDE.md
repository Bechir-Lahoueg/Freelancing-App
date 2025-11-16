# 🚂 Guide de Déploiement Railway - Backend

## Configuration Railway

### 1. Variables d'Environnement à Configurer

Dans Railway Dashboard > Variables, ajoutez :

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=votre_mongodb_uri_production

# JWT
JWT_SECRET=votre_secret_jwt_super_securise

# Session
SESSION_SECRET=votre_session_secret_super_securise

# OAuth Google
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret

# OAuth Facebook (optionnel)
FACEBOOK_APP_ID=votre_facebook_app_id
FACEBOOK_APP_SECRET=votre_facebook_app_secret

# OAuth Microsoft (optionnel)
MICROSOFT_CLIENT_ID=votre_microsoft_client_id
MICROSOFT_CLIENT_SECRET=votre_microsoft_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloudinary_cloud_name
CLOUDINARY_API_KEY=votre_cloudinary_api_key
CLOUDINARY_API_SECRET=votre_cloudinary_api_secret

# Client URL (Frontend)
CLIENT_URL=https://votre-frontend-url.vercel.app
```

### 2. Configuration du Build dans Railway Dashboard

#### Méthode A : Via les Settings (Recommandé)

1. **Allez dans Settings > Build**
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Ou laissez les fichiers de configuration**
   - Les fichiers `nixpacks.toml`, `Procfile` et `railway.json` gèrent automatiquement

#### Méthode B : Variables Railway Service

Si la méthode A ne fonctionne pas, ajoutez ces variables dans Railway :

```
NIXPACKS_BUILD_CMD=cd server && npm install
NIXPACKS_START_CMD=cd server && npm start
```

### 3. Déploiement

1. **Connectez votre repository GitHub**
   - Railway > New Project > Deploy from GitHub repo
   - Sélectionnez `Freelancing-App`

2. **Railway détectera automatiquement les fichiers de config**

3. **Ajoutez toutes les variables d'environnement**

4. **Déployez !**

### 4. Configuration Post-Déploiement

#### A. Récupérer l'URL Railway
Après le déploiement, Railway vous donnera une URL comme :
```
https://votre-app.up.railway.app
```

#### B. Mettre à jour CORS
L'URL du frontend (Vercel) doit être autorisée dans votre backend.
Les variables `CLIENT_URL` dans Railway doivent pointer vers votre frontend Vercel.

#### C. Mettre à jour le Frontend
Dans votre frontend sur Vercel, ajoutez la variable d'environnement :
```
VITE_API_URL=https://votre-app.up.railway.app
```

### 5. Vérification

Testez ces endpoints :
```bash
# Health check
curl https://votre-app.up.railway.app/api/health

# Root endpoint
curl https://votre-app.up.railway.app/
```

### 6. Logs et Debugging

Pour voir les logs :
- Railway Dashboard > Deployments > View Logs
- Vérifiez les erreurs de connexion MongoDB
- Vérifiez que toutes les variables d'environnement sont définies

### 7. Résolution de Problèmes Courants

#### Erreur : "Cannot find module"
**Solution** : Vérifiez que `type: "module"` est dans `server/package.json` ✅ (Déjà fait)

#### Erreur : "MONGODB_URI is not defined"
**Solution** : Ajoutez la variable d'environnement dans Railway Dashboard

#### Erreur : "Port already in use"
**Solution** : Railway utilise automatiquement la variable `PORT`. Votre code doit utiliser :
```javascript
const PORT = process.env.PORT || 5000;
```
✅ (Déjà fait dans votre server.js)

#### Erreur : "CORS policy"
**Solution** : Vérifiez que `CLIENT_URL` est correctement définie et correspond à votre URL Vercel

### 8. Alternative : Déployer uniquement le dossier server

Si les fichiers de config ne marchent pas, créez un nouveau repo avec seulement le dossier `server` :

```bash
# Dans un nouveau dossier
git init
git remote add origin <nouveau-repo-url>

# Copier uniquement le dossier server
cp -r ../do-it/server/* .

# Commit et push
git add .
git commit -m "Initial server deployment"
git push -u origin main
```

Puis déployez ce nouveau repo sur Railway.

## 🔗 Liens Utiles

- [Railway Docs](https://docs.railway.app/)
- [Nixpacks Configuration](https://nixpacks.com/docs/configuration)
- [Railway Monorepo Guide](https://docs.railway.app/deploy/monorepo)

## ✅ Checklist de Déploiement

- [ ] Fichiers de configuration créés (nixpacks.toml, Procfile, railway.json)
- [ ] Repository connecté à Railway
- [ ] Toutes les variables d'environnement ajoutées
- [ ] Root Directory configuré sur `server` (si nécessaire)
- [ ] Déploiement réussi
- [ ] URL Railway récupérée
- [ ] CORS configuré avec URL Vercel
- [ ] Frontend Vercel mis à jour avec URL Railway
- [ ] Tests des endpoints effectués
- [ ] Super Admin créé (vérifier les logs)
