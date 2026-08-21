# Academic Research Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fast, austere, statically-generated academic research website for Kedar Joshi, deployed to GitHub Pages, whose content model makes unsupported claims and AAAI policy violations impossible at build time.

**Architecture:** Astro 5 with static output and zero client-side JavaScript. Content lives in Markdown and YAML validated by Zod schemas defined in plain, framework-free modules so the validation rules are unit-testable in isolation. A single-scroll homepage renders research grouped into threads; two papers get detail pages generated from the same Markdown files that produce their homepage rows.

**Tech Stack:** Astro 5, TypeScript, Zod, js-yaml, Vitest (unit), Playwright (smoke), GitHub Actions, GitHub Pages.

**Source spec:** `docs/superpowers/specs/2026-08-21-resume-website-design.md`

## Global Constraints

- **Zero client-side JavaScript** in v1. No framework integrations, no hydrated islands.
- **Performance budget:** ≤95 KB gzipped transfer for `/`, excluding the photo. LCP < 1.0s, INP < 200ms, **CLS = 0**. Both real font weights are kept; the budget was raised to accommodate them rather than accept browser-synthesized faux bold.
- **Lighthouse ≥ 98** on all four categories. CI fails below.
- **Accessibility: WCAG 2.2 AA.** 16px font floor, contrast ≥ 4.5:1 in both themes, single `h1`, no skipped heading levels, visible focus rings, full keyboard operation.
- **No animation anywhere.** No transitions, no scroll effects, no fade-ins.
- **All images carry explicit `width` and `height`** attributes. This is how CLS stays at zero.
- **AAAI-27 policy:** a paper with `status: preprint` must never display a venue, "submitted", or "under review". Enforced by schema.
- **Claim discipline:** any `tldr` containing a percentage or decimal must supply a `source`. Enforced by schema.
- **Emphasis within body copy is reserved for numbers.** Do not bold words inside sentences to manufacture emphasis. Structural weight on headings (`h1`–`h3` at 600) is typography, not emphasis, and is explicitly permitted. `font-synthesis: none` is set so no faux bold can ever render.
- **Prohibited words in all site copy:** "revolutionary", "novel", "cutting-edge", "pioneering", "significant improvements", "state-of-the-art" (as self-description).
- **Deploy target:** repo `kedarjoshi.github.io`, `site: 'https://kedarjoshi.github.io'`, `base: '/'`.
- **`/cv.pdf` is a permanent URL.** It must never move or 404.

---

### Task 1: Repository scaffold and Astro skeleton

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: nothing
- Produces: a building Astro project; `npm run build` emits `dist/`; `npm test` runs Vitest.

- [ ] **Step 1: Initialise the repository and Node project**

```bash
cd /Users/lichking/Documents/ResumeWebsite
git init
npm init -y
npm install astro@^5 @astrojs/mdx zod js-yaml
npm install -D typescript @types/node @types/js-yaml vitest
```

- [ ] **Step 2: Write `package.json` scripts**

Replace the `"scripts"` block in `package.json` with:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
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
```

**MDX is required, not optional.** Plain `.md` files in Astro cannot render components — a `<Figure />` tag in a `.md` body is emitted as literal text or dropped. The two papers with detail pages use `.mdx` so their figures work; the frontmatter-only papers stay `.md`. MDX adds no client-side JavaScript: it compiles to static HTML at build time, so the zero-JS constraint holds.

`inlineStylesheets: 'always'` matters for the performance budget — the CSS is small enough that a separate request costs more than the bytes save.

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
*.log
test-results/
playwright-report/
```

- [ ] **Step 6: Create a placeholder homepage at `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Kedar Joshi</title>
  </head>
  <body>
    <h1>Kedar Joshi</h1>
  </body>
</html>
```

- [ ] **Step 7: Verify the build works**

Run: `npm run build`
Expected: build completes, `dist/index.html` exists.

- [ ] **Step 8: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 5 project with CI"
```

---

### Task 2: Paper schema with build-time guards

This is the task that makes the rest of the site safe. The two `.refine()` rules are the entire reason the content model exists; they convert editorial discipline into compiler errors.

**Files:**
- Create: `src/schemas/paper.ts`
- Test: `tests/schemas/paper.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `paperSchema` (a Zod object), `QUANTITATIVE_CLAIM` (RegExp), and the inferred type `Paper`. Task 4 imports `paperSchema` into the content config. Tasks 7–9 consume the `Paper` type.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `tests/schemas/paper.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run tests/schemas/paper.test.ts`
Expected: FAIL — cannot resolve `../../src/schemas/paper`.

- [ ] **Step 4: Write `src/schemas/paper.ts`**

```ts
import { z } from 'zod';

/**
 * Matches percentages and decimals — the shapes a performance claim takes.
 * Deliberately does NOT match incidental digits in names and ranges
 * (GPT-4o, Celeb-DF (v2), 245K-50M, Llama-3.1-8B). A naive /\d/ would fire
 * on all of those and train the author to ignore the guard, defeating it.
 */
export const QUANTITATIVE_CLAIM = /%|\d+\.\d+/;

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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/schemas/paper.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/schemas/paper.ts tests/schemas/paper.test.ts
git commit -m "feat(schema): add paper schema with AAAI venue and claim-discipline guards"
```

---

### Task 3: Profile and CV schemas with a YAML loader

**Files:**
- Create: `src/schemas/profile.ts`, `src/lib/data.ts`
- Create: `src/data/profile.yml`, `src/data/cv.yml`
- Test: `tests/lib/data.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `loadProfile(): Profile` and `loadCv(): Cv` from `src/lib/data.ts`. `Profile` has `name`, `role`, `positioning`, `email`, `links`, `photo`, `currently`. Tasks 8, 10, 11 consume these.

- [ ] **Step 1: Write `src/schemas/profile.ts`**

```ts
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  /** 2-3 sentences. The most-read text on the site. */
  positioning: z.string().min(1),
  /** Optional: current lab / project line. May be empty in week one. */
  currently: z.string().optional(),
  email: z.string().email(),
  photo: z.string().optional(),
  links: z
    .object({
      scholar: z.string().url().optional(),
      github: z.string().url().optional(),
      orcid: z.string().url().optional(),
    })
    .default({}),
});

export type Profile = z.infer<typeof profileSchema>;

const cvEntrySchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  location: z.string().optional(),
  dates: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const cvSchema = z.object({
  education: z.array(cvEntrySchema).default([]),
  experience: z.array(cvEntrySchema).default([]),
  skills: z.array(z.object({ label: z.string(), items: z.array(z.string()) })).default([]),
  certifications: z.array(cvEntrySchema).default([]),
});

export type Cv = z.infer<typeof cvSchema>;
```

- [ ] **Step 2: Write the failing test**

Create `tests/lib/data.test.ts`:

```ts
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
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run tests/lib/data.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/data`.

- [ ] **Step 4: Write `src/lib/data.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { profileSchema, cvSchema, type Profile, type Cv } from '../schemas/profile';

