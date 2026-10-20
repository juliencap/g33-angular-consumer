// Génère src/environments/environment.ts à partir de .env (en local)
// ou des variables d'environnement (Vercel). Équivalent Angular de VITE_*.
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';

const env = {
  storyblokToken: process.env.STORYBLOK_TOKEN ?? '',
  wordpressApiUrl: process.env.WORDPRESS_API_URL ?? 'https://admin.girondins33.com/wp-json/wp/v2',
};

mkdirSync('src/environments', { recursive: true });
writeFileSync(
  'src/environments/environment.ts',
  `// Fichier généré par scripts/set-env.mjs — ne pas modifier, ne pas versionner.
export const environment = ${JSON.stringify(env, null, 2)} as const;
`,
);

console.log(`environment.ts généré (Storyblok : ${env.storyblokToken ? 'token présent' : 'pas de token'})`);
