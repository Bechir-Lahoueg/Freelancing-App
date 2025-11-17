# 🤖 Configuration UptimeRobot pour Render

## Pourquoi UptimeRobot ?

Render met en veille les services gratuits après **15 minutes d'inactivité**. La première requête après la mise en veille peut prendre **30-60 secondes** ❄️

**Solution :** UptimeRobot envoie une requête toutes les 5 minutes pour garder le service actif ⚡

---

## 🎯 Endpoints Disponibles

Votre backend Render propose plusieurs endpoints de health check :

### 1. `/api/health/alive` ⚡ (RECOMMANDÉ pour UptimeRobot)
- **Le plus léger** - Répond simplement "OK"
- Consommation minimale de ressources
- Pas de vérification DB
- **URL :** `https://freelancing-app-mdgw.onrender.com/api/health/alive`

### 2. `/api/health/ping` 🏓
- Léger - Répond avec JSON minimal
- Pas de vérification DB
- **URL :** `https://freelancing-app-mdgw.onrender.com/api/health/ping`

### 3. `/api/health/status` 📊
- Vérifie la connexion MongoDB
- Retourne l'uptime
- **URL :** `https://freelancing-app-mdgw.onrender.com/api/health/status`

### 4. `/api/health/check` 📋
- Health check complet
- Vérifie DB, modèles, fichiers, stats
- **Plus lourd** - Ne pas utiliser pour UptimeRobot
- **URL :** `https://freelancing-app-mdgw.onrender.com/api/health/check`

---

## 🚀 Configuration UptimeRobot

### Étape 1 : Créer un Compte
1. Allez sur https://uptimerobot.com
2. Créez un compte gratuit (50 monitors inclus)

### Étape 2 : Ajouter un Monitor

1. **Cliquez sur "+ Add New Monitor"**

2. **Configurez le monitor :**

```
Monitor Type: HTTP(s)
Friendly Name: Do It Backend - Render
URL (or IP): https://freelancing-app-mdgw.onrender.com/api/health/alive
Monitoring Interval: 5 minutes (le minimum gratuit)
Monitor Timeout: 30 seconds
```

3. **Paramètres Avancés (optionnels) :**

```
HTTP Method: GET (default)
HTTP Auth Type: None
POST Value: (laisser vide)
Keyword: (laisser vide OU mettre "OK" si vous voulez)
Alert Contacts: Votre email
```

4. **Cliquez sur "Create Monitor"**

---

## ✅ Vérification

### Tester l'Endpoint Manuellement

```bash
# Test 1 - Endpoint le plus léger
curl https://freelancing-app-mdgw.onrender.com/api/health/alive

# Résultat attendu:
OK

# Test 2 - Avec JSON
curl https://freelancing-app-mdgw.onrender.com/api/health/ping

# Résultat attendu:
{
  "status": "OK",
  "message": "Pong!",
  "timestamp": "2025-11-17T..."
}

# Test 3 - Avec vérification DB
curl https://freelancing-app-mdgw.onrender.com/api/health/status

# Résultat attendu:
{
  "status": "OK",
  "db": "Connected",
  "uptime": 123
}
```

### Vérifier dans UptimeRobot

1. Allez dans votre dashboard UptimeRobot
2. Vérifiez que le monitor est **"Up"** (vert)
3. Regardez les logs pour confirmer que les pings fonctionnent
4. Le graphique devrait montrer 100% uptime

---

## 📊 Monitoring Recommandé

### Configuration Idéale (Gratuite)

```
Monitor 1: Backend API
URL: https://freelancing-app-mdgw.onrender.com/api/health/alive
Interval: 5 minutes
Purpose: Garder le backend actif

Monitor 2: Frontend
URL: https://your-app.vercel.app
Interval: 5 minutes
Purpose: Vérifier que le frontend est accessible
```

### Alertes Email

Configurez des alertes pour être notifié si :
- Le service ne répond pas (down)
- Le temps de réponse est trop long (> 30s)

---

## 💡 Avantages

✅ **Garde le service actif 24/7**
- Plus de délai de 30-60 secondes au réveil
- Expérience utilisateur fluide

✅ **Monitoring gratuit**
- UptimeRobot offre 50 monitors gratuits
- Idéal pour les projets personnels

✅ **Alertes automatiques**
- Email si le service tombe
- Historique d'uptime

✅ **Endpoint ultra-léger**
- Consommation minimale de ressources
- Pas d'impact sur les performances

---

## ⚠️ Notes Importantes

### 1. Render Free Tier
- Malgré UptimeRobot, Render a des limites :
  - 750 heures gratuites par mois
  - Avec UptimeRobot 24/7 ≈ 720 heures/mois ✅ (dans la limite)

### 2. Interval de 5 Minutes
- C'est le minimum pour la version gratuite UptimeRobot
- Suffisant pour éviter la mise en veille de Render (15 min)

### 3. Ne PAS Utiliser `/api/health/check`
- Trop lourd pour UptimeRobot
- Fait des requêtes DB inutiles toutes les 5 minutes
- Utilisez `/api/health/alive` ou `/api/health/ping`

---

## 🔧 Alternatives à UptimeRobot

Si vous voulez d'autres options :

### 1. **Cron-job.org**
- Gratuit, similaire à UptimeRobot
- https://cron-job.org

### 2. **Better Uptime**
- Plus de fonctionnalités
- https://betteruptime.com

### 3. **Pingdom** (Payant)
- Version gratuite limitée
- https://pingdom.com

### 4. **GitHub Actions** (DIY)
```yaml
# .github/workflows/keep-alive.yml
name: Keep Alive
on:
  schedule:
    - cron: '*/5 * * * *' # Toutes les 5 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://freelancing-app-mdgw.onrender.com/api/health/alive
```

---

## 📈 Statistiques Attendues

Avec UptimeRobot configuré :

```
Uptime: 99.9% 🟢
Average Response Time: < 500ms
Downtimes: Uniquement durant les déploiements
Cold Starts: 0 ❄️ → ⚡
```

Sans UptimeRobot :

```
Uptime: Variable
Average Response Time: 500ms - 60s (cold start)
Downtimes: Après 15 min d'inactivité
Cold Starts: Fréquents ❄️
```

---

## ✅ Checklist Configuration

- [ ] Compte UptimeRobot créé
- [ ] Monitor ajouté avec URL `/api/health/alive`
- [ ] Interval configuré sur 5 minutes
- [ ] Test manuel effectué (curl)
- [ ] Monitor apparaît comme "Up" dans le dashboard
- [ ] Email d'alerte configuré (optionnel)
- [ ] Attendre 1 heure et vérifier que le service reste actif

---

## 🎉 C'est Prêt !

Votre backend Render restera maintenant actif 24/7 grâce à UptimeRobot ! 

**Endpoints disponibles :**
- ⚡ Ultra-léger : `https://freelancing-app-mdgw.onrender.com/api/health/alive`
- 🏓 Léger JSON : `https://freelancing-app-mdgw.onrender.com/api/health/ping`
- 📊 Avec DB : `https://freelancing-app-mdgw.onrender.com/api/health/status`
- 📋 Complet : `https://freelancing-app-mdgw.onrender.com/api/health/check`

**Recommandation pour UptimeRobot :** Utilisez `/api/health/alive` 🚀
