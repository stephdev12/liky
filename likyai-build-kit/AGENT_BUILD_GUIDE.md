# likyAI — Guide de construction pour l'agent de développement

> Tu es l'agent chargé de construire **likyAI** : une plateforme créative (image, vidéo, musique, voix off) vendue en **crédits payables par mobile money** pour l'Afrique francophone d'abord. Lis ce document en entier avant d'écrire du code. Les faits marqués ✅ ont été vérifiés dans la documentation kie.ai ; ceux marqués ⚠️ **doivent être revérifiés** à la source avant de les coder.

Signature de marque : **« Tes idées prennent vie. »** — Nom exact : **likyAI**.

---

## 0. Contenu du kit

```
likyai-build-kit/
├─ AGENT_BUILD_GUIDE.md            ← ce fichier
├─ prototype/studio.html           ← prototype visuel validé (UI, comportements, thèmes)
├─ assets/
│  ├─ icons-light/*.png            ← 8 icônes sans fond (thème clair)
│  ├─ icons-dark/*.png             ← 8 icônes thème sombre (traits ivoire)
│  ├─ icons-board-reference.jpg    ← planche d'origine (référence de rendu)
│  └─ organic/*.webp               ← 4 visuels organiques pour les cartes
└─ reference/components/           ← À AJOUTER par le propriétaire (voir §3.4)
   ├─ loading-state.tsx
   ├─ thinking-state.tsx
   └─ prompt-bar.tsx
```

Le **prototype** est la référence d'UX : ouvre-le dans un navigateur, lis son code. Il est volontairement front-only (générations simulées, crédits locaux). Tout ce qu'il simule doit devenir réel.

---

## 1. Stack imposée

| Couche | Choix |
|---|---|
| Framework | **Next.js (App Router) + TypeScript**, déploiement Vercel |
| Styles | **Tailwind CSS v4** (obligatoire pour coss) |
| UI | **shadcn (CLI) + coss ui + Bencho + efferd** — voir §3 |
| Base de données / Auth / Storage / Realtime | **Supabase** (Postgres + RLS) |
| Fournisseur IA | **kie.ai** (API unifiée, un seul solde) — voir §5 |
| Paiement | Mobile money via agrégateur — voir §8 |
| MCP | Serveur MCP distant maison — voir §10 |
| i18n | Français par défaut, anglais ensuite (next-intl ou équivalent) |

Règle d'or : **aucune clé secrète côté navigateur** (clé kie.ai, clé service Supabase, clé de l'agrégateur de paiement, clé HMAC webhook).

---

## 2. Marque et design system (non négociable)

### 2.1 Palette officielle
| Rôle | Nom | Hex |
|---|---|---|
| Fond principal | Ivoire | `#F8F8F5` |
| Structure, texte, boutons sombres | Graphite | `#171717` |
| Action (Générer, Recharger, sélection active) | Lime | `#D8FF64` |
| Surfaces secondaires, champs, séparateurs | Gris minéral | `#EAEAE5` |

Répartition : ~70 % ivoire, ~20 % graphite/gris, **≤ 10 % lime**. Le lime est un accent fonctionnel, jamais un fond. Aucun dégradé multicolore, aucune couleur par outil : les 4 outils partagent la même identité.

Thème sombre : fond `#121211`, surface `#1B1B1A`, texte `#F8F8F5`, gris `#262624`, lime inchangé (voir les tokens exacts dans `prototype/studio.html`, bloc `:root[data-theme="dark"]`).

### 2.2 Typographie
| Élément | Police |
|---|---|
| Logo, titres principaux | **Sentient** Regular (Fontshare, licence ITF Free Font License — utiliser les fichiers officiels et respecter la licence) |
| Titres éditoriaux | Sentient Italic |
| Sous-titres, boutons, nav | **Geist** Medium |
| Paragraphes, données techniques | Geist Regular |
| Crédits et prix | Geist Medium/Semibold |

