import recipes from '../data/recipes.json'
import { supabase } from './supabase'
import { detectCategory } from './categories'

/**
 * Normalise une chaîne pour comparaison (sans accents, minuscules).
 */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Recherche dans le catalogue local.
 * Match sur le nom, les tags, ou les ingrédients.
 */
export function searchRecipes(query, limit = 20) {
  const q = normalize(query)
  if (!q) return recipes.slice(0, limit)

  return recipes
    .map((r) => {
      const nameScore = normalize(r.name).includes(q) ? 10 : 0
      const tagScore = (r.tags || []).some((t) => normalize(t).includes(q)) ? 5 : 0
      const ingScore = r.ingredients.some((i) => normalize(i.name).includes(q)) ? 2 : 0
      const score = nameScore + tagScore + ingScore
      return { recipe: r, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.recipe)
}

/**
 * Récupère une recette par son id.
 */
export function getRecipeById(id) {
  return recipes.find((r) => r.id === id) || null
}

/**
 * Met à l'échelle les quantités d'une recette pour un nombre de portions donné.
 */
export function scaleRecipe(recipe, servings) {
  const factor = servings / recipe.servings
  return {
    ...recipe,
    servings,
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      quantity: roundNice(ing.quantity * factor)
    }))
  }
}

/**
 * Arrondi "humain" : entiers en dessous de 10, 1 décimale au-delà.
 */
function roundNice(n) {
  if (n < 1) return Math.round(n * 10) / 10
  if (n < 10) return Math.round(n * 2) / 2 // demi-entiers
  return Math.round(n)
}

/**
 * Convertit une recette (déjà mise à l'échelle) en items prêts pour la DB.
 */
export function recipeToItems(recipe, listId, userId) {
  return recipe.ingredients.map((ing) => ({
    list_id: listId,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit && ing.unit !== 'unité' ? ing.unit : null,
    category: ing.category || detectCategory(ing.name),
    added_by: userId
  }))
}

/**
 * Crée une nouvelle liste + ses items depuis une recette mise à l'échelle.
 * Retourne l'id de la liste créée.
 */
export async function createListFromRecipe(recipe, servings, listName, userId) {
  const scaled = scaleRecipe(recipe, servings)

  const { data: list, error: listErr } = await supabase
    .from('lists')
    .insert({ name: listName, owner_id: userId })
    .select()
    .single()

  if (listErr) throw listErr

  const items = recipeToItems(scaled, list.id, userId)
  const { error: itemsErr } = await supabase.from('items').insert(items)
  if (itemsErr) throw itemsErr

  return list
}

/**
 * Appel à l'Edge Function Supabase qui génère une recette via IA.
 * Retourne une recette au même format que les entrées de recipes.json.
 */
export async function generateRecipeWithAI(query, servings = 4) {
  const { data, error } = await supabase.functions.invoke('generate-recipe', {
    body: { query, servings }
  })

  if (error) throw new Error(error.message || 'Erreur IA')
  if (!data || !data.ingredients) {
    throw new Error('Réponse IA invalide')
  }

  // S'assure que chaque ingrédient a une catégorie
  data.ingredients = data.ingredients.map((ing) => ({
    ...ing,
    category: ing.category || detectCategory(ing.name)
  }))

  return data
}

/**
 * Retourne toutes les recettes pour l'affichage du catalogue.
 */
export function getAllRecipes() {
  return recipes
}
