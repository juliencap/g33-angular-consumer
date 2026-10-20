import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, linkedSignal, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { decodeHtml } from '../utils/html';

/** Réponse brute de l'API WordPress (custom post type « actualite »). */
interface WpNews {
  id: number;
  title: { rendered: string };
  link: string;
  date: string;
  yoast_head_json?: {
    og_description?: string;
    og_image?: { url: string }[];
  };
  _embedded?: {
    'wp:term'?: { id: number; name: string; slug: string }[][];
  };
}

/** Modèle prêt à être passé en propriétés à <g33-content-card>. */
interface NewsCard {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  publishedDateTime: string;
  url: string;
}

const PAGE_SIZE = 6;
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

function toCard(item: WpNews): NewsCard {
  return {
    id: item.id,
    title: decodeHtml(item.title.rendered),
    category: decodeHtml(item._embedded?.['wp:term']?.[0]?.[0]?.name ?? 'Actualités'),
    excerpt: decodeHtml(item.yoast_head_json?.og_description ?? ''),
    imageUrl: item.yoast_head_json?.og_image?.[0]?.url ?? '',
    publishedAt: dateFormatter.format(new Date(item.date)),
    publishedDateTime: item.date.split('T')[0],
    url: item.link,
  };
}

@Component({
  selector: 'app-latest-news',
  // Autorise les balises inconnues d'Angular : ici, les Web Components g33-*.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="news" aria-labelledby="news-title">
      <h2 id="news-title">Dernières actualités</h2>

      @if (news.error()) {
        <g33-alert type="error">Impossible de charger les actualités WordPress.</g33-alert>
      }

      <div class="news-grid">
        @for (item of cards(); track item.id) {
          <!-- Binding de propriétés (camelCase) : Angular passe des valeurs JS, pas des attributs texte. -->
          <g33-content-card
            [contentTitle]="item.title"
            [category]="item.category"
            [excerpt]="item.excerpt"
            [imageUrl]="item.imageUrl"
            author="Girondins33"
            [publishedAt]="item.publishedAt"
            [publishedDateTime]="item.publishedDateTime"
            [contentUrl]="item.url"
            [showCta]="showCta()"
          />
        } @empty {
          @if (news.isLoading()) {
            @for (_ of skeletons; track $index) {
              <div class="skeleton" aria-hidden="true"></div>
            }
          }
        }
      </div>

      <div class="news-actions">
        <g33-button variant="secondary" size="sm" (click)="showCta.set(!showCta())">
          {{ showCta() ? 'Masquer' : 'Afficher' }} les boutons « Lire la suite »
        </g33-button>
        <g33-button [disabled]="news.isLoading() || !hasMore()" (click)="loadMore()">
          {{ news.isLoading() ? 'Chargement…' : 'Charger plus' }}
        </g33-button>
      </div>
    </section>
  `,
  styles: `
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--g33-spacing-lg, 24px);
      margin-block: 24px;
    }
    .news-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .skeleton {
      min-height: 360px;
      border-radius: var(--g33-radius-md, 8px);
      background: linear-gradient(90deg, #eee 25%, #f6f6f6 50%, #eee 75%) 0 0 / 200% 100%;
      animation: shimmer 1.2s infinite linear;
    }
    @keyframes shimmer { to { background-position: -200% 0; } }
  `,
})
export class LatestNews {
  protected readonly perPage = signal(PAGE_SIZE);
  protected readonly showCta = signal(false);
  protected readonly skeletons = Array.from({ length: PAGE_SIZE });

  /** Requête réactive : se relance dès que perPage change. */
  protected readonly news = httpResource<WpNews[]>(() => ({
    url: `${environment.wordpressApiUrl}/actualite`,
    params: { per_page: this.perPage(), orderby: 'date', order: 'desc', _embed: '' },
  }));

  /**
   * linkedSignal garde les cartes précédentes pendant le rechargement
   * (« Charger plus ») : pas de clignotement vers les skeletons.
   */
  protected readonly cards = linkedSignal<NewsCard[] | undefined, NewsCard[]>({
    source: () => (this.news.hasValue() ? this.news.value().map(toCard) : undefined),
    computation: (fresh, previous) => fresh ?? previous?.value ?? [],
  });

  /** WordPress limite per_page à 100 ; s'il renvoie moins que demandé, on a tout. */
  protected readonly hasMore = computed(
    () => this.perPage() < 100 && this.cards().length === this.perPage(),
  );

  protected loadMore(): void {
    this.perPage.update((n) => Math.min(n + PAGE_SIZE, 100));
  }
}