Dans le prototype, Sentient est remplacée par Newsreader (limite de l'environnement de prévisualisation). **En production : auto-héberger Sentient** via `next/font/local`.

### 2.3 Règles d'interface
Boutons 12–16 px de rayon · cartes ivoire/gris minéral + bordure fine · champs neutres, **focus lime** (anneau + bordure graphite) · icônes linéaires · ombres très légères uniquement sur éléments flottants · animations courtes · **coût en crédits visible avant chaque génération** · états de génération explicites (attente → en cours → prête → erreur).

### 2.4 Voix de marque
Simple, confiante, sans jargon. « Décris ton idée et lance la création. » · « Tu n'as plus assez de crédits pour cette création. » · « Ta création est prête. »

### 2.5 Icônes et visuels
- 8 icônes glassmorphism : image, vidéo, musique, voix, création, crédits, bibliothèque, paramètres. Fournies en PNG (clair/sombre). **À vectoriser plus tard** (SVG) ; en attendant, charger la variante selon le thème via CSS (`prefers-color-scheme` + `[data-theme]`), comme dans le prototype. Affichage recommandé : **40 px minimum** (les traits fins se perdent en dessous).
- 4 visuels organiques (`assets/organic`) : fond des cartes de type vidéo (dégradé léger via masque) et des cartes de création. En thème sombre : `filter: invert(1) hue-rotate(180deg)`.
- Fond du canvas : grille de points discrète (22 px, rayon ~1 px).

---

## 3. Bibliothèques UI : à utiliser, pas d'UI générique

Objectif : **zéro look « template IA »**. Avant de créer un composant maison, vérifie s'il existe dans l'une de ces sources.

### 3.1 shadcn (base du projet)
```bash
npx skills add shadcn/ui          # skill shadcn pour l'agent
npx shadcn@latest init            # si components.json absent
```

### 3.2 coss ui (Cal.com) — primitives Base UI + Tailwind v4
✅ Construit sur **Base UI** (pas Radix), « copier-coller et posséder ». Prérequis : Tailwind v4 et `@base-ui/react`.
```bash
npx skills add cosscom/coss                 # skill coss pour l'agent (à lancer en premier)
npx shadcn@latest init @coss/style          # nouveau projet : installe tout + styles de base
# ou, projet existant :
npx shadcn@latest add @coss/ui
npx shadcn@latest add @coss/dialog --dry-run   # prévisualiser avant d'ajouter
```
Règles de migration à respecter (issues du skill) : `asChild` → prop `render`, `onSelect` → `onClick`, Select « items-first », ToggleGroup `type` → `multiple`. Consulte les « particles » (exemples) avant de générer du code. Docs : https://coss.com/ui

### 3.3 Bloc de connexion efferd `auth-2`
```bash
npx skills add shadcn/ui                     # si absent
npx shadcn@latest init                       # si pas de components.json
```
Ajouter dans `components.json` :
```json
{ "registries": { "@efferd": "https://efferd.com/r/{style}/{name}.json" } }
```
Puis :
```bash
npx shadcn@latest add @efferd/auth-2
```
Ensuite : **adapter le bloc à la marque** (palette §2, Sentient pour le titre, boutons lime) et le brancher sur Supabase Auth (email + lien magique/OTP, Google ; **téléphone/OTP SMS à étudier** pour l'Afrique, voir §9). Résumer ce qui a été ajouté.

### 3.4 Bencho (https://bencho.dev) — micro-interactions React
✅ Bibliothèque de composants interactifs React à explorer et copier. Blocs utiles pour likyAI :

| Besoin likyAI | Bloc Bencho à étudier |
|---|---|
| Bouton Générer | **Generate** |
| Choix du format (1:1, 9:16, 16:9, 4:5) | **Aspect ratio**, **Magnetic select** |
| Barre flottante Image/Vidéo/Musique/Voix | **Canvas toolbar**, **Create menu**, **Radial menu** |
| Dépôt d'images de référence / animation | **Upload dropzone**, **Asset swap** |
| Comparer avant/après (upscale, édition) | **Image compare** |
| Voix off : enregistrement/aperçu | **Voice note**, **Now playing** |
| Durée / curseurs de paramètres | **Slosh slider**, **Time scrubber**, **Drag stepper** |
| Confirmation d'achat de crédits | **Slide to confirm**, **Inline confirm** |
| Notifications « création prête » | **Notify**, **Dynamic island** |
| Galerie | **Carousel**, **Image accordion**, **Reorder list**, **Tilt card** |
| Étapes d'un flow vidéo | **Step player**, **Checklist** |
| Code OTP | **One-time code** |

Le propriétaire fournit aussi 3 composants de référence issus du même univers (`reference/components/`) :

- **`prompt-bar.tsx`** — compositeur : pièces jointes, menu `@` (sources), menu `/` (commandes), sélecteur de modèle, dictée, envoi, balayage « glimm » à la sélection du modèle phare. **C'est la base de notre « chatbulle »** : `@` → références/assets de la bibliothèque, `/` → types de création (`/ugc`, `/marketing`, `/animation`, `/saas`, `/libre`), sélecteur de modèle avec **coût en crédits affiché**.
- **`loading-state.tsx`** — loader en grille de pixels + libellé en shimmer + chrono. À utiliser pour toutes les générations longues (vidéo/musique).
- **`thinking-state.tsx`** — trace dépliable (étapes). À utiliser pour « amélioration du prompt », pipeline UGC multi-étapes (script → voix → avatar → montage) et affichage du statut `waiting/queuing/generating`.

Ces composants dépendent de **tokens Tailwind** à définir et mapper sur la palette likyAI :

| Token utilisé | Valeur likyAI (clair) |
|---|---|
| `ink`, `ink-2`, `ink-3` | `#171717`, ~`#4A4A47`, ~`#7D7D78` |
| `surface` | `#FCFCFA` (ou `#F8F8F5`) |
| `line`, `line-strong` | `#E2E2DC`, ~`#CFCFC8` |
| `hover`, `hover-2`, `field`, `inset` | `#EAEAE5` et variantes |
| `accent`, `accent-tint`, `accent-ink` | **lime `#D8FF64`**, tint lime très clair, graphite |
| `green`, `red`, `orange` | sémantiques sobres (succès/erreur) — pas d'arc-en-ciel |
| ombres | `shadow-card`, `shadow-raised`, `shadow-overlay`, `shadow-hairline` très légères |
| rayons | `rounded-control` 12 px, `rounded-chip` 8 px |
| keyframes/classes | `pixel-on`, `shimmer-text`, `pop-in`, `fade-up`, `fade-in`, `spin`, `eq-bounce`, `.animated-underline`, variables `--tooltip-bg`, `--tooltip-muted` |

⚠️ `prompt-bar.tsx` importe le paquet **`glimm`** (`createShader`, `playSweep`, `accentChain`, `ACCENTS`). Vérifier son installation/licence. **Remplacer la palette arc-en-ciel du balayage** par un balayage **monochrome ivoire → lime** (la marque interdit le multicolore).

### 3.5 beautiful.dev
Source demandée par le propriétaire pour des composants complémentaires. ⚠️ Le site refuse l'accès automatisé : **l'agent doit la consulter lui-même** (navigateur) et ne prendre que des composants cohérents avec §2.

### 3.6 Ordre de préférence pour un composant donné
1. Bloc Bencho existant → 2. coss ui (primitive/particle) → 3. shadcn → 4. composant maison **stylé avec les tokens likyAI**. Jamais de composant « par défaut » non retouché.

---

## 4. Pages et routes

| Route | Rôle | Priorité |
|---|---|---|
| `/` | Landing marketing — **à faire plus tard** ; pour l'instant redirige vers `/login` ou `/home` si connecté | P3 |
| `/login`, `/signup` | Bloc `@efferd/auth-2` adapté | P0 |
| `/home` | **Page d'accueil avant la création** : bonjour, solde, 4 grandes tuiles (Image / Vidéo / Musique / Voix off avec leurs icônes), créations récentes, modèles à la une, raccourcis « UGC », « Pub produit », « Animer une image » | P0 |
| `/create/[tool]` | Canvas de création (celui du prototype) : `image`, `video`, `music`, `voice` | P0 |
| `/library` | Bibliothèque des créations (filtres, téléchargement, partage, supprimer) | P1 |
| `/credits` | Solde, packs, recharge mobile money, historique des transactions | P0 |
| `/settings` | Thème (Clair/Sombre/Auto), langue, profil, clés/jetons MCP | P1 |
| `/privacy` | **Politique de confidentialité** | P0 (avant lancement) |
| `/terms` | CGU + conditions de vente + remboursement | P0 (avant lancement) |
| `/faq` | **FAQ** | P1 |
| `/docs/mcp` | Documentation du MCP likyAI | P1 |
| `/api/...` | Voir §6 et §10 | P0 |

### 4.1 Page de création (reprendre le prototype)
- Canvas moodboard à points, cartes déplaçables (pointer events), navigation flottante **Image · Vidéo · Musique · Voix off**, bulle de profil (solde, Recharger, Historique, Paramètres, Déconnexion), bouton thème.
- **Image** : modèle (coût affiché), format, nombre, qualité (selon modèle), style, image(s) de référence.
- **Vidéo** : choisir d'abord le **type** (UGC · Marketing · Animer une image · Présentation SaaS · Libre) puis paramètres propres au type (plateforme/format, avatar, langue, ton, durée, appel à l'action, upload image, URL produit…).
- **Musique** : genre, durée, instrumental/avec voix, paroles optionnelles.
- **Voix off** : texte, voix, langue, vitesse ; coût selon la longueur.
- Plateformes de publication → ratios : TikTok/Reels/Shorts 9:16 · Facebook 4:5 · YouTube 16:9 · LinkedIn 1:1.

### 4.2 Contenu de `/privacy` (à rédiger en FR puis EN)
Responsable du traitement et contact · données collectées (compte, téléphone/email, historique de crédits, prompts, fichiers envoyés, créations générées, journaux techniques) · finalités · **sous-traitants** (Supabase, kie.ai et ses fournisseurs de modèles, agrégateur de paiement, Vercel) · **durées de conservation** (kie.ai garde les médias 14 jours et les logs 2 mois ✅ ; définir la nôtre) · droits des utilisateurs (accès, rectification, suppression) · transferts internationaux · sécurité · mineurs · cookies · contenu envoyé aux modèles d'IA (ex. photos de visages) · contact DPO. ⚠️ Faire valider par un juriste (droit camerounais/OHADA sur la protection des données personnelles, RGPD si utilisateurs UE).

### 4.3 FAQ — rubriques minimales
Qu'est-ce que likyAI ? · Comment fonctionnent les crédits ? · Combien coûte une création ? · Comment recharger (MTN MoMo, Orange Money…) ? · Paiement échoué mais débité ? · Mes créations sont-elles conservées ? · Droits d'usage commercial · Avatars/voix et consentement · Contenus interdits · Remboursement si la génération échoue (**automatique**) · Utiliser likyAI depuis Claude/ChatGPT (MCP) · Support.

---

## 5. Intégration kie.ai (le cœur technique)

### 5.1 Faits vérifiés ✅
- Base API : `https://api.kie.ai` · auth : `Authorization: Bearer <KIE_API_KEY>` · `Content-Type: application/json`. Un header nommé `apikey` est rejeté en 401.
- **Les erreurs reviennent avec HTTP 200** et un champ `code` dans le corps (`401`, `402` crédits insuffisants, `422`, `429`, `500`). **Toujours tester `code`**, pas le statut HTTP.
- Génération image/vidéo/audio = **asynchrone** :
  1. `POST /api/v1/jobs/createTask` → `{ code:200, data:{ taskId } }` (un 200 = tâche *créée*, pas terminée).
  2. Soit **callback** (`callBackUrl`), soit **polling** `GET /api/v1/jobs/recordInfo?taskId=…`.
- États : `waiting` → `queuing` → `generating` → `success` | `fail`. Certaines vidéos dépassent **10 min** : continuer à poller jusqu'à `success`/`fail` (backoff exponentiel à partir de 2–3 s).
- `recordInfo` renvoie notamment : `state`, `resultJson` (chaîne JSON : `{"resultUrls":[…]}`), `failCode`, `failMsg`, `costTime`, `progress`, **`creditsConsumed`**, `param`.
- Forme d'une requête (exemple Nano Banana 2.1) :
```json
{ "model": "nano-banana-2-1",
  "callBackUrl": "https://likyai.app/api/webhooks/kie",
  "input": { "prompt": "...", "image_input": [], "aspect_ratio": "auto",
             "resolution": "1K", "output_format": "png" } }
```
- Exemple ElevenLabs TTS : `model: "elevenlabs/text-to-speech-turbo-2-5"`, `input: { text, voice, stability, similarity_boost, style, speed, timestamps, previous_text, next_text, language_code }`.
- **Suno** passe aussi par `createTask` : `model: "ai-music-api/generate"`, `input: { custom_mode, instrumental, model: "V6" | "V6_MINI" | "V6_WILD", prompt, style, title, lyrics, duration (10–360 s, mode custom), vocal_gender, … }`. Règles : toujours requis `custom_mode`, `instrumental`, `model` ; mode non-custom = idée libre (≤ 3000 car.), paroles auto ; mode custom = `title` (≤ 80 car.) + au moins un de `style`/`lyrics`/`negative_tags`. Génère **plusieurs variantes** par requête. Callback en 3 étapes : `text`, `first`, `complete`. Ne pas envoyer les paramètres « custom only » en non-custom. Les anciennes versions (V4…V5.5) sont marquées abandonnées.
- **Crédits** : `GET /api/v1/chat/credit` → `{ data: <solde> }`. **1 crédit kie = 0,005 USD** (déduit des tarifs : 16 crédits = 0,08 $). Exemples de coûts : Wan 2.2 A14B Turbo 720p = 16 crédits/vidéo ; Seedream v4 = 5 crédits/image ; Seedance v1 Pro 720p = 6 crédits/s ; Kling 3.0 Omni 4K = 67 crédits/s. Tarifs complets : https://kie.ai/pricing (574 lignes, paginé — ne pas copier de mémoire).
- **Webhook sécurisé (HMAC)** : en-têtes `X-Webhook-Timestamp` (secondes) et `X-Webhook-Signature`. Signature = `base64(HMAC-SHA256(taskId + "." + timestamp, webhookHmacKey))` ; `taskId` = `data.taskId` (**Suno : `data.task_id`**). Comparaison **à temps constant**. La clé se génère sur https://kie.ai/settings. ⚠️ La signature **ne couvre pas le corps** : pour le résultat faisant foi, **rappeler `recordInfo`**. Répondre en 2xx. Callbacks envoyés au succès **et** à l'échec ; vérifier `data.state`. Ne pas filtrer par IP.
- **Upload de fichiers** (entrées : photo à animer, audio, vidéo de référence) : base `https://kieai.redpandaai.co`, 3 méthodes (URL / flux / Base64), **gratuit**, fichiers supprimés **après 24 h**, `data.downloadUrl` à passer au modèle. URL ≤ 100 Mo (timeout 30 s), Base64 ≤ 10 Mo conseillé.
- `POST /api/v1/common/download-url` : lien de téléchargement temporaire (**20 min**) pour fichiers générés par kie.
- **Rétention** : médias générés **14 jours**, logs **2 mois** → **copier chaque résultat dans Supabase Storage dès le succès**.
- **Limites** : ~20 nouvelles requêtes / 10 s par compte (429 sinon, rejet sans file d'attente). Implémenter une file interne + rate limiter.
- IP whitelist et limites par clé disponibles : activer. Journal de tâches : https://kie.ai/logs.
- Stabilité : kie.ai se présente comme une petite équipe, instabilité occasionnelle possible → prévoir retries, états d'erreur clairs et **remboursement automatique** des crédits.

### 5.2 Méthode obligatoire : ne jamais coder les paramètres de mémoire
La doc kie.ai liste **200+ modèles** et change vite. Pour chaque modèle branché :
1. Installer le skill officiel (une fois par machine) : voir https://docs.kie.ai/ai-agent/install-kie-models (commande `npx` indiquée sur cette page), puis `export KIE_API_KEY=...`.
2. Le skill `kie-models` fait : **FIND** (liste vivante) → **READ** (paramètres du modèle) → **UPLOAD** → **RUN** → **SAVE**.
3. Ouvrir la page du modèle (liens §6) et copier l'**identifiant `model` exact** + le schéma `input`. Index machine-lisible de toute la doc : https://docs.kie.ai/llms.txt.
4. Mettre le résultat dans le **registre de modèles** (§5.4), pas en dur dans les composants.

⚠️ Certaines familles n'utilisent **pas** `jobs/createTask` : **Veo 3.1** (endpoints dédiés `veo3-api`, avec sorties 1080p/4K séparées), **Runway**, **4o Image**, **Flux Kontext**, **modèles de chat** (synchrones). Lire leur page avant intégration.

### 5.3 Modèles recommandés par usage
Les identifiants exacts sont à lire sur chaque page (⚠️). Recommandation = point de départ ; **tester la qualité sur des prompts francophones et des visages/peaux africains** avant de figer le catalogue.

**Images**
| Usage | Modèles candidats (page doc) |
|---|---|
| Défaut polyvalent | **Nano Banana 2.1** ✅ id `nano-banana-2-1` (+ Nano Banana 2 / Pro / 2 Lite pour l'éco) — https://docs.kie.ai/market/google/nanobanana-2-1 |
| Texte dans l'image, affiches, pubs | **GPT Image 2.5** (Flare / Sunburst), GPT Image 2 — https://docs.kie.ai/market/gpt/gpt-image-2-5-flare-text-to-image · **Ideogram V3** |
| Éco / volume | **Seedream 5.0 Flash / Lite**, **Z-Image**, Qwen — https://docs.kie.ai/market/seedream/5-flash-text-to-image |
| Qualité premium | Seedream 5.0 Pro, Flux-2 Pro, Imagen 4 Ultra, Grok Imagine Image 2.0 |
| Personnage cohérent | Ideogram Character (Edit/Remix), Seedream Image-to-Image |
| Édition / image→image | Nano Banana Edit, Seedream I2I, GPT Image I2I, Qwen Image Edit |
| Outils | **Topaz Image Upscale**, **Recraft Remove Background**, Recraft Crisp Upscale, Seedream Layer Decomposition |

**Vidéo**
| Usage | Modèles candidats |
|---|---|
| Cinéma / son natif | **Veo 3.1** (API dédiée) — https://docs.kie.ai/veo3-api/generate-veo-3-video |
| Marketing / pub (qualité-prix) | **Seedance 2.5 / 2.0** (+ Fast, Mini, Draft pour brouillons pas chers), **Kling 3.0**, Kling V3 Turbo, HappyHorse 1.1 |
| Image → vidéo (« animer ») | Kling 3.0 / V3 Turbo I2V, Seedance, Hailuo 2.3, Wan 2.7, PixVerse V6 |
| Transitions / extension | PixVerse V6 (First&Last frame, Extend, Fusion), Veo Extend, Grok Video Extend |
| Références / transformation | Kling 3.0 Omni (Reference, Transformation), Wan 2.7 R2V, HappyHorse reference, MiniMax H3 |
| Contrôle du mouvement | Kling 3.0 Motion Control, Wan Animate Move/Replace |
| **UGC (humain qui parle)** | **Kling AI Avatar Pro/Standard**, **OmniHuman 1.5**, **Infinitalk (from audio)**, Wan 2.2 Speech-to-Video, Gemini Omni Character, Volcengine Lip Sync |
| Édition vidéo | Runway Aleph, Wan 2.7 Video Edit, HappyHorse video-edit |
| Finition | **Topaz Video Upscale**, Grok Imagine Upscale |

**Musique** — **Suno** (V6 / V6_MINI / V6_WILD) : génération, extension, cover, ajout de voix/instrumental, paroles (`Generate Lyrics`), séparation de pistes, MIDI, conversion WAV, **clip musical**, **sons/SFX** (`Generate sounds`).

**Voix off** — **ElevenLabs** (`text-to-speech-turbo-2-5` rapide/éco ✅ ; `text-to-speech-multilingual-v2` qualité/langues ; `text-to-dialogue-v3` dialogues expressifs ; `audio-isolation` nettoyage) et **Gemini TTS** (3.8 Flash, 3.8 Flash-Lite, 3.1 Flash, 2.5 Pro) comme alternative économique. ⚠️ **Tester le français** (accents africains, noms propres) et les langues locales : ne pas promettre ce qui n'est pas validé.

**Chat (aide interne, pas un produit vendu)** — améliorer un prompt, écrire un script UGC, traduire : modèles « Chat » kie (Claude Haiku 5.5 / Gemini Flash / DeepSeek…) selon coût. Synchrone, facturé au token.

### 5.4 Registre de modèles (source de vérité côté app)
Table `models` (Supabase) + fichier `lib/models/registry.ts` généré/validé :
```ts
type ModelDef = {
  id: string;                 // identifiant interne stable, ex. "img.nano-banana-2-1"
  kind: "image" | "video" | "music" | "voice" | "tool" | "chat";
  provider: "kie";
  kieModel: string;           // valeur exacte du champ `model` (⚠️ copier depuis la doc)
  endpoint: "jobs/createTask" | "veo" | "suno" | "runway" | "chat"; // famille d'API
  label: string; tagline: string; tier: "eco" | "standard" | "premium";
  inputSchema: JSONSchema;    // paramètres exposés à l'UI (format, qualité, durée…)
  toKieInput: (ui: UIParams) => Record<string, unknown>; // mapping UI → input kie
  pricing: { unit: "image" | "video" | "second" | "char" | "track"; kieCredits: number | ((p) => number) };
  capabilities: { i2v?: boolean; refs?: boolean; audio?: boolean; maxDuration?: number; ratios?: string[] };
  enabled: boolean;           // activable sans redéploiement
};
```
L'UI **ne connaît que ce registre** : chaque modèle déclare ses paramètres, l'interface les affiche (c'est ce qui rend les chips du prototype dynamiques). Ajouter un modèle = ajouter une entrée, pas du code d'UI.

### 5.5 Pipelines composés (vidéo)
- **UGC** : (1) script (modèle Chat) → (2) voix (ElevenLabs) → (3) avatar parlant (Kling AI Avatar / OmniHuman / Infinitalk) → (4) option : sous-titres/upscale. Un seul « job likyAI » avec sous-étapes visibles via `thinking-state`. Coût total = somme des étapes, **affiché avant lancement**.
- **Marketing** : prompt enrichi avec gabarit par plateforme (ratio, durée, hook, CTA) → Seedance/Kling/Veo.
- **Animer** : upload (Upload API) → I2V.
- **Présentation SaaS** : saisie URL/description → script → scènes → modèle vidéo (+ voix off optionnelle).
- **Libre** : prompt direct.
Chaque sous-étape = une ligne dans `generation_steps` (idempotente, reprise possible).

---

## 6. Flux de génération (serveur)

```
POST /api/generate
 1. Auth (session Supabase) + validation Zod des params contre le registre
 2. Modération du prompt (liste de blocage + règles §11)
 3. Coût = registry.pricing → crédits likyAI (§7)
 4. RÉSERVER les crédits (ledger, transaction atomique) ; refus clair si solde insuffisant
 5. Uploader les entrées (Upload API kie) si besoin
 6. createTask kie avec callBackUrl=/api/webhooks/kie?gen=<id>  (rate limiter ≤ 20 req/10 s)
 7. Enregistrer generation(status='queued', kie_task_id)
POST /api/webhooks/kie
 a. Vérifier HMAC (temps constant) — sinon 401
 b. Idempotence : table webhook_events (task_id + state unique)
 c. Rappeler GET recordInfo (source de vérité)
 d. success → télécharger resultUrls → Supabase Storage (bucket privé) → generation done
    → CAPTURER les crédits ; enregistrer creditsConsumed réel pour la marge
    fail  → RENDRE les crédits (refund) + message utilisateur lisible
Cron (toutes les minutes) : poller les générations > N s sans callback (filet de sécurité)
Supabase Realtime : l'UI écoute `generations` pour afficher progression/prêt
```
Points d'attention : timeouts Vercel (ne jamais attendre la génération dans la requête) ; reprise après crash ; plusieurs sorties par tâche (images multiples, variantes Suno) ; URLs signées Supabase pour l'affichage.

---

## 7. Crédits, prix, marge

- **Crédit likyAI** = unité interne affichée à l'utilisateur. Un **grand livre** (ledger) append-only : `grant | purchase | hold | capture | release | refund | adjust`. Le solde = somme ; jamais de `UPDATE balance` direct.
- Prix d'une création = `kieCredits × 0,005 USD × (1 + marge)` converti en crédits likyAI. Paramètres en base : `usd_xaf_rate`, `marge_par_tier`, prix des packs. Recalculer le coût quand kie change ses tarifs (job de contrôle qui compare `creditsConsumed` réel au coût prévu et alerte).
- **Garde-fous** : alerte si solde kie bas (`GET /api/v1/chat/credit` en cron) ; **coupe-circuit** qui désactive les modèles chers si le solde kie passe sous un seuil ; plafonds par utilisateur/jour ; crédits de bienvenue limités + anti-abus (téléphone vérifié).
- Les packs du prototype (1 000 FCFA → 50 crédits, etc.) sont **fictifs**.

---

## 8. Paiement mobile money

Candidats (⚠️ comparer frais, pays couverts, webhooks, délais de règlement, conformité) : **MoneyFusion** (déjà utilisé par le propriétaire sur un autre projet de vente par crédits), CinetPay, Flutterwave, PawaPay, Notch Pay, Campay. Exigences :
- Opérateurs : **MTN MoMo, Orange Money** au minimum ; pays prioritaire Cameroun, puis zone CEMAC/UEMOA.
- Flux : choisir un pack → numéro mobile money → paiement → **webhook signé** → créditer via le ledger (idempotent, `payment_id` unique) → ne **jamais** créditer depuis le navigateur.
- Gérer : paiement en attente, échec, doublon, remboursement manuel, reçu, historique (`/credits`).
- Abstraire derrière une interface `PaymentProvider` pour changer d'agrégateur sans toucher au reste.

---

## 9. Supabase

### 9.1 Auth
Email (lien magique/OTP) + Google ; **numéro de téléphone** (OTP) à évaluer selon coût/fiabilité SMS locale. Profil créé par trigger. Aucun accès public aux tables ; **RLS partout**.

### 9.2 Schéma de départ (à affiner)
```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, locale text default 'fr', theme text default 'auto',
  phone text, country text, created_at timestamptz default now()
);

create table credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id),
  kind text not null check (kind in ('grant','purchase','hold','capture','release','refund','adjust')),
  amount numeric(12,2) not null,            -- + crédit / − débit (hold = négatif, release = positif)
  generation_id uuid, payment_id uuid, note text,
  created_at timestamptz default now()
);
create view credit_balance as
  select user_id, sum(amount) as balance from credit_ledger group by user_id;

create table models (            -- registre synchronisé avec lib/models/registry.ts
  id text primary key, kind text, kie_model text, endpoint text, label text,
  tier text, pricing jsonb, input_schema jsonb, capabilities jsonb, enabled boolean default true
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  tool text not null,                       -- image|video|music|voice
  video_type text,                          -- ugc|marketing|animation|saas|libre
  model_id text references models(id),
  prompt text, params jsonb, cost_credits numeric(12,2),
  status text not null default 'queued',    -- queued|running|done|failed|refunded
  kie_task_id text unique, kie_credits_consumed numeric(12,2),
  error text, progress int default 0,
  created_at timestamptz default now(), completed_at timestamptz
);

create table generation_steps (            -- pipelines composés (UGC…)
  id uuid primary key default gen_random_uuid(),
  generation_id uuid references generations(id) on delete cascade,
  idx int, label text, kie_task_id text, status text, output jsonb
);

create table assets (                       -- fichiers stockés chez nous
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id), generation_id uuid references generations(id) on delete set null,
  kind text, storage_path text, mime text, bytes bigint, width int, height int, duration_s numeric,
  favorite boolean default false, created_at timestamptz default now()
);

create table payment_packs (id text primary key, label text, price_xaf int, credits int, active boolean default true);
create table payments (
  id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id),
  pack_id text references payment_packs(id), provider text, provider_ref text unique,
  operator text, phone text, amount_xaf int, status text, created_at timestamptz default now()
);

create table webhook_events (source text, event_key text, payload jsonb, received_at timestamptz default now(),
  primary key (source, event_key));

create table api_tokens (                   -- jetons personnels pour le MCP / API
  id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id),
  name text, token_hash text unique, scopes text[], daily_credit_limit numeric(12,2),
  last_used_at timestamptz, revoked_at timestamptz, created_at timestamptz default now()
);
```
RLS : un utilisateur ne lit/écrit que ses lignes ; `credit_ledger`, `payments`, `webhook_events` **en écriture serveur uniquement** (clé service, jamais exposée). Les fonctions de réservation/capture/remboursement sont des **fonctions SQL transactionnelles** (verrou sur l'utilisateur) pour éviter les doubles dépenses.

### 9.3 Storage
Bucket privé `creations` (chemin `user_id/generation_id/…`), URLs signées courtes ; bucket `uploads` pour les entrées. Politique de rétention définie et indiquée dans `/privacy`. Miniatures générées côté serveur.

### 9.4 Realtime
Écouter `generations` (par `user_id`) pour pousser progression et « Ta création est prête ».

---

## 10. MCP likyAI (utilisable par Claude, ChatGPT, Gemini…)

**Objectif** : permettre à une IA de créer des images/vidéos/musiques/voix avec le compte et les crédits likyAI de l'utilisateur.

### 10.1 Architecture
- Serveur **MCP distant** en **Streamable HTTP** sur `https://<domaine>/mcp` (SDK TypeScript officiel `@modelcontextprotocol/sdk`, éventuellement `mcp-handler` pour Next.js/Vercel). Même logique métier que l'app (mêmes fonctions serveur : coût, réservation de crédits, registre) — **aucune duplication**.
- **Authentification** :
  - Phase 1 : **jeton personnel** (`liky_pat_…`, hashé en base, créé dans `/settings`, avec portées et **plafond de crédits par jour**) envoyé en `Authorization: Bearer`. Suffit pour Claude Code, Cursor, Gemini CLI, etc.
  - Phase 2 : **OAuth 2.1** (code + PKCE, enregistrement dynamique de client, métadonnées `/.well-known/oauth-*`) pour les connecteurs grand public (Claude.ai, ChatGPT). ⚠️ Vérifier les exigences actuelles de chaque client (transport, OAuth, taille des réponses) et si Supabase Auth peut servir de serveur d'autorisation.
- Les générations étant **longues**, les outils sont **asynchrones** : `create_*` renvoie un `generation_id` immédiatement ; `get_generation` renvoie statut/progression/URLs ; option : notifications de progression MCP quand le client les supporte.

### 10.2 Outils à exposer
| Outil | Rôle |
|---|---|
| `list_models(kind?)` | Modèles actifs, paramètres acceptés, coût indicatif |
| `estimate_cost(tool, model, params)` | Coût en crédits **avant** création |
| `generate_image(prompt, model?, aspect_ratio?, count?, quality?, reference_urls?)` | Crée des images |
| `generate_video(type, prompt, model?, aspect_ratio?, duration?, image_url?, avatar?, language?)` | Crée une vidéo (ugc/marketing/animation/saas/libre) |
| `generate_music(prompt, genre?, duration?, instrumental?, lyrics?)` | Crée un morceau |
| `generate_voice(text, voice?, language?, speed?)` | Crée une voix off |
| `get_generation(id)` / `list_generations(limit?, tool?)` | Suivi et bibliothèque |
| `get_credits()` | Solde |
| `upload_asset(url \| base64)` | Fournit une image/audio de référence |
| `enhance_prompt(text, tool)` | Améliore un prompt (modèle Chat) |

Ressources MCP : catalogue de modèles, guides de prompt par outil. Prompts MCP : « Pub produit », « UGC », « Clip musical ».

### 10.3 Sécurité et garde-fous (obligatoires)
Toute création **réserve des crédits** ; plafond quotidien par jeton ; `estimate_cost` avant les actions coûteuses ; **idempotency key** par appel ; rate limiting ; audit (qui/quoi/quand/coût) ; validation stricte des URLs d'entrée (anti-SSRF) ; pas d'injection depuis du contenu non fiable (traiter les prompts reçus comme des données) ; réponses courtes (liens signés, pas de binaires).

### 10.4 Documentation
Page `/docs/mcp` : URL du serveur, création du jeton, extraits de configuration pour Claude, ChatGPT, Gemini CLI, Cursor, exemples de prompts, limites. Exposer aussi `/llms.txt` pour les agents.

---

## 11. Sécurité, conformité, modération
- **Contenu** : filtrer prompts (violence graphique, sexuel, mineurs, haine, usurpation) ; s'appuyer aussi sur la modération des modèles kie et gérer leurs refus avec un message clair + remboursement.
- **UGC / avatars / voix** : interdire l'usage de la ressemblance d'une personne sans consentement ; case de consentement lors de l'upload de visage ou de voix ; CGU explicites.
- **Données** : chiffrement en transit ; secrets en variables d'environnement ; rotation des clés ; RLS testée ; journalisation sans données sensibles.
- Anti-abus : limites de débit par IP/utilisateur, vérification téléphone, détection de comptes multiples pour les crédits offerts.
- Droits : définir dans les CGU la propriété des créations et l'usage commercial selon les conditions des modèles ; ⚠️ vérifier les conditions de kie.ai et des fournisseurs avant de promettre un usage commercial.

---

## 12. Variables d'environnement
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # serveur uniquement
KIE_API_KEY=                        # serveur uniquement
KIE_WEBHOOK_HMAC_KEY=               # https://kie.ai/settings
KIE_CALLBACK_BASE_URL=https://<domaine>
PAYMENT_PROVIDER=…  PAYMENT_API_KEY=…  PAYMENT_WEBHOOK_SECRET=…
APP_URL=https://<domaine>
MCP_TOKEN_PEPPER=                   # pour hasher les jetons
```

---

## 13. Plan de réalisation (ordre conseillé)
1. **Socle** : Next.js + Tailwind v4 + shadcn + coss + tokens likyAI (clair/sombre) + polices + icônes + Supabase (schéma, RLS, auth).
2. **Auth** : `@efferd/auth-2` adapté et branché.
3. **Shell** : navigation flottante, bulle de profil, canvas à points, thème, `/home`.
4. **Registre de modèles** + 1 modèle par outil de bout en bout : image (Nano Banana 2.1), vidéo (Seedance ou Kling), musique (Suno V6), voix (ElevenLabs Turbo 2.5). Flux §6 complet (réservation → kie → webhook → Storage → capture/refund).
5. **Crédits + paiement mobile money** (sandbox puis production) + `/credits` + historique.
6. **Prompt bar** (base `prompt-bar.tsx`) avec coûts dynamiques, `@` références, `/` types.
7. **Types vidéo** (UGC pipeline, marketing, animer, SaaS, libre) + `thinking-state`.
8. **Bibliothèque**, favoris, téléchargement, partage.
9. **MCP phase 1** (jetons) → doc `/docs/mcp` → **phase 2 OAuth**.
10. **Pages légales** (`/privacy`, `/terms`) + `/faq`.
11. Élargir le catalogue (autres modèles, upscale/remove-bg, extension vidéo), i18n EN.
12. **Landing page** (plus tard) sur `/`.

### Définition de « terminé » pour une génération
Le coût est affiché avant ; les crédits sont réservés ; le résultat est copié dans Storage ; les crédits sont capturés (succès) ou rendus (échec/annulation) ; l'utilisateur voit l'état à chaque étape ; l'événement est idempotent ; une trace existe dans `generations` et le ledger.

---

## 14. Points ouverts à confirmer avec le propriétaire
- Agrégateur de paiement et pays de lancement.
- Prix des packs, marge cible, crédits de bienvenue.
- Langues d'interface au lancement et **langues vocales** réellement garanties.
- Politique de rétention des créations et RGPD/droit local (validation juridique).
- Catalogue initial exact (après tests de qualité).
- Nom de domaine et hébergement de Sentient (licence).
- Composants beautiful.dev à retenir.
