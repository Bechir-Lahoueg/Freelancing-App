# Configuration Vercel - Guide Rapide

## Erreurs 401/307 - Solutions

### 1. Verifier les Parametres du Projet

Allez sur **Vercel Dashboard** → Votre projet → **Settings**

#### A. General Settings
- **Root Directory**: `client` ✅
- **Framework Preset**: `Vite` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅

#### B. Desactiver la Protection
- **Settings** → **Deployment Protection**
- Verifiez que "Password Protection" est **OFF** ❌
- Verifiez que "Vercel Authentication" est **OFF** ❌

#### C. Variables d'Environnement
- **Settings** → **Environment Variables**
- Ajoutez : `VITE_API_URL` = `https://freelancing-app-mdgw.onrender.com`

### 2. Supprimer les Anciens Deployments

Si le probleme persiste :
1. **Deployments** → Trouvez le dernier deployment
2. Cliquez sur **"..."** → **Delete**
3. Cliquez sur **Redeploy** sur le deployment precedent

### 3. Recreer le Projet (Si Necessaire)

Si rien ne fonctionne :
1. **Settings** → **General** → Tout en bas
2. Cliquez sur **Delete Project**
3. Recreez un nouveau projet :
   - Import depuis GitHub : `Bechir-Lahoueg/Freelancing-App`
   - Root Directory : `client`
   - Framework : Vite
   - Environment Variable : `VITE_API_URL=https://freelancing-app-mdgw.onrender.com`

### 4. Verifier le Build en Local

Avant de deployer, testez localement :

```powershell
cd client
npm run build
npm run preview
```

Ouvrez : http://localhost:4173

Si ca fonctionne localement, le probleme vient de la config Vercel.

### 5. Configuration vercel.json Minimale

Le fichier `client/vercel.json` doit contenir :

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 6. Logs de Deployment

Pour voir les erreurs exactes :
1. Allez sur votre projet Vercel
2. Cliquez sur le dernier deployment
3. Ouvrez l'onglet **"Build Logs"**
4. Cherchez les erreurs en rouge

### 7. Verifier le Domaine

- URL Vercel : `https://votre-projet.vercel.app`
- Ne doit PAS demander de mot de passe
- Ne doit PAS rediriger vers une page de login Vercel

## Checklist Rapide

- [ ] Root Directory = `client`
- [ ] Framework = Vite
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Password Protection = OFF
- [ ] Vercel Authentication = OFF
- [ ] Variable VITE_API_URL ajoutee
- [ ] vercel.json existe avec rewrites
- [ ] Build local fonctionne

## Commandes Git

Apres toute modification :

```powershell
cd "c:\Users\BICHOU\Desktop\Do IT\do-it"
git add .
git commit -m "Fix Vercel config"
git push origin main
```

Vercel redeploiera automatiquement.

## Support

Si l'erreur persiste, partagez :
1. Les logs de build Vercel (screenshot)
2. Les parametres du projet (screenshot de Settings → General)
3. L'URL exacte de votre site
