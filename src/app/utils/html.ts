/** Décode les entités HTML renvoyées par WordPress (&#8217;, &amp;…). */
export function decodeHtml(html: string): string {
  return new DOMParser().parseFromString(html, 'text/html').documentElement.textContent ?? '';
}
