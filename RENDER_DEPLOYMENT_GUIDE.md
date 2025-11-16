# 🚀 Guide de Déploiement Render - Backend

## Configuration Render

### 1. Créer un nouveau Web Service

1. Allez sur https://render.com
2. Cliquez sur **"New +"** > **"Web Service"**
3. Connectez votre repository GitHub : `Bechir-Lahoueg/Freelancing-App`

### 2. Configuration du Service

Dans la page de configuration, entrez :

**Basic Settings:**
- **Name:** `do-it-backend` (ou le nom de votre choix)
- **Region:** `Oregon (US West)` (ou le plus proche de vous)
- **Branch:** `main`
- **Root Directory:** `server`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:**
  ```
  npm install
  ```
- **Start Command:**
  ```
  npm start
  ```

**Instance Type:**
- Sélectionnez **"Free"** (pour commencer)

### 3. Variables d'Environnement

Cliquez sur **"Advanced"** > **"Add Environment Variable"** et ajoutez :

```
NODE_ENV=production
```

```
MONGODB_URI=mongodb+srv://espritApp:espritApp@espritapp.l5dvpao.mongodb.net/?retryWrites=true&w=majority&appName=EspritApp
```

```
JWT_SECRET=do_it_jwt_secret_key_2025_super_securise
```

```
SESSION_SECRET=do_it_session_secret_2025_tres_securise
```

```
CLIENT_URL=https://votre-app.vercel.app
```
⚠️ **Remplacez par votre vraie URL Vercel**

```
CLOUDINARY_CLOUD_NAME=dkjteg1q9
```

```
CLOUDINARY_API_KEY=326842291974583
```

```
CLOUDINARY_API_SECRET=QOqUSfjOV1GtVL0GqbuVs_Iv0uo
```

```
SUPER_ADMIN_EMAIL=bechirlahweg@gmail.com
```

```
SUPER_ADMIN_PASSWORD=bechirlahweg@gmail.com
```

```
SUPER_ADMIN_NAME=Super Admin
```

### 4. OAuth (Optionnel)

Si vous utilisez OAuth, ajoutez aussi :

```
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
FACEBOOK_APP_ID=votre_facebook_app_id
FACEBOOK_APP_SECRET=votre_facebook_app_secret
MICROSOFT_CLIENT_ID=votre_microsoft_client_id
MICROSOFT_CLIENT_SECRET=votre_microsoft_client_secret
```

### 5. Déploiement

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner votre repo
   - Installer les dépendances
   - Démarrer le serveur
3. Attendez 3-5 minutes

### 6. Récupérer l'URL

Une fois déployé, Render vous donnera une URL comme :
```
https://do-it-backend.onrender.com
```

### 7. Tester le Backend

```bash
# Health check
curl https://do-it-backend.onrender.com/api/health

# Root endpoint
curl https://do-it-backend.onrender.com/
```

### 8. Mettre à Jour le Frontend

Dans votre projet Vercel, ajoutez/mettez à jour la variable d'environnement :

```
VITE_API_URL=https://do-it-backend.onrender.com
```

Puis redéployez le frontend.

### 9. Mettre à Jour CORS

Revenez dans Render et mettez à jour `CLIENT_URL` avec votre vraie URL Vercel :
```
CLIENT_URL=https://votre-app-reelle.vercel.app
```

---

## 🔧 Résolution de Problèmes

### ⚠️ Service qui s'endort (Free tier)

Render met en veille les services gratuits après 15 minutes d'inactivité.
Le premier appel après la mise en veille peut prendre 30-60 secondes.

**Solutions:**
- Passez au plan payant ($7/mois)
- Utilisez un service de "keep-alive" (ping toutes les 10 minutes)

### ❌ Build Failed

Vérifiez :
- Root Directory est bien `server`
- Build Command est `npm install`
- Start Command est `npm start`

### ❌ MongoDB Connection Error

Vérifiez :
- `MONGODB_URI` est correctement défini
- Votre IP est autorisée dans MongoDB Atlas (ajoutez `0.0.0.0/0` pour autoriser toutes les IPs)

### ❌ CORS Error

Vérifiez :
- `CLIENT_URL` correspond exactement à votre URL Vercel
- Pas de `/` à la fin de `CLIENT_URL`

---

## 📊 MongoDB Atlas - Autoriser Render

1. Allez sur MongoDB Atlas > Network Access
2. Cliquez sur **"Add IP Address"**
3. Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Confirmez

---

## ✅ Checklist de Déploiement

- [ ] Service créé sur Render
- [ ] Root Directory configuré sur `server`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Toutes les variables d'environnement ajoutées
- [ ] MongoDB Atlas autorise les connexions depuis n'importe où
- [ ] Déploiement réussi
- [ ] URL Render récupérée
- [ ] Frontend Vercel mis à jour avec URL Render
- [ ] Tests des endpoints effectués
- [ ] CORS configuré correctement

---

## 🔗 Liens Utiles

- [Render Documentation](https://render.com/docs)
- [Render Node.js Deploy Guide](https://render.com/docs/deploy-node-express-app)
- [MongoDB Atlas](https://cloud.mongodb.com)

---

## 💡 Avantages de Render vs Railway

✅ Interface plus simple
✅ Configuration plus directe
✅ Logs plus clairs
✅ Free tier généreux
✅ Support natif des monorepos avec Root Directory

---

## 🎉 C'est prêt !

Votre backend devrait maintenant être déployé sur Render !
