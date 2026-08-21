import { describe, expect, it } from 'vitest';
import { formatAuthors, contributionNote } from '../../src/lib/authors';
import type { Paper } from '../../src/schemas/paper';

const paper = (over: Partial<Paper>): Paper => ({
  title: 'T', authors: ['A'], equalContrib: [], firstAuthor: false,
  year: 2026, thread: 'reasoning', status: 'published',
  tldr: 'x', order: 1, ...over,
} as Paper);

describe('formatAuthors', () => {
  it('marks the self author', () => {
    const tokens = formatAuthors(
      paper({ authors: ['Abhilekh Borah', 'Kedar Joshi'] }), 'Kedar Joshi');
    expect(tokens).toEqual([
      { name: 'Abhilekh Borah', isSelf: false },
      { name: 'Kedar Joshi', isSelf: true },
    ]);
  });

  it('marks nobody when the self name is absent', () => {
    const tokens = formatAuthors(paper({ authors: ['Someone Else'] }), 'Kedar Joshi');
    expect(tokens.every((t) => !t.isSelf)).toBe(true);
  });
});

describe('contributionNote', () => {
  it('reports first authorship', () => {
    const note = contributionNote(
      paper({ authors: ['Kedar Joshi', 'K Ghosh'], firstAuthor: true }), 'Kedar Joshi');
    expect(note).toBe('First author.');
  });

  it('reports equal contribution when self is included', () => {
    const note = contributionNote(
      paper({
        authors: ['A', 'Kedar Joshi', 'C'],
        equalContrib: ['A', 'Kedar Joshi', 'C'],
      }),
      'Kedar Joshi',
    );
    expect(note).toBe('Equal contribution.');
  });

  it('returns null when neither applies', () => {
    const note = contributionNote(paper({ authors: ['A', 'Kedar Joshi'] }), 'Kedar Joshi');
    expect(note).toBeNull();
  });

  it('prefers first authorship over equal contribution', () => {
    const note = contributionNote(
      paper({
        authors: ['Kedar Joshi', 'B'],
        firstAuthor: true,
        equalContrib: ['Kedar Joshi', 'B'],
      }),
      'Kedar Joshi',
    );
    expect(note).toBe('First author.');
  });
});
