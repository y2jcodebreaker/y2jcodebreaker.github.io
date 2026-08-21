import { describe, expect, it } from 'vitest';
import { paperSchema } from '../../src/schemas/paper';

const base = {
  title: 'A Paper',
  authors: ['Kedar Joshi'],
  year: 2026,
  thread: 'reasoning' as const,
  status: 'published' as const,
  tldr: 'A claim without any figures in it.',
  order: 1,
};

describe('paperSchema — AAAI-27 venue guard', () => {
  it('rejects a preprint that names a venue', () => {
    const result = paperSchema.safeParse({
      ...base, status: 'preprint', venue: 'AAAI 2027',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a preprint with no venue', () => {
    const result = paperSchema.safeParse({ ...base, status: 'preprint' });
    expect(result.success).toBe(true);
  });

  it('accepts a published paper that names a venue', () => {
    const result = paperSchema.safeParse({
      ...base, status: 'published', venue: 'EACL 2026',
    });
    expect(result.success).toBe(true);
  });
});

describe('paperSchema — claim discipline guard', () => {
  it('rejects a percentage claim with no source', () => {
    const result = paperSchema.safeParse({
      ...base, tldr: 'Models lose up to 86% accuracy under rewrites.',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a percentage claim that cites a source', () => {
    const result = paperSchema.safeParse({
      ...base,
      tldr: 'Models lose up to 86% accuracy under rewrites.',
      source: 'Figure 2, zero-shot',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a decimal effect size with no source', () => {
    const result = paperSchema.safeParse({
      ...base, tldr: 'Matches CAA debiasing at d = 0.337.',
    });
    expect(result.success).toBe(false);
  });

  it('allows incidental digits in model and dataset names', () => {
    const result = paperSchema.safeParse({
      ...base,
      tldr: 'Evaluated on GPT-4o, Llama-3.1-8B and Celeb-DF (v2) across 245K-50M params.',
    });
    expect(result.success).toBe(true);
  });
});

describe('paperSchema — field constraints', () => {
  it('rejects a tldr longer than 180 characters', () => {
    const result = paperSchema.safeParse({ ...base, tldr: 'x'.repeat(181) });
    expect(result.success).toBe(false);
  });

  it('accepts a null order, meaning authored but not rendered', () => {
    const result = paperSchema.safeParse({ ...base, order: null });
    expect(result.success).toBe(true);
  });

  it('defaults equalContrib to an empty array', () => {
    const result = paperSchema.parse(base);
    expect(result.equalContrib).toEqual([]);
  });

  it('defaults firstAuthor to false', () => {
    const result = paperSchema.parse(base);
    expect(result.firstAuthor).toBe(false);
  });
});