function readYaml(relativePath: string): unknown {
  const absolute = path.resolve(process.cwd(), relativePath);
  return yaml.load(fs.readFileSync(absolute, 'utf8'));
}

export function loadProfile(): Profile {
  return profileSchema.parse(readYaml('src/data/profile.yml'));
}

export function loadCv(): Cv {
  return cvSchema.parse(readYaml('src/data/cv.yml'));
}
```

- [ ] **Step 5: Write `src/data/profile.yml`**

`positioning` is a placeholder to be replaced with Kedar's own wording — the build must not block on it.

```yaml
name: Kedar Joshi
role: MS Computer Science, University of Southern California
positioning: >-
  I work on whether language models actually reason, and on reading the
  geometry of what they have learned well enough to intervene in it.
  Previously at IISER Kolkata and the India Meteorological Department.
currently: ""
email: joshikedar2003@gmail.com
photo: ""
links:
  github: https://github.com/
```

Leave `scholar` and `orcid` out entirely until the accounts exist — the schema treats them as optional, and a link to a non-existent profile is worse than no link.

- [ ] **Step 6: Write `src/data/cv.yml`**

```yaml
education:
  - heading: University of Southern California
    subheading: MS in Computer Science
    location: Los Angeles, CA
    dates: Aug 2026 – May 2028
    bullets: []
  - heading: Manipal University Jaipur
    subheading: B.Tech in Computer Science, with Distinction
    location: Jaipur, India
    dates: Graduated May 2026
    bullets:
      - CGPA 8.88/10

experience:
  - heading: Indian Institute of Science Education and Research, Kolkata
    subheading: Research Intern
    dates: May 2025 – Nov 2025
    bullets:
      - LLM reasoning robustness and mechanistic interpretability.
  - heading: India Meteorological Department, Bhopal
    subheading: Research Intern
    dates: Nov 2024 – Present
    bullets:
      - Physics-informed neural architecture search for radar wind reconstruction.

skills:
  - label: Languages
    items: [Python, C]
  - label: Frameworks
    items: [PyTorch, TensorFlow, HuggingFace Transformers]
  - label: Libraries
    items: [NumPy, Pandas, scikit-learn, OpenCV, Matplotlib, Unsloth]
  - label: Areas
    items:
      - LLM evaluation
      - Mechanistic interpretability
      - Physics-informed neural networks
      - Neural architecture search

certifications:
  - heading: Generative AI with Large Language Models
    subheading: DeepLearning.AI & AWS
    dates: Feb 2025
  - heading: Prediction and Control with Function Approximation
    subheading: University of Alberta
    dates: Dec 2024
  - heading: Sample-based Learning Methods
    subheading: University of Alberta
    dates: Nov 2024
  - heading: Fundamentals of Reinforcement Learning
    subheading: University of Alberta
    dates: Nov 2024
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run tests/lib/data.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 8: Commit**

```bash
git add src/schemas/profile.ts src/lib/data.ts src/data tests/lib/data.test.ts
git commit -m "feat(data): add profile and CV schemas with validated YAML loader"
```

---

### Task 4: Content collections and seed paper files

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/papers/{cad,logiqate}.mdx` (bodies with figures)
- Create: `src/content/papers/{auto-pinn-nas,glcm-deepfake,paft}.md` (frontmatter only)
- Create: `src/content/threads/{reasoning,representations,physics}.md`

**Interfaces:**
- Consumes: `paperSchema` from Task 2.
- Produces: the `papers` and `threads` collections, queryable via `getCollection('papers')`. Every paper entry's `data` conforms to `Paper`.

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
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
```

- [ ] **Step 2: Create the three thread files**

`src/content/threads/reasoning.md`:

```markdown
---
key: reasoning
title: Do models reason, or pattern-match?
blurb: >-
  Benchmarks score final answers, which lets a model score well by recall.
  These projects ask what happens when the answer cannot be recalled.
order: 1
---
```

`src/content/threads/representations.md`:

```markdown
---
key: representations
title: Reading and steering representations
blurb: >-
  Once a failure is identified, where does it live in the network, and what
  does its geometry tell you about which intervention will work?
order: 2
---
```

`src/content/threads/physics.md`:

```markdown
---
key: physics
title: Physics instead of geometry
blurb: >-
  When a measurement is under-determined, conservation laws can sometimes
  supply the constraints that extra sensors would have.
order: 3
---
```

- [ ] **Step 3: Create `src/content/papers/cad.mdx`**

Note there is deliberately **no `venue` field**. Adding one would fail the build.

```markdown
---
title: "Contrastive Activation Decomposition: Activation Steering Mitigation by Leveraging Bias Geometry"
authors: ["Kedar Joshi", "Kripabandhu Ghosh"]
firstAuthor: true
year: 2026
thread: representations
status: preprint
tldr: >-
  Bias is not one direction. Measuring its geometry first predicts which
  intervention will work: housing bias is near rank-1, medicalization spans
  40+ dimensions.
order: 1
pdf: /papers/cad.pdf
---

## The question

Activation steering removes unwanted behaviour from a language model at
inference time by subtracting a direction from its activations. The methods
that do this — CAA, FairSteer, SADI, Angular Steering — each commit to a fixed
intervention structure, and each works on some bias types while failing on
others. None of them tests whether the bias it targets actually has the shape
the method assumes.

## The approach

CAD applies SVD to the matrix of activation differences between contrastive
prompt pairs, and reads three statistics off the resulting spectrum: the
top-1 variance ratio, the number of components needed for 80% of the variance,
and how that number evolves across layers. Together these prescribe the
intervention rank and the target layers before any steered generation runs.

## What was found

Bias geometry varies systematically by type. Housing discrimination
concentrates in a near rank-1 subspace; medicalization of disability spreads
across more than forty dimensions. That difference, not the choice of method,
explains why rank-1 steering succeeds on one and fails on the other.

## Limitations

Two of nine AccessEval categories do not reach significance. The DiscrimEval
housing result equalises approval by saturating it, which illustrates the
concentrated-bias prediction rather than demonstrating fair allocation. One
architecture shows a documented sign inversion.
```

Prose is a starting point to be replaced by Kedar's own; figures are added in Task 9.

- [ ] **Step 4: Create `src/content/papers/logiqate.mdx`**

