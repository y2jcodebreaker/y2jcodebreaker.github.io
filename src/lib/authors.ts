import type { Paper } from '../schemas/paper';

export interface AuthorToken {
  name: string;
  isSelf: boolean;
}

export function formatAuthors(paper: Paper, selfName: string): AuthorToken[] {
  return paper.authors.map((name) => ({ name, isSelf: name === selfName }));
}

export function contributionNote(paper: Paper, selfName: string): string | null {
  if (paper.firstAuthor) return 'First author.';
  if (paper.equalContrib.includes(selfName)) return 'Equal contribution.';
  return null;
}
