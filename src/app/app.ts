import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeroStoryblok } from './components/hero-storyblok';
import { LatestNews } from './components/latest-news';
import { TokensPlayground } from './components/tokens-playground';

@Component({
  selector: 'app-root',
  imports: [HeroStoryblok, LatestNews, TokensPlayground],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly links = {
    designSystem: 'https://github.com/juliencap/g33-stencil-design-system',
    designSystemDemo: 'https://g33-stencil-design-system.vercel.app/',
    reactConsumer: 'https://github.com/juliencap/g33-react-consumer',
    angularConsumer: 'https://github.com/juliencap/g33-angular-consumer',
  };
}