```markdown
---
title: "Don't Judge a Book by its Cover: Testing LLMs' Robustness Under Logical Obfuscation"
authors: ["Abhilekh Borah", "Shubhra Ghosh", "Kedar Joshi", "Aditya Kumar Guru", "Kripabandhu Ghosh"]
equalContrib: ["Shubhra Ghosh", "Kedar Joshi", "Aditya Kumar Guru"]
year: 2026
thread: reasoning
status: published
venue: EACL 2026
tldr: >-
  Frontier models lose up to 86% accuracy when a problem is restated in a
  logically equivalent form. Confidence collapses in late layers.
source: "Figure 2 (zero-shot relative accuracy); Section 5, layer-wise analysis"
order: 1
pdf: /papers/logiqate.pdf
code: https://github.com/abhilekhborah/logical-obfuscation
data: https://huggingface.co/datasets/abhilekhborah/LogiQAte
---

## The question

A model that answers a logic puzzle correctly may have reasoned about it, or
may have seen it before. Standard benchmarks score only the final answer, so
both look identical.

## The approach

Logifus rewrites a problem into a different surface form while preserving its
logical structure — "D is the father of F" becomes "D is the grandfather's
only son of F". LogiQAte applies this across 1,108 questions and four task
types: first-order logic entailment, family-graph reasoning, numeric pattern
induction, and navigation.

## What was found

Performance degrades consistently under rewriting. Memorization detection
rates rise sharply on obfuscated items, and layer-wise next-token confidence
collapses in the late layers where reasoning would be expected to consolidate.

## Limitations

Obfuscation is generated algorithmically, so difficulty is not controlled
independently of surface form. The four task types are drawn from structured
reasoning problems and do not cover open-ended reasoning.
```

- [ ] **Step 5: Create `src/content/papers/auto-pinn-nas.md`**

No performance figures. The `tldr` states novelty only.

```markdown
---
title: "Automated Physics-Informed Neural Architecture Search for Single-Radar 3D Wind Reconstruction"
authors: ["Shubh Mishra", "Kedar Joshi", "Sujal Rajput"]
year: 2026
thread: physics
status: patent
tldr: >-
  3D wind retrieval has required two radars since the 1960s. This reconstructs
  the full field from one, using conservation laws in place of geometry.
order: 1
---
```

- [ ] **Step 6: Create `src/content/papers/glcm-deepfake.md`**

No accuracy claim — the paper's own tables contradict the one in its abstract.

```markdown
---
title: "Integrating GLCM Texture Analysis for Improved Deepfake Detection on CelebDF(v2) Dataset"
authors: ["Kedar Joshi", "Aditya Sinha"]
firstAuthor: true
year: 2024
thread: earlier
status: published
venue: ACOIT 2024
tldr: >-
  Texture and frequency features with gradient-boosted trees, detecting
  manipulation without a CNN forward pass.
order: 1
doi: https://ieeexplore.ieee.org/document/10939531
---
```

- [ ] **Step 7: Create `src/content/papers/paft.md` with `order: null`**

Authored but not rendered, pending a source document.

```markdown
---
title: "Perturbation-Aware Fine-Tuning for Reducing LLM Memorization"
authors: ["Kedar Joshi"]
year: 2025
thread: reasoning
status: preprint
tldr: >-
  A training-time data augmentation method that reduces memorization without
  sacrificing reasoning performance.
order: null
---
```

- [ ] **Step 8: Verify the build validates all content**

Run: `npm run build`
Expected: build succeeds. Astro validates every frontmatter block against `paperSchema`.

- [ ] **Step 9: Prove the AAAI guard fires against real content**

Temporarily add `venue: AAAI 2027` to `src/content/papers/cad.mdx`, then run `npm run build`.
Expected: **build FAILS** with the message "A preprint must not name a venue."
Then remove the line and confirm the build passes again. Do not commit the failing state.

- [ ] **Step 10: Commit**

```bash
git add src/content.config.ts src/content
git commit -m "feat(content): add paper and thread collections with seed entries"
```

---

### Task 5: Design tokens and base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/fonts.css`
- Create: `src/layouts/Base.astro`
- Create: `public/fonts/*.woff2`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `loadProfile` from Task 3.
- Produces: `Base.astro`, accepting props `{ title: string; description: string }` and a default slot. Tasks 8, 9, 10 use it.

- [ ] **Step 1: Subset and self-host Source Serif 4**

Self-hosting is required: a Google Fonts request is a third-party connection, costs a round trip on the critical path, and would put LCP over the 1.0s budget.

```bash
mkdir -p public/fonts
npm install -D glyphhanger fonttools 2>/dev/null || pip3 install fonttools brotli

# Download the variable font from the official repo release
curl -L -o /tmp/source-serif.zip \
  https://github.com/adobe-fonts/source-serif/releases/download/4.005R/source-serif-4.005R.zip
unzip -o /tmp/source-serif.zip -d /tmp/source-serif

# Subset to Latin basic plus the specific glyphs this site uses
pyftsubset /tmp/source-serif/OTF/SourceSerif4-Regular.otf \
  --output-file=public/fonts/source-serif-regular.woff2 \
  --flavor=woff2 --layout-features='*' \
  --unicodes="U+0000-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2190,U+00B7,U+2207,U+00D7,U+2248,U+2081,U+2080-2089"

pyftsubset /tmp/source-serif/OTF/SourceSerif4-Semibold.otf \
  --output-file=public/fonts/source-serif-semibold.woff2 \
  --flavor=woff2 --layout-features='*' \
  --unicodes="U+0000-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2190,U+00B7,U+2207,U+00D7,U+2248,U+2081,U+2080-2089"

ls -la public/fonts/
```

The unicode range covers Latin-1, the punctuation the copy uses, and the four technical glyphs that appear in the paper summaries: ∇ (nabla), × (multiplication), ≈ (approximately), and subscript digits for EVR₁.

**Measure the result before continuing.** Both weights are kept regardless of size — the page budget is 95 KB gzipped, which accommodates them. Record the measured total; Task 13 verifies the page against the budget. If the two files together exceed 70 KB, the subset range is wrong: re-check the `--unicodes` argument rather than dropping a weight.

- [ ] **Step 2: Create `src/styles/fonts.css`**

```css
@font-face {
  font-family: "Source Serif 4";
  src: url("/fonts/source-serif-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Source Serif 4";
  src: url("/fonts/source-serif-semibold.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

`font-display: swap` renders the Georgia fallback immediately rather than blocking. Because Georgia has similar metrics to Source Serif, the swap causes no perceptible reflow — but verify CLS is still 0 in Task 13.

- [ ] **Step 3: Create `src/styles/tokens.css`**

```css
:root {
  --font-serif: "Source Serif 4", Georgia, "Times New Roman", serif;

  --size-base: 1rem;        /* 16px floor — accessibility requirement */
  --size-sm: 0.875rem;
  --size-lg: 1.2rem;
  --size-xl: 1.44rem;
  --size-title: 1.75rem;    /* nothing on the site exceeds this */

  --measure: 34rem;
  --leading: 1.6;

  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.75rem;
  --space-4: 3rem;
  --space-5: 5rem;

  --ink: #1a1a1a;
  --ink-muted: #5a5a5a;
  --paper: #fdfcf9;
  --rule: #d8d5cd;
  --accent: #7a2e1e;        /* links only */
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #e8e6e1;
    --ink-muted: #9c9890;
    --paper: #16161a;
    --rule: #33333a;
    --accent: #d99b7f;
  }
}

:root[data-theme="dark"] {
  --ink: #e8e6e1;
  --ink-muted: #9c9890;
  --paper: #16161a;
  --rule: #33333a;
  --accent: #d99b7f;
}

