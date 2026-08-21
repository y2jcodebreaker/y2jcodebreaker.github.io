import { z } from 'zod';

/**
 * Matches percentages and decimals — the shapes a performance claim takes.
 * Deliberately does NOT match incidental digits in names and ranges
 * (GPT-4o, Celeb-DF (v2), 245K-50M, Llama-3.1-8B). A naive /\d/ would fire
 * on all of those and train the author to ignore the guard, defeating it.
 *
 * Strategy: Use negative lookbehind to exclude decimals glued to existing tokens.
 * A decimal is "incidental" only when preceded by alphanumeric/hyphen/dot (token-internal).
 * Decimals preceded by space, equals, or string-initial trigger the guard.
 * This allows "d=0.337" and "0.86 accuracy" to correctly require sources.
 */
export const QUANTITATIVE_CLAIM = /%|(?<![A-Za-z0-9.-])\d+\.\d+/;

export const paperSchema = z
  .object({
    title: z.string().min(1),
    authors: z.array(z.string()).min(1),
    equalContrib: z.array(z.string()).default([]),
    firstAuthor: z.boolean().default(false),
    year: z.number().int(),
    thread: z.enum(['reasoning', 'representations', 'physics', 'earlier']),
    status: z.enum(['published', 'preprint', 'patent']),
    venue: z.string().optional(),
    tldr: z.string().max(180),
    source: z.string().optional(),
    order: z.number().nullable(),
    pdf: z.string().optional(),
    code: z.string().optional(),
    data: z.string().optional(),
    doi: z.string().optional(),
    bibtex: z.string().optional(),
  })
  .refine((p) => !(p.status === 'preprint' && p.venue), {
    message:
      'A preprint must not name a venue. Non-anonymous material may not reference ' +
      'submission status. See AAAI-27 blind review policy.',
    path: ['venue'],
  })
  .refine((p) => !QUANTITATIVE_CLAIM.test(p.tldr) || Boolean(p.source), {
    message:
      'A tldr stating a percentage or decimal must cite the paper section it came from ' +
      'via the `source` field.',
    path: ['source'],
  });

export type Paper = z.infer<typeof paperSchema>;
