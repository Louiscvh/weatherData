
# Projet de Visualisation de Données Météo en Temps Réel

## Introduction

Bienvenue dans le projet de visualisation de données météo en temps réel ! Cette application offre une expérience utilisateur immersive pour visualiser les données météo qui sont mises à jour toutes les 5 minutes. L'objectif principal est de démontrer l'utilisation efficace des technologies temps réel avec un grand volume de données.

## Technologies Utilisées

### Frontend

-   **React :** Bibliothèque JavaScript pour la construction de l'interface utilisateur.
-   **TypeScript (TS) :** Langage de programmation pour le développement frontend avec un typage statique.
-   **Shadcn :** Bibliothèque de composants UI.
-   **Zod :** Bibliothèque de validation de schémas TypeScript pour assurer la fiabilité des données.

### Backend

-   **Flask :** Framework web léger pour le développement backend en Python.
-   **WebSockets :** Protocole de communication bidirectionnelle pour la mise à jour en temps réel des données.
-   **JWT (JSON Web Token) :** Méthode d'authentification sécurisée pour les utilisateurs.
-   **Swagger :** Outil de documentation pour spécifier et décrire les API REST.

### Base de Données

-   **SQLite :** Système de gestion de base de données relationnelle intégré.

## Démarrer le Projet

### Frontend

1.  Naviguez vers le dossier `frontend`.
2.  Exécutez `pnpm install` pour installer les dépendances.
3.  Lancez l'application avec `pnpm run dev`.

### Backend

1.  Naviguez vers le dossier `backend`.
2.  Exécutez `python weather.py` pour démarrer le serveur backend.

## Points Forts du Projet

1.  **Clarté et Design :** L'interface utilisateur offre une expérience visuelle intuitive pour visualiser les données météo en temps réel.
2.  **Solidité avec Gros Lots de Données :** La robustesse du système est démontrée par sa capacité à gérer de gros volumes de données tout en maintenant des performances optimales.

## Axes d'Amélioration

1.  **Intégration d'une Queue Backend :** Pour gérer les données en cas d'influence sur la plateforme et assurer une meilleure résilience.
2.  **Déploiement en Microservices :** Segmenter le système en microservices pour une scalabilité et une maintenance plus efficaces.