:root[data-theme="light"] {
  --ink: #1a1a1a;
  --ink-muted: #5a5a5a;
  --paper: #fdfcf9;
  --rule: #d8d5cd;
  --accent: #7a2e1e;
}
```

Contrast check before proceeding: `#1a1a1a` on `#fdfcf9` is roughly 15:1, and `#e8e6e1` on `#16161a` roughly 13:1. Both far exceed the 4.5:1 requirement. Verify `--accent` against `--paper` in both themes with a contrast checker; adjust the lightness if either falls below 4.5:1.

- [ ] **Step 4: Create `src/styles/base.css`**

```css
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: var(--space-4) var(--space-2) var(--space-5);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: var(--size-base);
  line-height: var(--leading);
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  /* Never render a synthesized weight — only the two real faces. */
  font-synthesis: none;
}

main { max-width: var(--measure); margin: 0 auto; }

h1, h2, h3 { font-weight: 600; line-height: 1.25; margin: 0; }
h1 { font-size: var(--size-title); }
h2 { font-size: var(--size-lg); }
h3 { font-size: var(--size-base); }

p { margin: 0 0 var(--space-2); }

a { color: var(--accent); text-decoration: underline; text-underline-offset: 0.15em; }

a:focus-visible, :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

hr { border: 0; border-top: 1px solid var(--rule); margin: var(--space-4) 0; }

img { max-width: 100%; height: auto; }

/* Numbers are the only emphasised content on the site. */
.figure-emph { font-weight: 600; font-variant-numeric: tabular-nums; }

.muted { color: var(--ink-muted); }

.skip-link {
  position: absolute; left: -9999px;
}
.skip-link:focus {
  left: var(--space-2); top: var(--space-1);
  background: var(--paper); padding: var(--space-1);
}

/* No animation anywhere — and honour the preference regardless. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 5: Create `src/layouts/Base.astro`**

```astro
---
import '../styles/fonts.css';
import '../styles/tokens.css';
import '../styles/base.css';

interface Props { title: string; description: string; }
const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="preload" as="font" type="font/woff2"
          href="/fonts/source-serif-regular.woff2" crossorigin />
    <slot name="head" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <main id="main">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 4: Update `src/pages/index.astro` to use the layout**

```astro
---
import Base from '../layouts/Base.astro';
import { loadProfile } from '../lib/data';

const profile = loadProfile();
---
<Base title={profile.name} description={profile.role}>
  <h1>{profile.name}</h1>
  <p class="muted">{profile.role}</p>
</Base>
```

- [ ] **Step 5: Verify the build and inspect the page**

Run: `npm run build && npm run preview`
Expected: build succeeds; the page renders the name and role in a serif face on an off-white background.

- [ ] **Step 6: Commit**

```bash
git add src/styles src/layouts src/pages/index.astro
git commit -m "feat(design): add design tokens, base styles and layout"
```

---

### Task 6: Author formatting

**Files:**
- Create: `src/lib/authors.ts`, `src/components/AuthorList.astro`
- Test: `tests/lib/authors.test.ts`

**Interfaces:**
- Consumes: `Paper` from Task 2.
- Produces: `formatAuthors(paper: Paper, selfName: string): AuthorToken[]` where `AuthorToken = { name: string; isSelf: boolean }`, and `contributionNote(paper: Paper, selfName: string): string | null`. `AuthorList.astro` takes props `{ paper: Paper }`.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/authors.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/lib/authors.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/authors`.

- [ ] **Step 3: Write `src/lib/authors.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/lib/authors.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write `src/components/AuthorList.astro`**

```astro
---
import type { Paper } from '../schemas/paper';
import { formatAuthors, contributionNote } from '../lib/authors';
import { loadProfile } from '../lib/data';

interface Props { paper: Paper; }
const { paper } = Astro.props;
const self = loadProfile().name;
const tokens = formatAuthors(paper, self);
const note = contributionNote(paper, self);
---
<p class="muted authors">
  {tokens.map((t, i) => (
    <>
      {i > 0 ? ', ' : ''}
      {t.isSelf ? <span class="self">{t.name}</span> : t.name}
    </>
  ))}
  {note ? <span class="note"> — {note}</span> : null}
</p>

<style>
  .authors { font-size: var(--size-sm); }
  .self { color: var(--ink); }
  .note { font-style: italic; }
</style>
```

The self author is distinguished by colour rather than weight, because weight is reserved for numbers.

- [ ] **Step 6: Commit**

```bash
git add src/lib/authors.ts src/components/AuthorList.astro tests/lib/authors.test.ts
git commit -m "feat(authors): add author formatting with first-author and equal-contribution notes"
```

---

### Task 7: Paper selection and grouping

**Files:**
- Create: `src/lib/papers.ts`
- Test: `tests/lib/papers.test.ts`

**Interfaces:**
- Consumes: `Paper` from Task 2.
- Produces: `isRendered(paper: Paper): boolean`, `sortPapers(papers: Paper[]): Paper[]`, and `groupByThread(papers: Paper[]): Map<Paper['thread'], Paper[]>`. Task 8 consumes all three.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/papers.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/lib/papers.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/papers`.

- [ ] **Step 3: Write `src/lib/papers.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/lib/papers.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/papers.ts tests/lib/papers.test.ts
git commit -m "feat(papers): add paper selection, sorting and thread grouping"
```

---

### Task 8: Homepage

**Files:**
- Create: `src/components/PaperRow.astro`, `src/components/ResearchThread.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `loadProfile` (Task 3), collections (Task 4), `AuthorList` (Task 6), `groupByThread`/`sortPapers` (Task 7).
- Produces: the rendered `/` route. Task 12's smoke test asserts against it.

- [ ] **Step 1: Create `src/components/PaperRow.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import AuthorList from './AuthorList.astro';

interface Props { entry: CollectionEntry<'papers'>; hasDetail: boolean; }
const { entry, hasDetail } = Astro.props;
const p = entry.data;

const statusLabel =
  p.status === 'published' ? p.venue :
  p.status === 'patent' ? 'patent filed' :
  'preprint';

const links = [
  hasDetail ? { href: `/papers/${entry.id}`, label: 'Details' } : null,
  p.pdf ? { href: p.pdf, label: 'PDF' } : null,
  p.code ? { href: p.code, label: 'Code' } : null,
  p.data ? { href: p.data, label: 'Dataset' } : null,
  p.doi ? { href: p.doi, label: 'DOI' } : null,
].filter(Boolean) as { href: string; label: string }[];
---
<article class="paper">
  <h3 class="title">
    {p.title}
    {statusLabel ? <span class="status muted">{statusLabel}</span> : null}
  </h3>
  <AuthorList paper={p} />
  <p class="tldr">{p.tldr}</p>
  {links.length > 0 && (
    <p class="links">
      {links.map((l, i) => (
        <>{i > 0 ? <span aria-hidden="true"> · </span> : ''}<a href={l.href}>{l.label}</a></>
      ))}
    </p>
  )}
</article>

<style>
  .paper { margin: 0 0 var(--space-3); }
  .title { display: flex; justify-content: space-between; gap: var(--space-2); align-items: baseline; }
  .status { font-size: var(--size-sm); white-space: nowrap; font-weight: 400; }
  .tldr { margin: var(--space-1) 0; }
  .links { font-size: var(--size-sm); margin: 0; }
</style>
```

