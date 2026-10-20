import { Component, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Bloc « HeroBanner » tel que défini dans Storyblok. */
interface StoryblokHeroBlock {
  component: 'HeroBanner';
  titleText: string;
  subtitle?: string;
  image?: { filename: string; alt?: string };
  ctaLabel?: string;
  ctaUrl?: { url?: string; target?: string };
}

interface StoryblokStory {
  story: { content: { body: Array<{ component: string }> } };
}

@Component({
  selector: 'app-hero-storyblok',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (!hasToken) {
      <g33-alert type="warning">
        Aucun token Storyblok : ajoute <code>STORYBLOK_TOKEN</code> dans <code>.env</code> (ou dans les variables Vercel).
      </g33-alert>
    } @else if (story.error()) {
      <g33-alert type="error">Le hero Storyblok n'a pas pu être chargé.</g33-alert>
    } @else if (hero(); as h) {
      <g33-hero-banner
        [titleText]="h.titleText"
        [subtitle]="h.subtitle"
        [imageUrl]="h.image?.filename"
        [imageAlt]="h.image?.alt"
        [ctaLabel]="h.ctaLabel"
        [ctaUrl]="h.ctaUrl?.url || '#'"
        [ctaTarget]="h.ctaUrl?.target"
      />
    } @else {
      <div class="hero-skeleton" aria-busy="true">Chargement du contenu Storyblok…</div>
    }
  `,
  styles: `
    .hero-skeleton {
      display: grid;
      place-items: center;
      min-height: 320px;
      border-radius: var(--g33-radius-md, 8px);
      background: #f1f3f6;
      color: var(--g33-color-text-light, #777);
    }
  `,
})
export class HeroStoryblok {
  protected readonly hasToken = !!environment.storyblokToken;

  /** undefined = pas de requête (aucun token) : httpResource reste inactif. */
  protected readonly story = httpResource<StoryblokStory>(() =>
    this.hasToken
      ? {
          url: 'https://api.storyblok.com/v2/cdn/stories/home',
          params: { version: 'draft', token: environment.storyblokToken },
        }
      : undefined,
  );

  protected readonly hero = computed(() =>
    this.story.hasValue()
      ? (this.story.value().story.content.body.find((b) => b.component === 'HeroBanner') as
          | StoryblokHeroBlock
          | undefined)
      : undefined,
  );
}
