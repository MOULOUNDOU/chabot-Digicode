# Digicode - Assistant Commercial Chatbot

Application web moderne (Next.js + TypeScript + Tailwind) pour qualifier des demandes clients et les soumettre sur WhatsApp avec un message prérempli.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Route API serveur (`/api/chat`) pour OpenRouter
- UI responsive mobile-first

## 1) Installation
```bash
npm install
```

## 2) Variables d'environnement
Copiez le fichier d'exemple:

```bash
cp .env.example .env.local
```

Puis renseignez:

- `OPENROUTER_API_KEY` : clé API OpenRouter (serveur uniquement)
- `OPENROUTER_MODEL` : modèle OpenRouter (ex: `openai/gpt-4o-mini`)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` : numéro WhatsApp cible (format international sans `+`)

## 3) Lancement local
```bash
npm run dev
```

Ouvrez: `http://localhost:3000`

## 4) Personnaliser le numéro WhatsApp
Modifiez `NEXT_PUBLIC_WHATSAPP_NUMBER` dans `.env.local`.

Exemple:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=221771234567
```

## 5) Personnaliser services et prix
Modifiez le catalogue dans:
- `lib/services.ts`

Le bot utilise ce catalogue pour:
- les suggestions cliquables
- les prix affichés
- la synthèse avant soumission
- le contexte métier envoyé à l'IA

## 6) Changer le modèle OpenRouter
Mettez à jour dans `.env.local`:

```env
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Vous pouvez remplacer par tout modèle compatible Chat Completions sur OpenRouter.

## Architecture
- `app/page.tsx` : page principale (bandeau + cartes + chatbot)
- `components/sales-chat.tsx` : logique du chat et états locaux
- `components/request-summary-card.tsx` : récapitulatif + copier + bouton WhatsApp
- `app/api/chat/route.ts` : proxy serveur sécurisé vers OpenRouter
- `lib/prompt.ts` : prompt système de l'assistant commercial
- `lib/services.ts` : offre Digicode et règles de prix
- `lib/lead.ts` : résumé, complétude, génération message/lien WhatsApp
- `lib/validators.ts` : validation/sanitization des entrées/sorties
- `types/chat.ts` : types partagés

## Sécurité
- La clé OpenRouter n'est jamais exposée au frontend.
- Les appels IA passent par la route API serveur.
- Validation/sanitization appliquées aux messages et champs collectés.
- Limites simples de taille et volume des messages.
- Gestion d'erreurs API propre côté serveur et interface.

## Fonctionnement utilisateur
1. Le client discute avec l'assistant Digicode.
2. Le bot qualifie le besoin, détecte le service et collecte les informations clés.
3. Un récapitulatif propre est généré en temps réel.
4. Le bouton **Soumettre la demande sur WhatsApp** devient utilisable quand les infos minimales sont complètes.
5. Le clic ouvre WhatsApp avec un message prérempli prêt à envoyer.