- [ ] **Step 2: Create `src/components/ResearchThread.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import PaperRow from './PaperRow.astro';

interface Props {
  title: string;
  blurb?: string;
  papers: CollectionEntry<'papers'>[];
  detailIds: string[];
}
const { title, blurb, papers, detailIds } = Astro.props;
---
<section class="thread">
  <h2>{title}</h2>
  {blurb ? <p class="blurb muted">{blurb}</p> : null}
  {papers.map((entry) => (
    <PaperRow entry={entry} hasDetail={detailIds.includes(entry.id)} />
  ))}
</section>

<style>
  .thread { margin: 0 0 var(--space-4); }
  .blurb { margin: var(--space-1) 0 var(--space-3); }
</style>
```

- [ ] **Step 3: Rewrite `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import ResearchThread from '../components/ResearchThread.astro';
import { loadProfile } from '../lib/data';
import { isRendered } from '../lib/papers';

const profile = loadProfile();

const allPapers = (await getCollection('papers')).filter((e) => isRendered(e.data));
const threads = (await getCollection('threads')).sort((a, b) => a.data.order - b.data.order);

/** A paper earns a detail page when its Markdown body has content. */
const detailIds = allPapers.filter((e) => e.body && e.body.trim().length > 0).map((e) => e.id);

const byThread = (key: string) =>
  allPapers
    .filter((e) => e.data.thread === key)
    .sort((a, b) => (a.data.order! - b.data.order!) || (b.data.year - a.data.year));

const earlier = byThread('earlier');

const contactLinks = [
  { href: '/cv', label: 'CV' },
  { href: '/cv.pdf', label: 'CV (PDF)' },
  profile.links.scholar ? { href: profile.links.scholar, label: 'Google Scholar' } : null,
  profile.links.github ? { href: profile.links.github, label: 'GitHub' } : null,
  profile.links.orcid ? { href: profile.links.orcid, label: 'ORCID' } : null,
  { href: `mailto:${profile.email}`, label: profile.email },
].filter(Boolean) as { href: string; label: string }[];
---
<Base title={profile.name} description={profile.positioning}>
  <header class="intro">
    <h1>{profile.name}</h1>
    <p class="role muted">{profile.role}</p>
    <p class="positioning">{profile.positioning}</p>
    {profile.currently ? <p class="positioning">{profile.currently}</p> : null}
  </header>

  <hr />

  {threads.map((thread) => {
    const papers = byThread(thread.data.key);
    return papers.length > 0 ? (
      <ResearchThread
        title={thread.data.title}
        blurb={thread.data.blurb}
        papers={papers}
        detailIds={detailIds}
      />
    ) : null;
  })}

  {earlier.length > 0 && (
    <ResearchThread title="Earlier" papers={earlier} detailIds={detailIds} />
  )}

  <hr />

  <footer class="contact">
    {profile.photo && (
      <img class="photo" src={profile.photo} alt={`Portrait of ${profile.name}`}
           width="96" height="96" loading="lazy" decoding="async" />
    )}
    <p>
      {contactLinks.map((l, i) => (
        <>{i > 0 ? <span aria-hidden="true"> · </span> : ''}<a href={l.href}>{l.label}</a></>
      ))}
    </p>
  </footer>
</Base>

<style>
  .intro { margin-bottom: var(--space-3); }
  .role { margin: var(--space-1) 0 var(--space-3); }
  .positioning { margin-bottom: var(--space-2); }
  .contact { font-size: var(--size-sm); display: flex; gap: var(--space-2); align-items: center; }
  .photo { width: 96px; height: 96px; flex: 0 0 auto; border-radius: 2px; }
</style>
```

The photo sits at the contact line, not as a hero, and is guarded by `profile.photo` being non-empty — so the page renders correctly before Kedar supplies one. Fixed `width` and `height` attributes keep CLS at zero whether or not the file exists yet.

The "Earlier" section is rendered without a blurb, deliberately — it is a bucket, not a research programme.

- [ ] **Step 4: Verify the page**

Run: `npm run build && npm run preview`
Expected: homepage shows name, role, positioning, three threads with papers, an Earlier section, and a contact line. CAD shows "preprint" with no venue. PAFT does not appear.

- [ ] **Step 5: Commit**

```bash
git add src/components src/pages/index.astro
git commit -m "feat(home): render single-scroll homepage with research threads"
```

---

### Task 9: Paper detail pages and figures

**Files:**
- Create: `src/pages/papers/[slug].astro`, `src/layouts/Paper.astro`, `src/components/Figure.astro`
- Create: `public/figures/` (converted assets), `public/papers/` (PDFs)

**Interfaces:**
- Consumes: papers collection (Task 4), `Base.astro` (Task 5), `AuthorList` (Task 6).
- Produces: routes `/papers/<id>` for every paper whose body is non-empty.

- [ ] **Step 1: Convert the figures to WebP and record their dimensions**

Figures live in the LaTeX source directories. Convert and note the exact pixel dimensions — they are required on every `<img>` so CLS stays at zero.

```bash
mkdir -p public/figures public/papers

EACL="/Users/lichking/Downloads/Obfuscate_Logical_ARR"
CAD="/Users/lichking/Downloads/Contrastive_Activation_Decomposition__Activation_Steering_Mitigation_by_Leveraging_Bias_Geometry__2_"

magick -density 200 "$EACL/intro.pdf" -quality 82 public/figures/logiqate-intro.webp
magick -density 200 "$EACL/relative_improvement_zero_shot.png" -quality 82 public/figures/logiqate-degradation.webp
magick -density 200 "$CAD/figures/figure-00-teaser.pdf" -quality 82 public/figures/cad-teaser.webp
magick -density 200 "$CAD/figures/figure-05-accesseval-multirank.pdf" -quality 82 public/figures/cad-multirank.webp

magick identify -format "%f %wx%h\n" public/figures/*.webp
```

Record the printed dimensions — Step 3 needs them. If `magick` is unavailable, install ImageMagick (`brew install imagemagick`) or export the figures from Overleaf as PNG and convert with `cwebp`.

- [ ] **Step 2: Create `src/components/Figure.astro`**

```astro
---
interface Props {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}
const { src, alt, caption, width, height } = Astro.props;
---
<figure>
  <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
  <figcaption>{caption}</figcaption>
</figure>

<style>
  figure { margin: var(--space-3) 0; }
  img { display: block; width: 100%; height: auto; }
  figcaption {
    font-size: var(--size-sm);
    color: var(--ink-muted);
    margin-top: var(--space-1);
  }
</style>
```

