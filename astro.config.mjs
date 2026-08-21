import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kedarjoshi.github.io',
  base: '/',
  output: 'static',
  integrations: [mdx(), sitemap()],
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
