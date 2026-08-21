import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { paperSchema } from './schemas/paper';

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/papers' }),
  schema: paperSchema,
});

const threads = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/threads' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    order: z.number(),
    key: z.enum(['reasoning', 'representations', 'physics']),
  }),
});

export const collections = { papers, threads };