`width` and `height` are required props, not optional — a figure without intrinsic dimensions causes layout shift, and the budget allows none.

- [ ] **Step 3: Add figures to the two detail-page Markdown bodies**

In `src/content/papers/logiqate.mdx`, immediately after the "The approach" section, insert (substituting the dimensions printed in Step 1):

```markdown
<Figure
  src="/figures/logiqate-intro.webp"
  alt="A family-relation question shown in original and obfuscated form, with a plot of layer-wise next-token confidence falling under obfuscation."
  caption="The same question, restated equivalently. The model answers the first correctly and the second incorrectly; its token-level confidence drops sharply as the rewritten form is processed."
  width={WIDTH}
  height={HEIGHT}
/>
```

And after "What was found":

```markdown
<Figure
  src="/figures/logiqate-degradation.webp"
  alt="Bar chart of relative accuracy on obfuscated questions against base questions across five models and four tasks."
  caption="Relative accuracy on rewritten questions, with base performance fixed at 1.00. Degradation is consistent across every task and every model tested."
  width={WIDTH}
  height={HEIGHT}
/>
```

In `src/content/papers/cad.mdx`, after "The approach":

```markdown
<Figure
  src="/figures/cad-teaser.webp"
  alt="Diagram of the CAD pipeline: contrastive prompt pairs, SVD of activation differences, a singular value spectrum, and a prescribed multi-rank projection."
  caption="CAD reads the singular value spectrum of contrastive activation differences, then prescribes the intervention rank and target layers from it before any steered generation runs."
  width={WIDTH}
  height={HEIGHT}
/>
```

And after "What was found":

```markdown
<Figure
  src="/figures/cad-multirank.webp"
  alt="Comparison of rank-1 projection against multi-rank projection on the AccessEval medicalization benchmark."
  caption="Rank-1 projection fails on medicalization bias because the bias spans more than forty dimensions. The multi-rank projection captures the full subspace."
  width={WIDTH}
  height={HEIGHT}
/>
```

Captions are written for a reader who has not read the paper — they do not reuse the LaTeX captions, which assume surrounding text.

- [ ] **Step 4: Create `src/layouts/Paper.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import Base from './Base.astro';
import AuthorList from '../components/AuthorList.astro';

interface Props { entry: CollectionEntry<'papers'>; }
const { entry } = Astro.props;
const p = entry.data;

const statusLabel =
  p.status === 'published' ? p.venue :
  p.status === 'patent' ? 'Patent application' :
  'Preprint';

const links = [
  p.pdf ? { href: p.pdf, label: 'PDF' } : null,
  p.code ? { href: p.code, label: 'Code' } : null,
  p.data ? { href: p.data, label: 'Dataset' } : null,
  p.doi ? { href: p.doi, label: 'DOI' } : null,
].filter(Boolean) as { href: string; label: string }[];
---
<Base title={`${p.title} — Kedar Joshi`} description={p.tldr}>
  <slot name="head" slot="head" />

  <p class="back"><a href="/">← Kedar Joshi</a></p>

  <article>
    <h1>{p.title}</h1>
    <AuthorList paper={p} />
    <p class="meta muted">{statusLabel} · {p.year}</p>

    {links.length > 0 && (
      <p class="links">
        {links.map((l, i) => (
          <>{i > 0 ? <span aria-hidden="true"> · </span> : ''}<a href={l.href}>{l.label}</a></>
        ))}
      </p>
    )}

    <div class="body"><slot /></div>

    {p.bibtex && (
      <section>
        <h2>BibTeX</h2>
        <pre><code>{p.bibtex}</code></pre>
      </section>
    )}
  </article>
</Base>

<style>
  .back { font-size: var(--size-sm); margin-bottom: var(--space-3); }
  .meta, .links { font-size: var(--size-sm); margin: var(--space-1) 0; }
  .body { margin-top: var(--space-3); }
  .body :global(h2) { margin-top: var(--space-3); margin-bottom: var(--space-1); }
  pre {
    overflow-x: auto;
    font-size: var(--size-sm);
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    padding: var(--space-2);
  }
</style>
```

The `pre` has `overflow-x: auto` so a long BibTeX line scrolls inside its own box rather than making the page scroll sideways.

- [ ] **Step 5: Create `src/pages/papers/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Paper from '../../layouts/Paper.astro';
import Figure from '../../components/Figure.astro';

export async function getStaticPaths() {
  const papers = await getCollection('papers');
  return papers
    .filter((entry) => entry.body && entry.body.trim().length > 0)
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<Paper entry={entry}>
  <Content components={{ Figure }} />
</Paper>
```

- [ ] **Step 6: Verify the routes build**

Run: `npm run build`
Expected: `dist/papers/logiqate/index.html` and `dist/papers/cad/index.html` exist. No page is generated for `auto-pinn-nas`, `glcm-deepfake`, or `paft`, because their bodies are empty.

- [ ] **Step 7: Commit**

```bash
git add src/pages/papers src/layouts/Paper.astro src/components/Figure.astro src/content/papers public/figures
git commit -m "feat(papers): add detail pages with figures for LogiQAte and CAD"
```

---

### Task 10: CV page

**Files:**
- Create: `src/pages/cv.astro`
- Create: `public/cv.pdf`

**Interfaces:**
- Consumes: `loadCv`, `loadProfile` (Task 3), `Base.astro` (Task 5).
- Produces: the `/cv` route and the permanent `/cv.pdf` asset.

- [ ] **Step 1: Place the CV PDF at its permanent URL**

```bash
cp /Users/lichking/Documents/ResumeWebsite/Resume_edited_collegepond_august_2026_2.pdf public/cv.pdf
```

This is the current CV. Replace it with the revised version produced from `docs/cv-revision-brief.md` when ready. **The filename never changes** — once the URL is in a professor's inbox it must not 404.

- [ ] **Step 2: Create `src/pages/cv.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { loadCv, loadProfile } from '../lib/data';

const profile = loadProfile();
const cv = loadCv();

const sections = [
  { title: 'Education', entries: cv.education },
  { title: 'Experience', entries: cv.experience },
  { title: 'Certifications', entries: cv.certifications },
];
---
<Base title={`CV — ${profile.name}`} description={`Curriculum vitae for ${profile.name}`}>
  <p class="back"><a href="/">← {profile.name}</a></p>

  <h1>Curriculum Vitae</h1>
  <p class="muted download"><a href="/cv.pdf">Download PDF</a></p>

  {sections.map((section) => section.entries.length > 0 && (
    <section>
      <h2>{section.title}</h2>
      {section.entries.map((e) => (
        <div class="entry">
          <h3 class="entry-head">
            {e.heading}
            {e.dates ? <span class="dates muted">{e.dates}</span> : null}
          </h3>
          {e.subheading ? <p class="sub muted">{e.subheading}{e.location ? `, ${e.location}` : ''}</p> : null}
          {e.bullets.length > 0 && (
            <ul>{e.bullets.map((b) => <li>{b}</li>)}</ul>
          )}
        </div>
      ))}
    </section>
  ))}

  {cv.skills.length > 0 && (
    <section>
      <h2>Skills</h2>
      {cv.skills.map((group) => (
        <p class="skill"><span class="skill-label">{group.label}:</span> {group.items.join(', ')}</p>
      ))}
    </section>
  )}
</Base>

<style>
  .back, .download { font-size: var(--size-sm); }
  .download { margin-bottom: var(--space-3); }
  section { margin-bottom: var(--space-4); }
  section h2 { margin-bottom: var(--space-2); }
  .entry { margin-bottom: var(--space-3); }
  .entry-head { display: flex; justify-content: space-between; gap: var(--space-2); align-items: baseline; }
  .dates { font-size: var(--size-sm); white-space: nowrap; font-weight: 400; }
  .sub { margin: 0 0 var(--space-1); font-size: var(--size-sm); }
  ul { margin: var(--space-1) 0; padding-left: 1.2em; }
  .skill { margin-bottom: var(--space-1); }
  .skill-label { color: var(--ink-muted); }
</style>
```

