import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://kedarjoshi.github.io',
  base: '/',
  output: 'static',
  integrations: [mdx()],
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
