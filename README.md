# Do IT - Plateforme de Freelancing

![Do IT Logo](https://img.shields.io/badge/Do%20IT-Freelancing%20Platform-orange?style=for-the-badge)

## 📋 Description

**Do IT** est une plateforme moderne de freelancing qui connecte les clients avec des prestataires de services qualifies. La plateforme offre une gestion complete des taches, un systeme de chat en temps reel avec support multimedia, des notifications instantanees, et un tableau de bord administrateur puissant.

## ✨ Fonctionnalites Principales

### Pour les Clients
- 📝 **Creation et gestion de taches** - Publiez vos besoins et recevez des propositions
- 💬 **Chat en temps reel** - Communiquez directement avec les prestataires
- 📎 **Partage multimedia** - Envoyez des images, videos, PDF et fichiers audio
- 😊 **Support des emojis** - Rendez vos conversations plus expressives
- 🔔 **Notifications instantanees** - Restez informe de toutes les activites
- 💰 **Gestion des factures** - Suivez vos paiements et transactions
- ⭐ **Systeme d'evaluation** - Notez et commentez les prestataires

### Pour les Prestataires
- 🤝 **Demandes de partenariat** - Rejoignez la plateforme avec votre CV
- 📊 **Tableau de bord personnalise** - Gerez vos taches et statistiques
- 💼 **Portfolio de services** - Presentez vos competences par categorie
- 📧 **Communication client** - Echangez avec vos clients en temps reel

### Pour les Administrateurs
- 👥 **Gestion des utilisateurs** - Administration complete des comptes
- 📂 **Gestion des categories** - Organisation des services
- 🔍 **Moderation des commentaires** - Controle de la qualite des avis
- 📈 **Statistiques detaillees** - Analyse des performances de la plateforme
- ✅ **Validation des partenaires** - Approbation des demandes avec CV
- 💬 **Chat administrateur** - Communication avec tous les utilisateurs

## 🛠️ Technologies Utilisees

### Backend
- **Node.js** & **Express.js** - Framework serveur
- **MongoDB** & **Mongoose** - Base de donnees NoSQL
- **Socket.IO** - Communication en temps reel
- **Passport.js** - Authentification (Local & Google OAuth)
- **Cloudinary** - Stockage et gestion des medias
- **Multer** - Upload de fichiers (limite 50MB pour chat, 10MB pour CV)
- **JWT** - Tokens de securite

### Frontend
- **React 18+** - Framework UI
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Axios** - Client HTTP
- **emoji-picker-react** - Selecteur d'emojis
- **React Router** - Navigation SPA

### Securite & Authentification
- **bcryptjs** - Hashage des mots de passe
- **JWT** - Authentification par tokens
- **Google OAuth 2.0** - Connexion via Google
- **CORS** - Protection des requetes cross-origin

## 📁 Structure du Projet

```
do-it/
├── client/                      # Application React
│   ├── src/
│   │   ├── components/          # Composants reutilisables
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── ...
│   │   ├── pages/               # Pages principales
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── ...
│   │   ├── context/             # Context API
│   │   │   └── AuthContext.jsx
│   │   └── hooks/               # Custom hooks
│   │       └── usePageLoading.js
│   └── package.json
│
├── server/                      # API Node.js/Express
│   ├── config/                  # Configuration
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── passport.js
│   ├── models/                  # Modeles Mongoose
│   │   ├── User.js
│   │   ├── TaskRequest.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── ...
│   ├── controllers/             # Logique metier
│   │   ├── userController.js
│   │   ├── taskController.js
│   │   ├── chatController.js
│   │   └── ...
│   ├── routes/                  # Routes API
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── chatRoutes.js
│   │   └── ...
│   ├── middleware/              # Middlewares
│   │   ├── auth.js
│   │   ├── roleAuth.js
│   │   └── errorHandler.js
│   ├── utils/                   # Utilitaires
│   │   ├── notificationHelper.js
│   │   └── tokenUtils.js
│   └── server.js                # Point d'entree
│
└── README.md
```

## 🚀 Installation et Demarrage

### Prerequis
- Node.js (v14 ou superieur)
- MongoDB (local ou Atlas)
- Compte Cloudinary (pour le stockage des medias)
- Compte Google Cloud (pour OAuth - optionnel)

### 1. Cloner le repository
```bash
git clone https://github.com/Bechir-Lahoueg/Freelancing-App.git
cd Freelancing-App
```

### 2. Configuration du Backend

```bash
cd server
npm install
```

Creez un fichier `.env` dans le dossier `server/` :

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# Session
SESSION_SECRET=your_session_secret
```

### 3. Configuration du Frontend

```bash
cd client
npm install
```

Creez un fichier `.env` dans le dossier `client/` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Lancer l'application

**Terminal 1 - Backend :**
```bash
cd server
npm start
```

**Terminal 2 - Frontend :**
```bash
cd client
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔑 Creation du Super Admin

Pour creer un compte super administrateur :

```bash
cd server
node utils/createSuperAdmin.js
```

Credentials par defaut :
- Email: `admin@doit.com`
- Mot de passe: `Admin123!`

⚠️ **Important** : Changez ces credentials en production !

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/google` - OAuth Google
- `POST /api/auth/logout` - Deconnexion

### Taches
- `GET /api/tasks` - Liste des taches
- `POST /api/tasks` - Creer une tache
- `PUT /api/tasks/:id` - Modifier une tache
- `DELETE /api/tasks/:id` - Supprimer une tache

### Chat
- `GET /api/chat/conversations` - Liste des conversations
- `POST /api/chat/conversations` - Creer une conversation
- `GET /api/chat/conversations/:id/messages` - Messages d'une conversation
- `POST /api/chat/conversations/:id/messages` - Envoyer un message
- `POST /api/chat/conversations/:id/upload` - Upload fichier (50MB max)

### Notifications
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu
- `PUT /api/notifications/read-all` - Tout marquer comme lu

### Categories
- `GET /api/categories` - Liste des categories
- `POST /api/categories` - Creer une categorie (Admin)
- `PUT /api/categories/:id` - Modifier une categorie (Admin)
- `DELETE /api/categories/:id` - Supprimer une categorie (Admin)

## 🔔 Systeme de Notifications

Les notifications sont automatiquement creees et envoyees en temps reel via Socket.IO pour :
- ✉️ Nouveaux messages dans le chat
- 📝 Nouvelles taches creees
- ✏️ Modifications de taches
- ✅ Taches completees
- 🤝 Demandes de partenariat
- 💼 Approbation/rejet de partenariat
- 💰 Factures creees/payees
- 💬 Nouveaux commentaires

**Auto-suppression** : Les notifications sont automatiquement supprimees apres 10 minutes grace a un index TTL MongoDB.

## 💬 Systeme de Chat

### Types de Messages Supportes
- 📝 Texte simple
- 😊 Emojis (via emoji-picker-react)
- 🖼️ Images (JPG, PNG, GIF, WebP)
- 🎥 Videos (MP4, AVI, MOV)
- 🎵 Audio (MP3, WAV, M4A)
- 📄 PDF
- 📎 Fichiers divers (DOC, DOCX, etc.)

### Stockage Cloudinary
Tous les fichiers sont stockes dans le dossier `do-it/chat` avec detection automatique du type :
- Images → `resource_type: image`
- Videos → `resource_type: video`
- Autres → `resource_type: raw`

## 🎨 Fonctionnalites Speciales

### Gestion des Partenaires
- Upload de CV (PDF uniquement, 10MB max)
- Stockage dans `do-it/categories` sur Cloudinary
- Visualisation PDF integree dans l'admin
- Boutons mailto automatiques pour contact

### Authentification Intelligente
- Les boutons "Commencer" et "Se connecter" disparaissent pour les utilisateurs authentifies
- Redirection automatique selon le role (admin → admin dashboard, user → dashboard)

### Animations Fluides
- Transitions page avec Framer Motion
- Animations de notification (pulse, fade, scale)
- Effets hover et tap sur les boutons

## 🛡️ Securite

- ✅ Hashage des mots de passe (bcrypt)
- ✅ Tokens JWT avec expiration
- ✅ Protection CORS configuree
- ✅ Validation des donnees cote serveur
- ✅ Middleware d'authentification et d'autorisation
- ✅ Limitation de taille des fichiers
- ✅ Validation des types MIME

## 📦 Scripts Disponibles

### Backend
```bash
npm start          # Demarre le serveur (port 5000)
npm run dev        # Mode developpement avec nodemon
```

### Frontend
```bash
npm run dev        # Serveur de developpement Vite (port 5173)
npm run build      # Build de production
npm run preview    # Previsualisation du build
```

## 🌐 Deploiement

### Backend (Render, Heroku, Railway)
1. Configurez les variables d'environnement
2. Assurez-vous que MongoDB est accessible
3. Configurez Cloudinary
4. Deployez avec `npm start`

### Frontend (Vercel, Netlify)
1. Build avec `npm run build`
2. Configurez les variables d'environnement
3. Pointez vers votre API backend
4. Deployez le dossier `dist/`

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Creez une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de details.

## 👨‍💻 Auteur

**Bechir Lahoueg**
- GitHub: [@Bechir-Lahoueg](https://github.com/Bechir-Lahoueg)

## 📞 Support

Pour toute question ou probleme :
- Ouvrez une issue sur GitHub
- Contactez-nous via la plateforme

## 🙏 Remerciements

- React & Vite pour l'experience de developpement incroyable
- Socket.IO pour la communication temps reel
- Cloudinary pour la gestion des medias
- MongoDB pour la base de donnees flexible
- Tailwind CSS pour le design rapide et elegant

---

**Do IT** - *Transformez vos idees en realite* 🚀
