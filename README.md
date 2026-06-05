# Saytu Edu

Projet PFE - Plateforme éducative avec Laravel (Backend) et React (Frontend).

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [PHP](https://www.php.net/downloads.php) (>= 8.2)
- [Composer](https://getcomposer.org/)
- [Node.js & npm](https://nodejs.org/)
- [MySQL](https://www.mysql.com/) ou un serveur équivalent (XAMPP, WAMP, etc.)

## Installation

### 1. Clonage du projet
```bash
git clone <url-du-depot>
cd PFE_Saytu_Edu
```

### 2. Installation des dépendances de la racine
```bash
npm install
```

### 3. Configuration du Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
*Note : Configurez votre base de données dans le fichier `.env` (DB_DATABASE, DB_USERNAME, DB_PASSWORD).*

Ensuite, créez la base de données (si elle n'existe pas déjà) et lancez les migrations :
```bash
php artisan migrate
```

### 4. Configuration du Frontend (React)
```bash
cd ../frontend
npm install
```

## Lancement du projet

Pour lancer simultanément le serveur d'API Laravel et le serveur de développement React, retournez à la racine du projet et exécutez :

```bash
cd ..
npm start
```

Le serveur Laravel sera disponible sur [http://localhost:8000](http://localhost:8000) et le frontend React sur [http://localhost:5173](http://localhost:5173) (ou le port indiqué par Vite).
