# Guide de Dépannage - Problèmes de Login Résolus

## Problèmes Identifiés et Corrigés

### 1. **Mismatch dans les tokens JWT** ❌ → ✅
**Problème**: Le payload du token utilisait `userId` mais le middleware auth cherchait `id`

**Solution**: 
- Modifié `tokenUtils.js` pour utiliser `{ id: userId, role }` au lieu de `{ userId, role }`
- Cela assure la cohérence avec le middleware d'authentification

### 2. **Gestion d'erreurs insuffisante** ❌ → ✅
**Problème**: Le contrôleur login ne différenciait pas les types d'erreurs

**Solution**:
- Amélioré les vérifications dans `userController.js`
- Ajouté des messages d'erreur plus spécifiques
- Vérification du type d'authentification (local vs OAuth)

### 3. **Token non persisté correctement** ❌ → ✅
**Problème**: Le token n'était pas sauvegardé dans localStorage lors du login

**Solution**:
- Modifié `AuthContext.jsx` pour sauvegarder le token lors du login/register
- Ajouté les logs de débogage pour suivre le processus

### 4. **Middleware auth trop strict** ❌ → ✅
**Problème**: Le middleware retournait une erreur même quand le token était absent

**Solution**:
- Restructuré la logique du middleware `auth.js`
- Meilleure gestion des erreurs TokenExpiredError
- Messages d'erreur plus explicites

### 5. **Logs insuffisants** ❌ → ✅
**Problème**: Difficile de debugger sans logs détaillés

**Solution**:
- Ajouté des `console.log()` dans le Login et AuthContext
- Permet de suivre le flux d'authentification en temps réel

## Comment Tester le Login Maintenant

### 1. **Démarrer le serveur**
```bash
cd server
npm install  # si nécessaire
npm start
```

### 2. **Démarrer le client**
```bash
cd client
npm install  # si nécessaire
npm run dev
```

### 3. **Créer un compte (Register)**
- Allez sur `/register`
- Remplissez le formulaire avec:
  - Nom: Votre Nom
  - Email: test@example.com
  - Mot de passe: password123 (min 6 caractères)
  - Année universitaire: L1

### 4. **Se connecter (Login)**
- Allez sur `/login`
- Utilisez les mêmes identifiants
- Vous devriez être redirigé vers `/dashboard`

### 5. **Vérifier les Logs**
- Ouvrez la console du navigateur (F12)
- Ouvrez la console du serveur (terminal)
- Vous verrez des logs `✅` ou `❌` indiquant le succès/échec

## Variables d'Environnement

Assurez-vous que le fichier `server/.env` contient:
```
JWT_SECRET=mousaada_jwt_secret_key_2025_super_securise
MONGODB_URI=mongodb+srv://espritApp:espritApp@espritapp.l5dvpao.mongodb.net/...
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Fichiers Modifiés

1. ✅ `server/utils/tokenUtils.js` - Fix token payload
2. ✅ `server/controllers/userController.js` - Better error handling
3. ✅ `server/middleware/auth.js` - Improved middleware
4. ✅ `client/src/context/AuthContext.jsx` - Token persistence
5. ✅ `client/src/pages/Login.jsx` - Better error display & logs

## Prochaines Étapes

Si tu rencontres toujours des problèmes:
1. Vérifie les logs dans la console du navigateur
2. Vérifie les logs dans le terminal du serveur
3. Assure-toi que MongoDB est accessible
4. Teste le endpoint directement avec Postman/Insomnia
