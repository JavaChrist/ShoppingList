# Prompt V2 — Ma Liste de Courses

Copie/colle ce prompt dans une nouvelle conversation Claude pour démarrer la v2.
Il contient tout le contexte nécessaire : stack, structure existante, objectifs et critères d'acceptation.

---

## PROMPT À UTILISER

```
Je travaille sur une PWA de liste de courses partagée en temps réel, déjà opérationnelle en v1.
Je veux maintenant implémenter la v2.

## Stack existante

- React 18 + Vite
- Tailwind CSS (couleurs personnalisées: brand-* basé sur emerald)
- Supabase (Auth, Postgres, Realtime, RLS)
- React Router v6 (avec future flags v7_startTransition et v7_relativeSplatPath)
- Dexie.js (IndexedDB) pour l'offline
- vite-plugin-pwa (service worker + manifest)

## Structure actuelle du projet

```
src/
  components/
    items/
      AddItemForm.jsx   → Formulaire d'ajout (name + quantity)
      ItemRow.jsx       → Ligne d'article (checkbox + nom + quantité + suppression)
  hooks/
    useAuth.js          → signIn, signUp, signOut, resetPassword
    useRealtimeList.js  → Subscription realtime aux items d'une liste
    useOnlineStatus.js  → Détection online/offline
  lib/
    supabase.js         → Client Supabase
    db.js               → Dexie (tables: lists, items, pendingActions)
  pages/
    Login.jsx           → Connexion + inscription + reset password (avec show/hide)
    Lists.jsx           → CRUD listes + rejoindre via code d'invitation
    ListDetail.jsx      → Détail de liste + ajout/check/suppression items
  App.jsx               → Routage + bandeau offline
  main.jsx
supabase/
  schema.sql            → Tables lists, list_members, items + RLS + triggers
```

## Schéma actuel (Supabase)

- `lists(id, name, owner_id, invite_code, created_at)`
- `list_members(list_id, user_id, role, joined_at)` → roles: owner/editor/viewer
- `items(id, list_id, name, quantity, category, checked, added_by, created_at, updated_at)`
- Trigger `add_owner_to_members` : ajoute auto le créateur comme owner
- Trigger `update_updated_at` : met à jour le timestamp
- Fonction RPC `join_list_by_code(code)` : rejoint une liste via code
- Realtime activé sur les 3 tables
- RLS actif sur toutes les tables

## Objectifs v2 (par priorité)

### 1. Catégorisation automatique des articles
- Table `categories` (id, name, emoji, color, sort_order)
- Seed avec : Fruits 🍎, Légumes 🥕, Épicerie 🥫, Boulangerie 🥖, Produits laitiers 🥛,
  Viande/Poisson 🥩, Surgelés ❄️, Boissons 🍷, Hygiène 🧴, Entretien 🧽, Autre 📦
- Fonction de détection automatique côté client (dictionnaire mots-clés français)
  qui pré-remplit la catégorie à l'ajout
- Affichage des items groupés par catégorie dans ListDetail (sections repliables)
- Possibilité de changer manuellement la catégorie d'un item

### 2. Suggestions d'articles fréquents
- Nouvelle table `item_history(user_id, name, category, use_count, last_used_at)`
  OU vue matérialisée basée sur les items existants de l'utilisateur
- Dans AddItemForm : autocomplete qui suggère les 5 articles les plus utilisés
  matchant la saisie
- Incrémenter `use_count` à chaque ajout

### 3. Quantités avec unités
- Ajouter colonne `unit text` à la table items
- Parser intelligent côté client : "2 kg farine" → name="farine", quantity=2, unit="kg"
- Unités supportées : unité (par défaut), kg, g, L, ml, paquet, boîte, pack
- Affichage formaté dans ItemRow : "2 kg · Farine"

### 4. Notes par article
- Ajouter colonne `note text` à items
- Modal ou expand en tap long sur un item pour éditer la note
- Icône discrète sur ItemRow si une note existe

### 5. Notifications push (web push)
- Table `push_subscriptions(user_id, endpoint, keys, created_at)`
- Edge Function Supabase déclenchée sur INSERT items → envoie push à tous
  les membres de la liste (sauf l'ajouteur)
- Clé VAPID à générer, stockée dans secrets Supabase
- Composant React demande la permission à l'utilisateur
- Service worker gère `push` et `notificationclick`

### 6. Scan de code-barres (OpenFoodFacts)
- Bouton 📷 dans AddItemForm
- Utiliser `html5-qrcode` ou `@zxing/browser`
- Sur scan, requête à `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Pré-remplir name + category si détecté

### 7. Templates de listes récurrentes
- Page "Templates" accessible depuis Lists
- Table `list_templates(id, user_id, name, items jsonb)`
- Bouton "Sauvegarder comme template" sur une liste
- Bouton "Créer depuis template" lors de la création d'une liste

## Contraintes

- Tout le code en React + Tailwind, pas d'autres libs UI
- Mobile-first, tap targets d'au moins 44px
- Support offline conservé (étendre pendingActions pour les nouvelles mutations)
- RLS policies cohérentes avec les nouvelles tables
- Français pour les textes UI, anglais pour le code/commentaires

## Méthode attendue

1. Avant de coder : propose un plan d'implémentation priorisé (ordre + dépendances).
2. Demande-moi quelle(s) fonctionnalité(s) tu dois traiter en priorité.
3. Pour chaque feature :
   - Fournir le SQL (migration additive, ne pas casser l'existant)
   - Fournir les composants React + hooks nécessaires
   - Fournir les instructions de test (que dois-je vérifier ?)
4. Me demander validation entre chaque feature avant de passer à la suivante.

## Critères d'acceptation globaux

- Aucune régression sur la v1 (auth, partage, realtime, offline)
- Les policies RLS doivent rester étanches (un user ne voit que ses listes)
- Tout nouveau composant est testable sans compte réel (fallback UI si Supabase KO)
- Le bundle reste raisonnable (< 500 KB gzippé)

Commence par me proposer ton plan priorisé.
```

---

## Utilisation

1. Copie tout le contenu dans les triples backticks ci-dessus
2. Ouvre une nouvelle conversation Claude (ou continue dans celle-ci)
3. Colle le prompt
4. Claude te proposera un plan → valide ou ajuste
5. Avance feature par feature

## Astuce

Tu peux aussi personnaliser l'ordre de priorité au début du prompt si tu préfères
attaquer par une feature précise (ex: "Je veux commencer par le scan de code-barres").
