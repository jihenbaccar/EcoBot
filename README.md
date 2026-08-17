# EcoBot

EcoBot est une plateforme web de supervision de sacs à dos aspirateurs IoT pour la collecte des déchets urbains. Elle comprend :

- un frontend React + Vite pour l'interface utilisateur,
- un backend Node.js/Express pour l'API métier,
- PostgreSQL + Prisma pour la persistance des données.

## Objectif

EcoBot permet de :

- superviser les sacs connectés en temps réel,
- suivre l’état des équipements (batterie, température, autonomie),
- gérer les missions de collecte,
- suivre les agents et les performances,
- générer des rapports d’activité,
- fournir des vues d’administration et d’agent.

## Stack technique

- Frontend : React, Vite, CSS personnalisé, lucide-react
- Backend : Node.js, Express
- Base de données : PostgreSQL
- ORM : Prisma
- Authentification : JWT + bcrypt
- API client side : fetch (sans Axios)
- Navigation : état React local (sans react-router-dom)

## Prérequis

Avant de démarrer le projet, vérifiez que vous avez installé :

- Node.js 20+
- npm 10+
- PostgreSQL 14+
- Git

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/jihenbaccar/EcoBot.git
cd EcoBot
```

### 2. Installer les dépendances du backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances du frontend

```bash
cd ../frontend
npm install
```

## Configuration de l’environnement

### Backend

Créez un fichier `.env` dans le dossier `backend` avec un contenu du type :

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecobot"
JWT_SECRET="votre_cle_secrete"
```

### Frontend

Créez un fichier `.env` dans le dossier `frontend` si nécessaire :

```env
VITE_API_URL=http://localhost:5000
```

## Base de données

Depuis le dossier `backend` :

```bash
npx prisma generate
npx prisma db push
```

Ou pour les migrations :

```bash
npx prisma migrate dev --name init
```

Puis, si un seed est disponible :

```bash
npm run seed
```

## Démarrage

### Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur le port configuré dans `.env` (par défaut `5000`).

### Frontend

```bash
cd frontend
npm run dev
```

Le frontend est accessible par défaut sur :

```text
http://localhost:5173
```

## Scripts utiles

### Backend

```bash
npm run dev
npm run start
npm run seed
npx prisma studio
npx prisma migrate dev
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Structure du projet

```text
EcoBot/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── ...
├── README.md
└── .gitignore
```

## Déploiement

À adapter selon votre hébergeur. Les étapes typiques sont :

1. déployer le backend sur un serveur Node.js,
2. déployer le frontend sur Vercel, Netlify ou un serveur statique,
3. configurer PostgreSQL en production,
4. mettre à jour `DATABASE_URL` et `VITE_API_URL`.

## Sécurité

- Ne committez jamais les fichiers `.env` contenant des secrets,
- utilisez des mots de passe forts,
- sécurisez les tokens JWT,
- limitez les accès API selon les rôles utilisateur.

## Licence

Projet interne / éducatif. À adapter selon votre usage.

## Contribution

1. Créer une branche :
   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   ```
2. Effectuer les modifications,
3. Valider :
   ```bash
   git add .
   git commit -m "Ajout de la fonctionnalité"
   ```
4. Pousser :
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```
