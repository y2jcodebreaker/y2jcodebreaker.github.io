import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://y2jcodebreaker.github.io',
  base: '/',
  output: 'static',
  integrations: [mdx(), sitemap()],
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
  // The CAD preprint was replaced by its revised version; keep old links working.
  redirects: { '/papers/cad': '/papers/debiasing-scores' },
});
