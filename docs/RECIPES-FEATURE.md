# Feature : Création de liste depuis une recette

## Vue d'ensemble

Depuis la page `Lists`, un nouveau bouton **🍳 Créer depuis une recette** ouvre
une modal qui permet de :

1. Rechercher dans le catalogue local (20+ recettes françaises)
2. Ou générer une recette via IA (Claude) si absente du catalogue
3. Ajuster le nombre de portions (curseur 1-10 personnes)
4. Personnaliser le nom de la liste (ex: "Mon couscous")
5. Créer la liste et ses items en un clic

Les items créés sont ensuite modifiables dans la liste comme n'importe quels
autres items (catégories, notes, quantités, etc.). L'utilisateur peut aussi
sauvegarder la liste modifiée comme template personnel depuis `ListDetail`.

## Fichiers ajoutés

```
src/
  data/
    recipes.json                        # Catalogue local (20 recettes)
  lib/
    recipes.js                          # searchRecipes, scaleRecipe, createListFromRecipe, generateRecipeWithAI
  components/
    recipes/
      RecipePicker.jsx                  # Modal de sélection + preview
supabase/
  functions/
    generate-recipe/
      index.ts                          # Edge Function Deno (optionnelle)
docs/
  RECIPES-FEATURE.md                    # Ce document
```

## Fichiers modifiés

- `src/pages/Lists.jsx` : ajout du bouton + montage de `RecipePicker`

## Ajouter des recettes au catalogue local

Ouvre `src/data/recipes.json` et ajoute une entrée :

```json
{
  "id": "mon-plat",
  "name": "Mon plat",
  "emoji": "🍽️",
  "tags": ["plat"],
  "servings": 4,
  "ingredients": [
    { "name": "tomates", "quantity": 4, "unit": "unité", "category": "legumes" }
  ]
}
```

Catégories valides : `fruits`, `legumes`, `epicerie`, `boulangerie`, `laitier`,
`viande`, `surgeles`, `boissons`, `hygiene`, `entretien`, `autre`.

## Configurer l'IA (optionnel)

La génération par IA utilise une **Edge Function Supabase** qui appelle
l'API Anthropic (Claude). C'est optionnel : sans IA, seul le catalogue local
est disponible.

### 1. Récupérer une clé API Anthropic

- Va sur [console.anthropic.com](https://console.anthropic.com)
- `Settings > API Keys > Create Key`
- Prévois un budget : un appel coûte ~0,005 $ (modèle Sonnet)

### 2. Installer Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 3. Lier le projet local à ton projet Supabase

```bash
cd shopping-list
supabase link --project-ref TON_PROJECT_REF
```

`TON_PROJECT_REF` se trouve dans l'URL de ton dashboard Supabase
(ex: `https://supabase.com/dashboard/project/abcdefghijklmnop`).

### 4. Ajouter la clé en secret

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

### 5. Déployer la fonction

```bash
supabase functions deploy generate-recipe --no-verify-jwt
```

Le flag `--no-verify-jwt` permet aux utilisateurs anonymes d'appeler la fonction.
Pour ne l'autoriser qu'aux utilisateurs connectés, retire-le et l'auth sera
automatiquement vérifiée par Supabase.

### 6. Tester

Dans l'app, tape une recette exotique (ex: "osso buco") qui n'est pas dans le
catalogue, puis clique sur **✨ Générer avec IA**.

## Coûts IA estimés

Avec le modèle Claude Sonnet 4.6 :
- Par appel : ~800 tokens d'entrée + ~500 tokens de sortie
- Coût unitaire : ~0,005 $
- 1000 générations ≈ 5 $

Pour réduire les coûts, tu peux changer le modèle dans
`supabase/functions/generate-recipe/index.ts` :

```ts
const MODEL = 'claude-haiku-4-5-20251001' // ~10x moins cher
```

## Notes techniques

### Scaling des quantités

La fonction `scaleRecipe` multiplie chaque quantité par un facteur
`(portions demandées / portions de base)`. Les arrondis sont "humains" :
- < 1 : 1 décimale (ex: 0.3)
- 1 à 10 : demi-entiers (ex: 2.5)
- ≥ 10 : entiers (ex: 250)

### Conversion vers items

`recipeToItems` normalise l'unité : si `unit === 'unité'`, la colonne `unit`
passe à `null` en DB (convention du projet pour ne pas afficher "5 unité").

### Offline

Le catalogue local étant embarqué dans le bundle, la recherche fonctionne
entièrement offline. Seule la génération IA nécessite une connexion.

### Évolutions possibles

- Marquer les recettes "favoris" par utilisateur
- Import depuis URL (recette de Marmiton, etc.) via scraping
- Partage de recettes entre utilisateurs (table `user_recipes` publique)
- Historique des recettes utilisées
- Multi-recettes dans une seule liste ("batch cooking")
