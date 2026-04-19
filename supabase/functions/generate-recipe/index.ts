// @ts-nocheck
// =========================================================
// Supabase Edge Function : generate-recipe
// =========================================================
// Ce fichier tourne dans l'environnement Deno de Supabase,
// pas dans Node.js / ton IDE. VS Code ne connaît pas `Deno`
// par défaut, d'où le @ts-nocheck ci-dessus. Le code est
// parfaitement valide côté serveur une fois déployé.
//
// Génère une recette à partir d'un nom de plat en utilisant
// l'API Anthropic Claude. Appelée depuis le frontend via
// supabase.functions.invoke('generate-recipe', { body: { query, servings } })
//
// Pré-requis :
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
//   supabase functions deploy generate-recipe --no-verify-jwt
// =========================================================

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `Tu es un assistant de cuisine francophone. Quand on te demande une recette,
tu renvoies UNIQUEMENT un objet JSON valide (sans texte autour, sans balises markdown) au format suivant :

{
  "id": "slug-de-la-recette",
  "name": "Nom de la recette",
  "emoji": "🍽️",
  "tags": ["plat"],
  "servings": 4,
  "ingredients": [
    { "name": "ingrédient en minuscules", "quantity": 200, "unit": "g", "category": "epicerie" }
  ]
}

Règles strictes :
- "unit" parmi : "g", "kg", "ml", "L", "unité", "boîte", "paquet", "pack", "cuillère à soupe", "cuillère à café"
- "category" parmi : "fruits", "legumes", "epicerie", "boulangerie", "laitier", "viande", "surgeles", "boissons", "hygiene", "entretien", "autre"
- "quantity" est un nombre (entier ou décimal)
- Noms d'ingrédients en français, au pluriel si nécessaire
- 5 à 15 ingrédients selon la complexité
- Pas de commentaire, pas de texte avant ou après le JSON`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (!ANTHROPIC_API_KEY) {
    return json({ error: 'ANTHROPIC_API_KEY non configuré dans Supabase secrets' }, 500)
  }

  try {
    const { query, servings = 4 } = await req.json()
    if (!query || typeof query !== 'string') {
      return json({ error: 'query manquant' }, 400)
    }

    const userMsg = `Donne-moi la recette de "${query}" pour ${servings} personnes.
Adapte les quantités pour ${servings} personnes. Renvoie uniquement le JSON.`

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }]
      })
    })

    if (!apiRes.ok) {
      const txt = await apiRes.text()
      return json({ error: `Anthropic API: ${apiRes.status} ${txt}` }, 500)
    }

    const apiData = await apiRes.json()
    const textContent = apiData?.content?.[0]?.text ?? ''

    // Nettoie un éventuel ```json ... ```
    const cleaned = textContent
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    let recipe
    try {
      recipe = JSON.parse(cleaned)
    } catch {
      return json({ error: 'Réponse IA non-JSON', raw: textContent }, 500)
    }

    return json(recipe, 200)
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}
