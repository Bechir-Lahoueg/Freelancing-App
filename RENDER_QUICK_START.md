# 🚀 Déploiement Rapide sur Render

## Étapes Rapides

### 1️⃣ Créer le Service
- Allez sur https://render.com
- New + > Web Service
- Connectez `Bechir-Lahoueg/Freelancing-App`

### 2️⃣ Configuration
```
Name: do-it-backend
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 3️⃣ Variables d'Environnement (Copier-Coller)

Cliquez sur "Advanced" > "Add Environment Variable"

```
NODE_ENV
```
```
production
```

---

```
MONGODB_URI
```
```
mongodb+srv://espritApp:espritApp@espritapp.l5dvpao.mongodb.net/?retryWrites=true&w=majority&appName=EspritApp
```

---

```
JWT_SECRET
```
```
do_it_jwt_secret_key_2025_super_securise
```

---

```
SESSION_SECRET
```
```
do_it_session_secret_2025_tres_securise
```

---

```
CLIENT_URL
```
```
https://votre-app.vercel.app
```
⚠️ **CHANGEZ avec votre vraie URL Vercel !**

---

```
CLOUDINARY_CLOUD_NAME
```
```
dkjteg1q9
```

---

```
CLOUDINARY_API_KEY
```
```
326842291974583
```

---

```
CLOUDINARY_API_SECRET
```
```
QOqUSfjOV1GtVL0GqbuVs_Iv0uo
```

---

```
SUPER_ADMIN_EMAIL
```
```
bechirlahweg@gmail.com
```

---

```
SUPER_ADMIN_PASSWORD
```
```
bechirlahweg@gmail.com
```

---

```
SUPER_ADMIN_NAME
```
```
Super Admin
```

---

### 4️⃣ Déployer
Cliquez sur **"Create Web Service"**

### 5️⃣ MongoDB Atlas
- MongoDB Atlas > Network Access
- Add IP Address > Allow Access from Anywhere (0.0.0.0/0)

### 6️⃣ Récupérer l'URL
Après déploiement : `https://do-it-backend.onrender.com`

### 7️⃣ Mettre à Jour Vercel
Variable d'environnement dans Vercel :
```
VITE_API_URL=https://do-it-backend.onrender.com
```

### 8️⃣ Tester
```bash
curl https://do-it-backend.onrender.com/api/health
```

## ✅ Fait !
