import { describe, expect, it } from 'vitest';
import { isRendered, sortPapers, groupByThread } from '../../src/lib/papers';
import type { Paper } from '../../src/schemas/paper';

const make = (over: Partial<Paper>): Paper => ({
  title: 'T', authors: ['Kedar Joshi'], equalContrib: [], firstAuthor: false,
  year: 2026, thread: 'reasoning', status: 'published',
  tldr: 'x', order: 1, ...over,
} as Paper);

describe('isRendered', () => {
  it('excludes papers with a null order', () => {
    expect(isRendered(make({ order: null }))).toBe(false);
  });
  it('includes papers with a numeric order', () => {
    expect(isRendered(make({ order: 2 }))).toBe(true);
  });
  it('includes order zero', () => {
    expect(isRendered(make({ order: 0 }))).toBe(true);
  });
});

describe('sortPapers', () => {
  it('sorts by order ascending', () => {
    const sorted = sortPapers([
      make({ title: 'B', order: 2 }),
      make({ title: 'A', order: 1 }),
    ]);
    expect(sorted.map((p) => p.title)).toEqual(['A', 'B']);
  });

  it('breaks ties by year descending', () => {
    const sorted = sortPapers([
      make({ title: 'Old', order: 1, year: 2024 }),
      make({ title: 'New', order: 1, year: 2026 }),
    ]);
    expect(sorted.map((p) => p.title)).toEqual(['New', 'Old']);
  });

  it('drops unrendered papers', () => {
    const sorted = sortPapers([make({ title: 'Hidden', order: null })]);
    expect(sorted).toHaveLength(0);
  });
});

describe('groupByThread', () => {
  it('groups papers under their thread key', () => {
    const groups = groupByThread([
      make({ title: 'R', thread: 'reasoning' }),
      make({ title: 'P', thread: 'physics' }),
    ]);
    expect(groups.get('reasoning')?.map((p) => p.title)).toEqual(['R']);
    expect(groups.get('physics')?.map((p) => p.title)).toEqual(['P']);
  });

  it('omits threads with no rendered papers', () => {
    const groups = groupByThread([make({ thread: 'reasoning' })]);
    expect(groups.has('earlier')).toBe(false);
  });
});
