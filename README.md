# Ma Liste de Courses — PWA React + Supabase

Application mobile PWA de liste de courses partagée en temps réel, avec design moderne, suggestions intelligentes et génération de recettes par IA.

## Fonctionnalités

### Listes & partage
- Authentification email / mot de passe (Supabase Auth)
- Création de listes multiples
- Partage en temps réel entre plusieurs comptes via un **code d'invitation à 6 chiffres**
- Synchronisation instantanée (Supabase Realtime)
- Mises à jour optimistes : l'UI réagit sans attendre le serveur

### Articles
- Ajout / cochage / suppression avec optimistic updates
- **Catégories automatiques** (Fruits, Légumes, Épicerie, Boulangerie, Laitier, Viande/Poisson, Surgelés, Boissons, Hygiène, Entretien, Autre) — regroupées visuellement
- **Emojis spécifiques par produit** (une baguette 🥖, un navet 🥔, un colin 🐟, du saumon 🐟…) — plus de 250 produits mappés
- Notes par article (appui long)
- Quantités + unités (g, kg, ml, L, unité, boîte, paquet, pack, c. à s., c. à c.)

### Productivité
- **⭐ Mes produits fréquents** : les articles achetés régulièrement remontent automatiquement via un historique. Possibilité d'en épingler en favoris.
- **📋 Modèles de listes** : sauvegarder une liste comme modèle et en recréer plusieurs exemplaires
- **🍳 Génération par recette** : catalogue de recettes françaises + **génération par IA** (Claude Sonnet 4.6 via Supabase Edge Function)
- Autocomplete basé sur l'historique utilisateur

### UI / UX
- Design moderne avec dégradé vibrant **indigo → violet → fuchsia**
- Modales custom (confirm / toasts) — pas de `window.confirm` natif
- Boutons arrondis, ombres colorées, animations subtiles
- **Optimisé iPhone** : safe-area-inset pour le notch / Dynamic Island, mode PWA standalone plein écran
- Installable comme PWA (Android + iOS)

## Stack technique

- **Front** : React 18 + Vite + React Router v6
- **Styling** : Tailwind CSS avec palette custom (brand emerald + accent fuchsia)
- **Backend** : Supabase (Auth, Postgres, Realtime, RLS, Edge Functions)
- **IA** : Anthropic Claude Sonnet 4.6 (via Edge Function Deno)
- **PWA** : vite-plugin-pwa (service worker, manifest)
- **Offline** : Dexie.js (IndexedDB)

## Installation

### 1. Dépendances

```bash
npm install
```

### 2. Projet Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Dans `Settings > API`, récupérer `URL` et `anon public`
3. Copier dans `.env` :

```bash
cp .env.example .env
```

### 3. Migrations SQL

Dans le `SQL Editor` de Supabase, exécuter dans l'ordre les fichiers de `supabase/migrations/` :

| Fichier | Contenu |
|---------|---------|
| `01_schema_initial.sql` | Tables `lists`, `list_members`, `items` + RLS |
| `02_categories.sql` | Colonne catégorie sur les items |
| `03_items_unit_note.sql` | Colonnes `unit` et `note` |
| `04_item_history.sql` | Historique des produits par utilisateur |
| `05_list_templates.sql` | Modèles de listes |
| `06_fix_lists_select_policy.sql` | Correctif RLS pour INSERT...RETURNING |
| `07_numeric_invite_codes.sql` | Codes d'invitation à 6 chiffres |
| `08_favorite_items.sql` | Flag `is_favorite` sur l'historique |

### 4. Edge Function IA (optionnel)

Pour activer la génération de recettes par IA :

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
supabase functions deploy generate-recipe --no-verify-jwt
```

Ou via le dashboard : **Edge Functions > Create Function > generate-recipe**, coller le contenu de `supabase/functions/generate-recipe/index.ts`, puis décocher "Verify JWT" dans Settings.

### 5. Lancer l'app

```bash
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173). Pour tester sur mobile, utiliser l'IP locale affichée (ex: `http://192.168.1.x:5173`).

## Build de production

```bash
npm run build
npm run preview
```

## Installer la PWA

- **Android (Chrome)** : menu `⋮` → "Installer l'application"
- **iOS (Safari)** : bouton Partager → "Sur l'écran d'accueil"

En mode PWA iOS, l'app s'ouvre en plein écran avec le dégradé qui remplit toute la zone sous l'encoche/Dynamic Island.

## Structure du projet

```
src/
  components/
    items/
      AddItemForm.jsx         Formulaire d'ajout (bas de liste)
      ItemRow.jsx             Ligne d'article (check, note, suppression)
      FrequentItemsModal.jsx  Modal ⭐ Mes produits fréquents + favoris
    recipes/
      RecipePicker.jsx        Modal de sélection / génération IA de recette
    ui/
      DialogProvider.jsx      Confirm + toasts custom (contexte global)
      ShareDialog.jsx         Modal de partage avec code 6 chiffres
  hooks/
    useAuth.js                Session Supabase
    useRealtimeList.js        Subscription temps réel aux items
    useOnlineStatus.js        Détection online/offline
  lib/
    supabase.js               Client Supabase
    categories.js             Catégories + détection automatique
    itemEmojis.js             Mapping produit → emoji spécifique
    units.js                  Formatage quantités / unités
    history.js                Historique & favoris produits
    recipes.js                Logique recettes (catalogue + IA)
    db.js                     IndexedDB offline (Dexie)
  pages/
    Login.jsx                 Connexion / inscription / reset password
    Lists.jsx                 Accueil : mes listes
    ListDetail.jsx            Détail d'une liste
    Templates.jsx             Mes modèles
  App.jsx                     Routage + providers
  main.jsx                    Entry point
  index.css                   Theme Tailwind + design tokens
supabase/
  migrations/                 Scripts SQL versionnés (voir tableau ci-dessus)
  functions/
    generate-recipe/          Edge Function Deno pour l'IA
```

## Notes

### Icônes PWA

Le projet référence `public/pwa-192x192.png` et `public/pwa-512x512.png`. À générer à partir du logo et placer dans `public/`. Outil utile : [realfavicongenerator.net](https://realfavicongenerator.net).

### Couleurs du design

Le dégradé principal est défini dans `src/index.css` :
```css
background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%);
```

Pour changer l'ambiance, éditer cette ligne et le `theme-color` dans `index.html`.

## Licence

MIT
