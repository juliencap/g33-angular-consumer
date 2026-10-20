import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, signal } from '@angular/core';
// Types générés par Stencil (components.d.ts) — alias déclaré dans tsconfig.json
// car le package du DS n'expose pas encore ses types dans "exports".
import type { Components } from 'girondins33-design-system/types';

type AlertType = Components.G33Alert['type'];
type ButtonVariant = Components.G33Button['variant'];
type ButtonSize = Components.G33Button['size'];

interface Theme {
  id: string;
  label: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  radius: string;
}

const THEMES: Theme[] = [
  { id: 'g33', label: 'Girondins (défaut)', primary: '#123c7c', primaryHover: '#0f3368', secondary: '#bd0000', radius: '0.5rem' },
  { id: 'bordeaux', label: 'Bordeaux', primary: '#7b1e3a', primaryHover: '#5e162c', secondary: '#c9a227', radius: '0.25rem' },
  { id: 'ocean', label: 'Océan', primary: '#00708a', primaryHover: '#005a6f', secondary: '#ff6b35', radius: '999px' },
];

@Component({
  selector: 'app-tokens-playground',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section aria-labelledby="tokens-title">
      <h2 id="tokens-title">Design Tokens en direct</h2>
      <p class="intro">
        Les composants lisent des variables CSS (<code>--g33-*</code>). Angular les surcharge sur un conteneur
        avec <code>[style.--g33-color-primary]</code> : les variables CSS héritent à travers le Shadow DOM, le thème change
        sans toucher au code du Design System.
      </p>

      <div class="themes" role="radiogroup" aria-label="Thème">
        @for (t of themes; track t.id) {
          <g33-button
            size="sm"
            [variant]="t.id === theme().id ? 'primary' : 'secondary'"
            role="radio"
            [attr.aria-checked]="t.id === theme().id"
            (click)="theme.set(t)"
          >
            {{ t.label }}
          </g33-button>
        }
      </div>

      <div
        class="preview"
        [style.--g33-color-primary]="theme().primary"
        [style.--g33-color-primary-hover]="theme().primaryHover"
        [style.--g33-color-secondary]="theme().secondary"
        [style.--g33-radius-md]="theme().radius"
      >
        <div class="row">
          @for (v of variants; track v) {
            <g33-button [variant]="v" (click)="lastClick.set(v)">{{ v }}</g33-button>
          }
          <g33-button disabled>disabled</g33-button>
        </div>

        <div class="row on-dark">
          @for (s of sizes; track s) {
            <g33-button variant="ghost" [size]="s" (click)="lastClick.set('ghost ' + s)">ghost {{ s }}</g33-button>
          }
        </div>

        @for (a of alerts; track a) {
          <g33-alert [type]="a">Alerte <strong>{{ a }}</strong> projetée dans le slot du Web Component.</g33-alert>
        }

        <p class="log" aria-live="polite">{{ lastClickLabel() }}</p>
      </div>
    </section>
  `,
  styles: `
    .intro { color: #555; max-width: 70ch; }
    .themes { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 16px; }
    .preview {
      display: grid;
      gap: 16px;
      padding: 24px;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
    }
    /*
     * Contournement : le DS redéclare ses tokens sur ":host" dans chaque Shadow DOM,
     * ce qui bloque l'héritage depuis l'app. Une règle externe sur l'élément hôte
     * l'emporte sur ":host" → on force l'héritage des tokens surchargés.
     * Correctif propre côté DS : déclarer les tokens sur ":root" uniquement.
     */
    .preview :is(g33-button, g33-alert) {
      --g33-color-primary: inherit;
      --g33-color-primary-hover: inherit;
      --g33-color-secondary: inherit;
      --g33-radius-md: inherit;
    }
    .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .on-dark { padding: 16px; border-radius: 8px; background: var(--g33-color-primary); transition: background 0.2s; }
    .log { margin: 0; font-size: 0.875rem; color: #777; }
  `,
})
export class TokensPlayground {
  protected readonly themes = THEMES;
  // « ghost » est pensé pour fond sombre : il est démontré dans la rangée suivante.
  protected readonly variants: ButtonVariant[] = ['primary', 'secondary'];
  protected readonly sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly alerts: AlertType[] = ['info', 'success', 'warning', 'error'];

  protected readonly theme = signal(THEMES[0]);
  protected readonly lastClick = signal<string | null>(null);
  protected readonly lastClickLabel = computed(() =>
    this.lastClick() ? `(click) Angular reçu depuis <g33-button variant="${this.lastClick()}">` : 'Clique sur un bouton du Design System.',
  );
}
