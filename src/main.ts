import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'girondins33-design-system/loader';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Enregistre les Web Components du Design System (chargement lazy, composant par composant).
// Les bundles Stencil sont copiés dans /build par angular.json (assets).
defineCustomElements(window, {
  resourcesUrl: '/build/girondins33-design-system/',
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