- [ ] **Step 3: Verify the page**

Run: `npm run build && npm run preview`
Expected: `/cv` lists USC first, then Manipal, then experience, certifications, and skills. `/cv.pdf` downloads.

- [ ] **Step 4: Commit**

```bash
git add src/pages/cv.astro public/cv.pdf
git commit -m "feat(cv): add HTML CV page and permanent PDF URL"
```

---

### Task 11: Structured data, sitemap and robots

**Files:**
- Create: `src/components/PersonSchema.astro`, `src/components/ScholarlyArticleSchema.astro`, `src/components/CitationMeta.astro`
- Create: `public/robots.txt`
- Modify: `src/pages/index.astro`, `src/pages/papers/[slug].astro`, `astro.config.mjs`, `package.json`

**Interfaces:**
- Consumes: `loadProfile` (Task 3), papers collection (Task 4).
- Produces: JSON-LD in `<head>` on `/` and each paper page; Highwire `citation_*` meta tags on paper pages; `/sitemap-index.xml`.

- [ ] **Step 1: Install and register the sitemap integration**

```bash
npm install @astrojs/sitemap
```

Update `astro.config.mjs`:

```js
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
```

Keep `mdx()` in the array — dropping it breaks the two detail pages.

- [ ] **Step 2: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://kedarjoshi.github.io/sitemap-index.xml
```

- [ ] **Step 3: Create `src/components/PersonSchema.astro`**

```astro
---
import { loadProfile } from '../lib/data';

const profile = loadProfile();
const sameAs = Object.values(profile.links).filter(Boolean);

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  email: `mailto:${profile.email}`,
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'University of Southern California',
  },
  url: Astro.site?.href,
  description: profile.positioning,
  ...(sameAs.length > 0 ? { sameAs } : {}),
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 4: Create `src/components/ScholarlyArticleSchema.astro`**

```astro
---
import type { Paper } from '../schemas/paper';

interface Props { paper: Paper; url: string; }
const { paper, url } = Astro.props;

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ScholarlyArticle',
  headline: paper.title,
  name: paper.title,
  author: paper.authors.map((name) => ({ '@type': 'Person', name })),
  datePublished: String(paper.year),
  abstract: paper.tldr,
  url,
  ...(paper.venue ? { publication: paper.venue } : {}),
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

The `venue` is spread conditionally, so a preprint never emits a publication field — the guard from Task 2 already prevents a preprint from having one, and this keeps the invariant true in the output as well.

- [ ] **Step 5: Create `src/components/CitationMeta.astro`**

```astro
---
import type { Paper } from '../schemas/paper';

interface Props { paper: Paper; pdfUrl?: string; }
const { paper, pdfUrl } = Astro.props;
---
<meta name="citation_title" content={paper.title} />
{paper.authors.map((a) => <meta name="citation_author" content={a} />)}
<meta name="citation_publication_date" content={String(paper.year)} />
{paper.venue ? <meta name="citation_conference_title" content={paper.venue} /> : null}
{pdfUrl ? <meta name="citation_pdf_url" content={pdfUrl} /> : null}
```

These are what Google Scholar's crawler reads. JSON-LD alone is not sufficient for Scholar indexing.

- [ ] **Step 6: Wire `PersonSchema` into the homepage**

In `src/pages/index.astro`, add the import:

```astro
import PersonSchema from '../components/PersonSchema.astro';
```

and immediately inside `<Base ...>`, before `<header class="intro">`:

```astro
<PersonSchema slot="head" />
```

- [ ] **Step 7: Wire the paper schemas into the detail route**

Replace `src/pages/papers/[slug].astro` with:

```astro
---
import { getCollection, render } from 'astro:content';
import Paper from '../../layouts/Paper.astro';
import Figure from '../../components/Figure.astro';
import ScholarlyArticleSchema from '../../components/ScholarlyArticleSchema.astro';
import CitationMeta from '../../components/CitationMeta.astro';

export async function getStaticPaths() {
  const papers = await getCollection('papers');
  return papers
    .filter((entry) => entry.body && entry.body.trim().length > 0)
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const pageUrl = new URL(Astro.url.pathname, Astro.site).href;
const pdfUrl = entry.data.pdf ? new URL(entry.data.pdf, Astro.site).href : undefined;
---
<Paper entry={entry}>
  <Fragment slot="head">
    <ScholarlyArticleSchema paper={entry.data} url={pageUrl} />
    <CitationMeta paper={entry.data} pdfUrl={pdfUrl} />
  </Fragment>
  <Content components={{ Figure }} />
</Paper>
```

- [ ] **Step 8: Verify the output**

Run: `npm run build`
Then inspect:

```bash
grep -c "application/ld+json" dist/index.html
grep -o 'citation_title[^>]*' dist/papers/cad/index.html
grep -i "aaai\|submitted\|under review" dist/papers/cad/index.html || echo "CLEAN: no policy violation in output"
ls dist/sitemap-index.xml
```

Expected: one JSON-LD block on the homepage, `citation_title` present on the CAD page, **no AAAI or review-status string anywhere in the CAD output**, and the sitemap exists.

- [ ] **Step 9: Commit**

```bash
git add src/components public/robots.txt astro.config.mjs package.json package-lock.json src/pages
git commit -m "feat(seo): add Person and ScholarlyArticle schema, citation meta, sitemap and robots"
```

---

### Task 12: Link checking and smoke tests

**Files:**
- Create: `scripts/check-links.mjs`, `tests/e2e/smoke.spec.ts`, `playwright.config.ts`
- Modify: `package.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the built `dist/` directory.
- Produces: `npm run check:links` and `npm run test:e2e`.

- [ ] **Step 1: Write `scripts/check-links.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const failures = [];

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(full);
    return e.name.endsWith('.html') ? [full] : [];
  });
}

for (const file of htmlFiles(DIST)) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    if (!href.startsWith('/')) continue;          // external and anchors: skip
    if (href.startsWith('//')) continue;          // protocol-relative
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '' || clean === '/') continue;

    const candidates = [
      path.join(DIST, clean),
      path.join(DIST, clean, 'index.html'),
      path.join(DIST, `${clean}.html`),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) {
      failures.push(`${file}: dead internal link -> ${href}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Dead links found:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('All internal links resolve.');
```

Dead PDF links are the most common form of academic-site rot, and this catches them before they ship.

- [ ] **Step 2: Add the script and verify it passes**

Add to `package.json` scripts:

```json
"check:links": "node scripts/check-links.mjs",
"test:e2e": "playwright test"
```

Run: `npm run build && npm run check:links`
Expected: "All internal links resolve."

- [ ] **Step 3: Verify the checker actually catches a break**

Temporarily change `pdf: /papers/cad.pdf` in `src/content/papers/cad.mdx` to `pdf: /papers/does-not-exist.pdf`, then run `npm run build && npm run check:links`.
Expected: **exit code 1** with "dead internal link -> /papers/does-not-exist.pdf".
Revert the change. A checker that has never failed is not known to work.

- [ ] **Step 4: Install Playwright and write `playwright.config.ts`**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 5: Write `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('homepage renders identity and research', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Kedar Joshi');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('Do models reason, or pattern-match?')).toBeVisible();
});

