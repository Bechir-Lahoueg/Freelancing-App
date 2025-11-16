# 🚀 Quick Railway Deployment Steps

## Option 1 : Configuration via Railway Dashboard (RECOMMANDÉ)

### 1. Dans Railway Dashboard > Settings > Build

```
Root Directory: server
Build Command: npm install
Start Command: npm start
```

### 2. Ajoutez les Variables d'Environnement

Allez dans Variables et ajoutez :
- `MONGODB_URI`
- `JWT_SECRET`
- `SESSION_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLIENT_URL` (URL de votre frontend Vercel)
- `NODE_ENV=production`

### 3. Redéployez

Cliquez sur "Deploy" ou attendez le déploiement automatique.

---

## Option 2 : Si l'Option 1 ne fonctionne pas

### Railway utilisera automatiquement les fichiers :
- ✅ `nixpacks.toml` (configuration Nixpacks)
- ✅ `Procfile` (commande de démarrage)
- ✅ `railway.json` (configuration Railway)
- ✅ `start.sh` (script de démarrage bash)

Tous ces fichiers sont maintenant dans votre repo !

---

## Après le Déploiement

1. **Récupérez l'URL Railway** : `https://votre-app.up.railway.app`

2. **Testez l'API** :
   ```bash
   curl https://votre-app.up.railway.app/api/health
   ```

3. **Mettez à jour le Frontend (Vercel)** :
   - Ajoutez la variable : `VITE_API_URL=https://votre-app.up.railway.app`

4. **Redéployez le Frontend** sur Vercel

---

## 🔧 Troubleshooting

### Erreur : "Could not determine how to build"
**Solution** : Configurez manuellement dans Settings > Build (Option 1)

### Erreur : Build failed
**Solution** : Vérifiez les logs dans Deployments > View Logs

### Erreur : MongoDB Connection
**Solution** : Vérifiez que `MONGODB_URI` est bien défini dans Variables

### Erreur : CORS
**Solution** : Vérifiez que `CLIENT_URL` correspond à votre URL Vercel exacte

---

## 📊 Variables d'Environnement Requises

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret
SESSION_SECRET=votre_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://votre-app.vercel.app
```

OAuth (optionnel) :
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
```

---

## ✅ C'est prêt !

Votre backend devrait maintenant être déployé sur Railway ! 🎉
