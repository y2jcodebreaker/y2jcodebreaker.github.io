import type { Paper } from '../schemas/paper';

/** A null order means the entry is authored but deliberately not published. */
export function isRendered(paper: Paper): boolean {
  return paper.order !== null;
}

export function sortPapers(papers: Paper[]): Paper[] {
  return papers
    .filter(isRendered)
    .slice()
    .sort((a, b) => (a.order! - b.order!) || (b.year - a.year));
}

export function groupByThread(papers: Paper[]): Map<Paper['thread'], Paper[]> {
  const groups = new Map<Paper['thread'], Paper[]>();
  for (const paper of sortPapers(papers)) {
    const existing = groups.get(paper.thread) ?? [];
    existing.push(paper);
    groups.set(paper.thread, existing);
  }
  return groups;
}