test('the unrendered paper does not appear', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Perturbation-Aware Fine-Tuning')).toHaveCount(0);
});

test('the preprint shows no venue or review status', async ({ page }) => {
  await page.goto('/papers/cad');
  const body = await page.locator('body').innerText();
  expect(body.toLowerCase()).not.toContain('aaai');
  expect(body.toLowerCase()).not.toContain('under review');
  expect(body.toLowerCase()).not.toContain('submitted');
  await expect(page.getByText('Preprint')).toBeVisible();
});

test('paper detail pages resolve', async ({ page }) => {
  for (const slug of ['logiqate', 'cad']) {
    const response = await page.goto(`/papers/${slug}`);
    expect(response?.status()).toBe(200);
  }
});

test('cv page and pdf both resolve', async ({ page }) => {
  const html = await page.goto('/cv');
  expect(html?.status()).toBe(200);
  const pdf = await page.request.get('/cv.pdf');
  expect(pdf.status()).toBe(200);
});

test('no horizontal scroll at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
```

- [ ] **Step 6: Add an axe-core accessibility test**

```bash
npm install -D @axe-core/playwright
```

Create `tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/papers/cad', '/papers/logiqate', '/cv']) {
  test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('dark scheme has no contrast violations', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

The dark-scheme case is separate and deliberate: contrast is the violation most likely to appear in only one theme, and the spec requires ≥ 4.5:1 in both.

- [ ] **Step 7: Run the full test suite**

Run: `npm run build && npm run test:e2e`
Expected: 11 tests PASS (6 smoke + 5 accessibility).

If a contrast violation fires, adjust `--accent` or `--ink-muted` in `src/styles/tokens.css` until it clears. Do not suppress the rule.

- [ ] **Step 8: Add both to CI**

In `.github/workflows/ci.yml`, replace the `steps` list of `build-and-test` with:

```yaml
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm run check:links
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 9: Commit**

```bash
git add scripts playwright.config.ts tests/e2e package.json package-lock.json .github/workflows/ci.yml
git commit -m "test: add link checker, smoke tests and axe-core accessibility suite"
```

---

### Task 13: Performance budget and GitHub Pages deploy

**Files:**
- Create: `.github/workflows/deploy.yml`, `lighthouserc.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the built site from all prior tasks.
- Produces: a live site at `https://kedarjoshi.github.io/`, with CI failing on any Lighthouse regression.

- [ ] **Step 1: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": ["http://localhost/index.html", "http://localhost/papers/cad/index.html"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.98 }],
        "categories:accessibility": ["error", { "minScore": 0.98 }],
        "categories:best-practices": ["error", { "minScore": 0.98 }],
        "categories:seo": ["error", { "minScore": 0.98 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 1000 }]
      }
    }
  }
}
```

- [ ] **Step 2: Add the Lighthouse job to `.github/workflows/ci.yml`**

Append as a second job:

```yaml
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
```

- [ ] **Step 3: Verify the transfer budget locally**

```bash
npm run build
gzip -c dist/index.html | wc -c
du -sh dist/
find dist -name '*.woff2' -exec sh -c 'echo -n "{}: "; gzip -c "{}" | wc -c' \;
```

Expected: the homepage HTML plus both font files stays under 95 KB gzipped. If it exceeds that, the font subset range is wrong — re-check --unicodes rather than dropping a weight.

- [ ] **Step 4: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Create the GitHub repository and push**

The repository **must** be named `kedarjoshi.github.io` for the site to serve at the root. A differently-named repo serves under `/reponame/` and breaks every path in this build.

```bash
gh repo create kedarjoshi.github.io --public --source=. --remote=origin
git branch -M main
git push -u origin main
```

- [ ] **Step 6: Enable Pages with the Actions source**

In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Not "Deploy from a branch" — that source ignores the workflow.

- [ ] **Step 7: Verify the live site**

Wait for the deploy workflow to finish, then check:

```bash
curl -sI https://kedarjoshi.github.io/ | head -1
curl -sI https://kedarjoshi.github.io/cv.pdf | head -1
curl -s https://kedarjoshi.github.io/papers/cad/ | grep -i "aaai\|under review\|submitted" || echo "CLEAN"
```

Expected: two `HTTP/2 200` responses and "CLEAN".

- [ ] **Step 8: Commit**

```bash
git add .github/workflows lighthouserc.json
git commit -m "ci: add Lighthouse budget enforcement and GitHub Pages deploy"
git push
```

---

## Content still owed by Kedar

The build succeeds without these; the schema renders around absent content. Each is a content edit, not a code change.

| Item | Lands in |
|---|---|
| Positioning statement in his own words | `src/data/profile.yml` → `positioning` |
| USC lab / advisor / current project | `src/data/profile.yml` → `currently` |
| Headshot, square, ≥800px | `public/photo.webp`, `profile.yml` → `photo` |
| ORCID iD and Google Scholar URLs | `src/data/profile.yml` → `links` |
| Revised CV PDF (per `docs/cv-revision-brief.md`) | `public/cv.pdf` |
| CAD preprint PDF (built and verified 2026-08-21) | `public/papers/cad.pdf` |
| LogiQAte PDF | `public/papers/logiqate.pdf` |
| Detail-page prose in his own voice | `src/content/papers/{cad,logiqate}.mdx` bodies |
| BibTeX for both papers | `bibtex` frontmatter field |
| Journal-version venue status for the GLCM + Fourier paper | new entry, or leave absent |

**If arXiv is chosen over self-hosting:** set `pdf:` to the arXiv abs URL and delete `public/papers/cad.pdf`. The link checker skips external URLs, so nothing else changes.
