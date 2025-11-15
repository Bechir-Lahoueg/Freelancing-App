# Configuration Vercel pour Do IT

## ⚙️ Settings Vercel Dashboard

### Build & Development Settings

```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Environment Variables (OBLIGATOIRE)

```env
VITE_API_URL=https://votre-backend-url.com/api
VITE_SOCKET_URL=https://votre-backend-url.com
```

**Remplacez** `votre-backend-url.com` par l'URL réelle de votre backend !

## 🚀 Déploiement Rapide

1. **Push sur GitHub** ✅ (Déjà fait)
2. **Aller sur** https://vercel.com
3. **Import Project** → Sélectionner `Freelancing-App`
4. **Root Directory** : `client`
5. **Ajouter les variables d'environnement**
6. **Deploy** 🚀

## ✅ Vérifications

- [ ] Backend déployé (Render/Railway/Heroku)
- [ ] Variables d'environnement ajoutées
- [ ] CORS configuré dans le backend
- [ ] Build local réussit (`npm run build`)

## 📝 CORS Backend

Dans `server/server.js`, assurez-vous d'avoir :

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://votre-app.vercel.app', // ← Ajoutez votre URL Vercel ici
  ],
  credentials: true
}));
```

## 🐛 Si le déploiement échoue

1. Vérifiez les **Deployment Logs** dans Vercel
2. Testez `npm run build` localement
3. Vérifiez que le **Root Directory** est bien `client`
4. Vérifiez les **Environment Variables**

## 📊 Build réussi localement

```
✓ 2033 modules transformed
✓ built in 5.52s
```

Tous les fichiers sont optimisés et prêts pour la production !
