# Girondins33 Angular Consumer

Application Angular qui consomme les Web Components du
[G33 Design System](https://github.com/juliencap/g33-stencil-design-system) (StencilJS).
C'est le pendant Angular du [React Consumer](https://github.com/juliencap/g33-react-consumer) :
**même bibliothèque, aucun code spécifique au framework dans le Design System.**

## Fonctionnalités

- Consommation des Web Components Stencil (`g33-hero-banner`, `g33-content-card`, `g33-button`, `g33-alert`)
- Hero Banner piloté par **Storyblok** (headless CMS)
- Dernières actualités via l'**API REST WordPress** de Girondins33, avec « Charger plus »
- **Design Tokens en direct** : changement de thème à chaud via les variables CSS `--g33-*`
- Angular 22 : composants standalone, **Signals** (`signal`, `computed`, `linkedSignal`), `httpResource`, zoneless, nouveau control flow (`@if`, `@for`)

## Architecture

```text
Storyblok ──────────► HeroStoryblok ───► <g33-hero-banner>
WordPress REST API ─► LatestNews ──────► <g33-content-card> + <g33-button>
                      TokensPlayground ► <g33-button> / <g33-alert> + tokens --g33-*
```

## Intégration du Design System dans Angular

### 1. Installation

Le Design System est installé directement depuis GitHub :

```bash
npm install github:juliencap/g33-stencil-design-system
```

### 2. Enregistrement des Web Components (`src/main.ts`)

```ts
import { defineCustomElements } from 'girondins33-design-system/loader';

defineCustomElements(window, { resourcesUrl: '/build/girondins33-design-system/' });
```

Le loader Stencil enregistre les balises `g33-*` et charge chaque composant à la demande.

### 3. Autoriser les balises personnalisées

Chaque composant Angular qui utilise une balise `g33-*` déclare :

```ts
@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
```

### 4. Attributs ou propriétés ?

```html
<!-- Valeur statique : attribut HTML en kebab-case -->
<g33-hero-banner title-text="Girondins33" cta-target="_blank" />

<!-- Valeur dynamique : binding de propriété en camelCase -->
<g33-content-card [contentTitle]="item.title" [showCta]="showCta()" />
```

Angular écrit une valeur statique comme **attribut** (que Stencil lit en kebab-case) et une valeur liée
`[prop]` comme **propriété JS** (camelCase, avec le vrai type : booléen, objet…).

### 5. Événements

Les clics natifs remontent depuis le Shadow DOM : `(click)` fonctionne directement sur `<g33-button>`.
Un futur `@Event()` Stencil (ex. `g33Change`) s'écoutera de la même façon : `(g33Change)="onChange($event.detail)"`.

### 6. Typage

Les types générés par Stencil (`components.d.ts`) sont réutilisés côté Angular :

```ts
import type { Components } from 'girondins33-design-system/types';
type ButtonVariant = Components.G33Button['variant']; // 'primary' | 'secondary' | 'ghost'
```

L'alias `girondins33-design-system/types` est déclaré dans `tsconfig.json`, car le `package.json` du
Design System n'expose pas encore ses types dans `exports`.

## Design Tokens et Shadow DOM

Les composants lisent des variables CSS (`--g33-color-primary`, `--g33-radius-md`…). L'app les surcharge
sur un conteneur :

```html
<div [style.--g33-color-primary]="theme().primary">…</div>
```

**Point relevé pendant l'intégration :** le Design System déclare ses tokens sur `:host, :root`, et Stencil
injecte ce style global dans chaque Shadow DOM. Le `:host` redéfinit donc les tokens dans chaque composant
et bloque l'héritage depuis l'application. Le consumer contourne ce point avec une règle externe sur
l'élément hôte (qui l'emporte sur `:host`) :

```css
.preview :is(g33-button, g33-alert) { --g33-color-primary: inherit; }
```

Correctif propre côté Design System : déclarer les tokens sur `:root` uniquement. Ils héritent alors
naturellement dans tous les Shadow DOM, et n'importe quelle application peut les surcharger.

## Pistes d'évolution

- **Output target Angular** (`@stencil/angular-output-target`) dans le Design System : wrappers Angular
  générés, typage des inputs dans les templates (plus besoin de `CUSTOM_ELEMENTS_SCHEMA`) et
  `ControlValueAccessor` pour brancher de futurs composants de formulaire sur les Reactive Forms.
- Publication du Design System sur npm (ou GitHub Packages) avec `exports` complet (types, CSS des tokens).

## Démarrage

```bash
cp .env.example .env   # renseigner STORYBLOK_TOKEN
npm install
npm start              # http://localhost:4200
```

`scripts/set-env.mjs` génère `src/environments/environment.ts` à partir de `.env` (ou des variables
d'environnement sur Vercel) avant `start` et `build`. Sans token, le hero Storyblok affiche une alerte
au lieu de casser la page.

## Déploiement Vercel

- Framework : Angular (détecté automatiquement)
- Build : `npm run build`
- Output : `dist/g33-angular-consumer/browser`
- Variable d'environnement : `STORYBLOK_TOKEN`

## Stack

Angular 22 · TypeScript · StencilJS / Web Components · Storyblok · WordPress REST API · Vercel
