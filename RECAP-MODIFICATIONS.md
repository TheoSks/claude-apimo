# Récapitulatif des modifications — Site E&B Immo

_Branche : `claude/bold-hawking-cgicpi` — mis à jour le 21/06/2026_

Toutes les modifications ci-dessous sont **en ligne** (poussées sur la branche).

---

## ✅ Modifications réalisées

### Page d'accueil & général
- **Titre du hero** → « Agence de la côte fleurie et alentours »
- **Fond du hero** → photo **drone** (optimisée 5,5 Mo → 234 Ko), avec léger voile blanc pour la lisibilité du titre
- **Image en haut à droite du hero** → **Château de Beuzeval**
- **« Depuis 2017 »** partout (au lieu de « 7 ans ») — section À propos + FAQ
- **Logo** → remplacé par le vrai logo E&B en local (l'ancien, hébergé sur ebimmo.com, ne s'affichait plus) — header + footer
- **Nouvelles annonces** → triées par **vraie date de mise en ligne** (`created_at` Apimo), les plus récentes en tête
- **Section « Explorer tout »** → photo de l'**intérieur de l'agence** (photo du bas)
- **Section « Acheter ou louer »** → photo de la **maison avec piscine**
- **Image de partage social (réseaux)** → photo drone (au lieu de l'ancienne maison)

### Coordonnées & contact
- **Adresse** → **3 place du Commerce, 14860 Bavent** (footer + page Contact)
- **Carte Google Maps** de géolocalisation de l'agence (page Contact)
- **Honoraires** → lien + **PDF du barème 2026** ajoutés dans le footer
- **Lien Instagram** corrigé → instagram.com/ebimmobilier

### Équipe
- **Arthur Guesdon** ajouté (06 81 45 56 22 / a.guesdon@eb-immo.fr) + photo
- **Adeline Petric** ajoutée (06 76 09 79 11 / a.petric@eb-immo.fr) + photo
- Avatar à initiales en repli si une photo venait à manquer

### Annonces / Propriétés
- **Bug 404 « estimation »** (depuis Google) corrigé → `/estimation` est désormais une vraie page
- **Onglets Tous / Nouveautés / Vendus** avec compteurs, sur la page Propriétés
  - Nouveautés = biens mis en ligne il y a moins de **60 jours**
  - Vendus = biens dont le statut Apimo n'est plus « disponible » (se remplit automatiquement)
- **Badges** « Nouveauté » / « Vendu » sur les cartes
- **Alignement** des blocs Informations & Réglementation corrigé
- **Adresse exacte masquée** : la carte d'un bien affiche le **secteur/commune** (et non le point GPS précis) → compatible diffusion HOMEO sans dévoiler l'adresse
- **Correctif d'affichage** : les biens saisis « Parking » à prix élevé dans Apimo sont ré-étiquetés **« Local commercial »** côté site
- Textes anglais résiduels passés en français (Localisation, Ouvrir dans Maps, Envoyer un email)

### Intégration Immodvisor
- Composant d'affichage des avis **codé et prêt** (section « Avis clients »)
- **En pause** : il faut coller le code widget depuis l'Espace Client immodvisor dans la constante `IMMODVISOR_SNIPPET` (fichier `app/eb-immo.js`) pour l'activer

---

## ⏳ En attente (non bloquant)

| Élément | Ce qu'il faut | Qui |
|---|---|---|
| Avis Immodvisor | Code widget (Espace Client immodvisor → Widgets) | Emeline / Benjamin |
| Explorer tout | Photo « 2 personnes de l'équipe » (l'intérieur est déjà en place) | — |
| Onglet Vendus | Passer des biens en statut « vendu » dans Apimo en les laissant diffusés | Apimo |
| 5 biens « Parking » | Correction propre du type dans Apimo (contourné côté site en attendant) | Apimo |

---

## ℹ️ Notes techniques
- Les images sont récupérées via Google Drive, optimisées (sharp) puis stockées dans `/public`.
- Le seuil « Nouveautés » (60 j) est réglable en une ligne : constante `NEW_DAYS` dans `app/eb-immo.js`.
- Les données des annonces proviennent du flux Apimo : prix, surfaces, communes et réglementations erronés doivent être corrigés **dans Apimo** (le site reflète fidèlement la source).
