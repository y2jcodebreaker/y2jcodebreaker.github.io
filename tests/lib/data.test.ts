import { describe, expect, it } from 'vitest';
import { loadProfile, loadCv } from '../../src/lib/data';

describe('loadProfile', () => {
  it('parses profile.yml against the schema', () => {
    const profile = loadProfile();
    expect(profile.name).toBe('Kedar Joshi');
    expect(profile.email).toContain('@');
  });

  it('defaults links to an object when absent', () => {
    const profile = loadProfile();
    expect(typeof profile.links).toBe('object');
  });
});

describe('loadCv', () => {
  it('parses cv.yml and finds the USC entry', () => {
    const cv = loadCv();
    const usc = cv.education.find((e) => e.heading.includes('Southern California'));
    expect(usc).toBeDefined();
  });
});
