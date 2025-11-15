# Do IT - Plateforme de Freelancing

![Do IT Logo](https://img.shields.io/badge/Do%20IT-Freelancing%20Platform-orange?style=for-the-badge)

## 📋 Description

**Do IT** est une plateforme moderne de freelancing qui connecte les clients avec des prestataires de services qualifiés. La plateforme offre une gestion complète des tâches, un système de chat en temps réel avec support multimédia, des notifications instantanées, et un tableau de bord administrateur puissant.

## ✨ Fonctionnalités Principales

### Pour les Clients
- 📝 **Création et gestion de tâches** - Publiez vos besoins et recevez des propositions
- 💬 **Chat en temps réel** - Communiquez directement avec les prestataires
- 📎 **Partage multimédia** - Envoyez des images, vidéos, PDF et fichiers audio
- 😊 **Support des emojis** - Rendez vos conversations plus expressives
- 🔔 **Notifications instantanées** - Restez informé de toutes les activités
- 💰 **Gestion des factures** - Suivez vos paiements et transactions
- ⭐ **Système d'évaluation** - Notez et commentez les prestataires

### Pour les Prestataires
- 🤝 **Demandes de partenariat** - Rejoignez la plateforme avec votre CV
- 📊 **Tableau de bord personnalisé** - Gérez vos tâches et statistiques
- 💼 **Portfolio de services** - Présentez vos compétences par catégorie
- 📧 **Communication client** - Échangez avec vos clients en temps réel

### Pour les Administrateurs
- 👥 **Gestion des utilisateurs** - Administration complète des comptes
- 📂 **Gestion des catégories** - Organisation des services
- 🔍 **Modération des commentaires** - Contrôle de la qualité des avis
- 📈 **Statistiques détaillées** - Analyse des performances de la plateforme
- ✅ **Validation des partenaires** - Approbation des demandes avec CV
- 💬 **Chat administrateur** - Communication avec tous les utilisateurs

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** & **Express.js** - Framework serveur
- **MongoDB** & **Mongoose** - Base de données NoSQL
- **Socket.IO** - Communication en temps réel
- **Passport.js** - Authentification (Local & Google OAuth)
- **Cloudinary** - Stockage et gestion des médias
- **Multer** - Upload de fichiers (limite 50MB pour chat, 10MB pour CV)
- **JWT** - Tokens de sécurité

### Frontend
- **React 18+** - Framework UI
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Axios** - Client HTTP
- **emoji-picker-react** - Sélecteur d'emojis
- **React Router** - Navigation SPA

### Sécurité & Authentification
- **bcryptjs** - Hashage des mots de passe
- **JWT** - Authentification par tokens
- **Google OAuth 2.0** - Connexion via Google
- **CORS** - Protection des requêtes cross-origin

## 📁 Structure du Projet

```
do-it/
├── client/                      # Application React
│   ├── src/
│   │   ├── components/          # Composants réutilisables
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
│   ├── models/                  # Modèles Mongoose
│   │   ├── User.js
│   │   ├── TaskRequest.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── ...
│   ├── controllers/             # Logique métier
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
│   └── server.js                # Point d'entrée
│
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)
- Compte Cloudinary (pour le stockage des médias)
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

Créez un fichier `.env` dans le dossier `server/` :

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

Créez un fichier `.env` dans le dossier `client/` :

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

## 🔑 Création du Super Admin

Pour créer un compte super administrateur :

```bash
cd server
node utils/createSuperAdmin.js
```

Credentials par défaut :
- Email: `admin@doit.com`
- Mot de passe: `Admin123!`

⚠️ **Important** : Changez ces credentials en production !

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/google` - OAuth Google
- `POST /api/auth/logout` - Déconnexion

### Tâches
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Chat
- `GET /api/chat/conversations` - Liste des conversations
- `POST /api/chat/conversations` - Créer une conversation
- `GET /api/chat/conversations/:id/messages` - Messages d'une conversation
- `POST /api/chat/conversations/:id/messages` - Envoyer un message
- `POST /api/chat/conversations/:id/upload` - Upload fichier (50MB max)

### Notifications
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu
- `PUT /api/notifications/read-all` - Tout marquer comme lu

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie (Admin)
- `PUT /api/categories/:id` - Modifier une catégorie (Admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (Admin)

## 🔔 Système de Notifications

Les notifications sont automatiquement créées et envoyées en temps réel via Socket.IO pour :
- ✉️ Nouveaux messages dans le chat
- 📝 Nouvelles tâches créées
- ✏️ Modifications de tâches
- ✅ Tâches complétées
- 🤝 Demandes de partenariat
- 💼 Approbation/rejet de partenariat
- 💰 Factures créées/payées
- 💬 Nouveaux commentaires

**Auto-suppression** : Les notifications sont automatiquement supprimées après 10 minutes grâce à un index TTL MongoDB.

## 💬 Système de Chat

### Types de Messages Supportés
- 📝 Texte simple
- 😊 Emojis (via emoji-picker-react)
- 🖼️ Images (JPG, PNG, GIF, WebP)
- 🎥 Vidéos (MP4, AVI, MOV)
- 🎵 Audio (MP3, WAV, M4A)
- 📄 PDF
- 📎 Fichiers divers (DOC, DOCX, etc.)

### Stockage Cloudinary
Tous les fichiers sont stockés dans le dossier `do-it/chat` avec détection automatique du type :
- Images → `resource_type: image`
- Vidéos → `resource_type: video`
- Autres → `resource_type: raw`

## 🎨 Fonctionnalités Spéciales

### Gestion des Partenaires
- Upload de CV (PDF uniquement, 10MB max)
- Stockage dans `do-it/categories` sur Cloudinary
- Visualisation PDF intégrée dans l'admin
- Boutons mailto automatiques pour contact

### Authentification Intelligente
- Les boutons "Commencer" et "Se connecter" disparaissent pour les utilisateurs authentifiés
- Redirection automatique selon le rôle (admin → admin dashboard, user → dashboard)

### Animations Fluides
- Transitions page avec Framer Motion
- Animations de notification (pulse, fade, scale)
- Effets hover et tap sur les boutons

## 🛡️ Sécurité

- ✅ Hashage des mots de passe (bcrypt)
- ✅ Tokens JWT avec expiration
- ✅ Protection CORS configurée
- ✅ Validation des données côté serveur
- ✅ Middleware d'authentification et d'autorisation
- ✅ Limitation de taille des fichiers
- ✅ Validation des types MIME

## 📦 Scripts Disponibles

### Backend
```bash
npm start          # Démarre le serveur (port 5000)
npm run dev        # Mode développement avec nodemon
```

### Frontend
```bash
npm run dev        # Serveur de développement Vite (port 5173)
npm run build      # Build de production
npm run preview    # Prévisualisation du build
```

## 🌐 Déploiement

### Backend (Render, Heroku, Railway)
1. Configurez les variables d'environnement
2. Assurez-vous que MongoDB est accessible
3. Configurez Cloudinary
4. Déployez avec `npm start`

### Frontend (Vercel, Netlify)
1. Build avec `npm run build`
2. Configurez les variables d'environnement
3. Pointez vers votre API backend
4. Déployez le dossier `dist/`

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Bechir Lahoueg**
- GitHub: [@Bechir-Lahoueg](https://github.com/Bechir-Lahoueg)

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez-nous via la plateforme

## 🙏 Remerciements

- React & Vite pour l'expérience de développement incroyable
- Socket.IO pour la communication temps réel
- Cloudinary pour la gestion des médias
- MongoDB pour la base de données flexible
- Tailwind CSS pour le design rapide et élégant

---

**Do IT** - *Transformez vos idées en réalité* 🚀
