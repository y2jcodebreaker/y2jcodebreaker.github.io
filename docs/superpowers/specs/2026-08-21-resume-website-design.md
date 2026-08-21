# Design: Academic Research Website for Kedar Joshi

**Date:** 2026-08-21
**Status:** Approved design, pending implementation plan
**Owner:** Kedar Joshi

---

## 1. Context

Kedar Joshi begins an MS in Computer Science at the University of Southern California on **24 August 2026** (program runs 24 Aug 2026 – 13 May 2028). He has four research artifacts spanning LLM evaluation, mechanistic interpretability, physics-informed ML, and computer vision, including an EACL 2026 acceptance and a filed patent application.

He has no web presence. His resume is out of date (no USC entry, and it omits his strongest recent work entirely).

### The immediate job of this site

Not December 2027 PhD applications. **Getting into a USC research group during his first semester.** Cold emails to faculty land best in the first few weeks of term; the link in that email is this site. It has roughly 60 seconds to make his research legible to someone who reads papers for a living.

Secondary audiences, evaluated the same way: PhD admissions committees, industry research labs, prospective collaborators finding the EACL work.

### Success criteria

1. A faculty member unfamiliar with Kedar can state what he works on after 60 seconds on the homepage.
2. Every claim on the site is traceable to something in a paper. No unsupported numbers.
3. Adding a new paper takes under five minutes and touches exactly one file.
4. The site is live before or within days of 24 August 2026.
5. Nothing on the site can trigger an AAAI-27 policy violation.

### Non-goals

- No blog or writing section. Explicitly cut — dead weight unless maintained, and it will not be.
- No interactive demos or explorables in v1. The architecture must not preclude adding them later (see §10).
- No gimmicks: no terminal UI, no OS simulation, no WebGL, no scroll animation. The user chose "keep it clean."
- No custom domain. GitHub Pages only (see §9).
- No CV PDF generation pipeline. The PDF stays a hand-maintained artifact.

---

## 2. Verified content inventory

All facts below were read from primary sources, not from the resume. Where the resume and the source disagree, the source wins.

### 2.1 LogiQAte / Logifus — EACL 2026

**Source:** `Obfuscate_Logical_ARR/main.tex`

- **Title:** "Don't Judge a Book by its Cover: Testing LLMs' Robustness Under Logical Obfuscation"
- **Authors:** Abhilekh Borah¹, Shubhra Ghosh²\*, **Kedar Joshi**¹\*, Aditya Kumar Guru¹\*, Kripabandhu Ghosh³
  (¹Manipal University Jaipur, ²IIT Patna, ³IISER Kolkata). \* = equal contribution.
- **Status:** Accepted, EACL 2026 main conference.
- **Contributions:** *Logifus*, a structure-preserving logical obfuscation algorithm; *LogiQAte*, a 1,108-question diagnostic benchmark across four tasks (Obfus FOL, Obfus Blood Relation, Obfus Number Series, Obfus Direction Sense).
- **Verified results:**
  - Average degradation 28.8% across all tasks, averaged over zero-shot, few-shot, and CoT.
  - Zero-shot drops: 47% (GPT-4o), 27% (GPT-5), 22% (o4-mini).
  - Worst-case relative degradation: −86%.
  - Memorization detection rate rises 50% (original) → 82% (obfuscated).
  - Layer-wise next-token log-probability: 50–80% collapse in late-layer confidence.
- **Public artifacts:** https://github.com/abhilekhborah/logical-obfuscation · https://huggingface.co/datasets/abhilekhborah/LogiQAte
- **Usable figures:** `intro.pdf`, `relative_improvement_zero_shot.png`

> **Known defect in the paper, not the site:** the abstract says "six state-of-the-art models"; contribution 2 says "nine open- and closed-source" LLMs. One is wrong. Resolve before camera-ready. The site will state **six**, matching the abstract, until corrected.

### 2.2 Contrastive Activation Decomposition — preprint

**Source:** `Contrastive_Activation_Decomposition.../main.tex`

- **Title:** "Contrastive Activation Decomposition: Activation Steering Mitigation by Leveraging Bias Geometry"
- **Authors:** **Kedar Joshi**¹ (first author), Kripabandhu Ghosh² — ¹Manipal University Jaipur, ²IISER Kolkata. Affiliation reflects where the work was done; a present-address footnote records the move to USC.
- **First authorship on the portfolio's strongest work.** This is the single most consequential fact in the inventory: the paper with the most rigorous evidence (§3) is also the one he led. The site surfaces it via `firstAuthor: true` (§5.4).
- **Contribution:** CAD applies SVD to contrastive activation differences and returns three diagnostics — EVR₁ (rank-1 sufficiency), k@80% (projection rank), cascade shape (layer alignment) — which prescribe intervention rank and target layers before any steered generation runs.
- **Verified results:**
  - Bias geometry varies by type: housing discrimination EVR₁ = 67.9% (near rank-1); medicalization bias EVR₁ = 10.2% (diffuse across 40+ dimensions).
  - AccessEval matched n=250: CAD (k=40, α=1) d = 0.337 vs CAA d = 0.341, overlapping 95% CIs, with no per-task sweep.
  - Quality cost: CAD judge Δ = −0.12 vs CAA −0.54 (paired Wilcoxon p < 0.001).
  - Rank-1 erasure fails: LEACE d = −0.03.
  - Steering at CAD-identified circuit layers (L21+L25, "Pincer") lifts d to 0.437; 71.6% medicalization reduction.
  - Four architectures: Llama-3.1-8B, Qwen2.5-7B, Gemma-2-9B, Mistral-7B. One documented sign-inversion exception (Mistral Target B).
  - Two of nine AccessEval categories (Mobility, Genetic & Developmental) do not reach significance.
- **Usable figures:** `figures/figure-00-teaser.pdf`, `figures/figure-05-accesseval-multirank.pdf`

> **This work is absent from the current resume.** It is arguably the strongest artifact in the portfolio and is treated as a first-class thread on the site.

#### ⚠️ AAAI-27 compliance constraint

Per the [AAAI-27 review process](https://aaai.org/conference/aaai/aaai-27/review-process/), a preprint may appear on a personal website, but **the non-anonymous material must not reference the fact that the work was submitted to AAAI-27.** Violation may lead to summary rejection.

Therefore:
- The site labels this work `preprint`. Never "submitted", "under review", or any venue name.
- The hosted PDF must be a **non-anonymous preprint build**, not the `[submission]` build that prints "Anonymous Submission".
- This is enforced at build time by schema (§5.2), not by memory.

### 2.3 Automated Physics-Informed NAS — patent filed

**Source:** `Initial Draft 3.docx` (patent application draft, "Initial Draft 3")

- **Title:** "Automated Physics-Informed Neural Architecture Search System and Method for Single-Radar Three-Dimensional Atmospheric Velocity Field Reconstruction" *(marked subject to change as claims are finalized)*
- **Inventors:** Shubh Mishra (India Meteorological Department, Bhopal), **Kedar Joshi**\*, Sujal Rajput\* (Manipal University Jaipur)
- **Core idea:** A single Doppler radar measures only the radial velocity component, making 3D wind retrieval under-determined — the reason dual-radar installations have been required since the 1960s. The invention asks whether conservation laws can supply the missing constraints in place of geometry: continuity (∇·u = 0), bounded vorticity (|∇×u| < 0.01 s⁻¹), and dynamics tolerances (|u| < 80 m/s, |∂u/∂z| < 0.005 s⁻¹), enforced via automatic differentiation in the loss.
- **NAS layer:** hybrid DARTS (local) + Bayesian optimization (global), NSGA-II multi-objective, with **physics compliance as a third objective** alongside accuracy and efficiency. Architectures span ≈245K to ≥50M parameters (≈204×).

#### ⚠️ Unvalidated claims — do not publish

The document reports **no validation**: no RMSE table, no comparison against dual-radar ground truth, no test set. The section headed "Achieved Results and Technical Advantages" sits inside hypothetical scenarios ("Consider the requirements of…", "The meteorological service implements…"). The following are **scenario projections, not measurements**, and are barred from the site:

| Claim | Actual status |
|---|---|
| 95% wind shear detection accuracy | Aviation use-case narrative |
| 50% infrastructure cost reduction | Asserted consequence |
| 100% uptime reliability | Architectural argument |
| 3–5 min microburst warning | Scenario projection |
| "accuracy comparable to dual-radar systems" | Asserted, no comparison reported |

#### Resolution: novelty stated hard, metrics omitted

Novelty and measurement are distinct claims, and only one of them is currently supported.

**Stated strongly on the site** — the priority claim, for which the filing itself is the evidence: first method to reconstruct a full 3D atmospheric velocity field from a *single* Doppler radar, using conservation laws in place of the geometric constraints a second radar provided. Plus the physics-for-geometry substitution framing, the tri-objective NAS with physics compliance as a first-class objective, and the 245K–50M parameter range.

**Omitted until validation exists** — every figure in the table above. Being first to build a system does not establish how well it performs; that requires running it against ground truth. The specific hazard is a reader who works on radar meteorology or scientific ML asking "95% against what ground truth?", to which the answer is "an illustrative figure in a patent draft." Because every other number on the site is sourced, a single unsupported figure would prompt re-examination of all of them.

When validation is run, the numbers go into the existing `tldr` and `source` fields with no structural change.

> Also fix in the patent: it says "five-level hierarchical architecture" but lists four configurations (245K, 2.1M, 15M, 50M).

### 2.4 GLCM Deepfake Detection — IEEE 2025

**Source:** `First_draft/main.tex`

- **Title:** "Integrating GLCM Texture Analysis for Improved Deepfake Detection on CelebDF(v2) Dataset"
- **Authors:** **Kedar Joshi** (first author), Aditya Sinha — Manipal University Jaipur
- **Published:** IEEE, https://ieeexplore.ieee.org/document/10939531
- **Method:** Celeb-DF (v2); frames at 1 FPS; Haar cascade face detection; grayscale; GLCM Contrast and Dissimilarity features; threshold analysis via scatter plots.

Kedar's only first-author publication — worth surfacing as such.

#### Two versions exist

**`First_draft` (GLCM only):** Celeb-DF (v2), 1 FPS frames, Haar cascade, GLCM Contrast and Dissimilarity, threshold analysis via scatter plots. Results section is qualitative only, with no numbers, despite claiming "significant improvements in detection accuracy."

**Later journal version (GLCM + Fourier):** adds Fourier frequency features and a blended LightGBM + CatBoost + XGBoost classifier, evaluated on both FaceForensics++ and Celeb-DF (v2). Reports full comparison tables.

#### Verified results (later version)

| Benchmark | This method | Best baseline | Rank |
|---|---|---|---|
| FaceForensics++ HQ (accuracy) | 0.86 | XceptionNet 0.9885 | 4th of 7 |
| Celeb-DF (v2) (AUC) | 0.77 | Agarwal 0.990 | 4th of 11 |

FF++ baselines: Fridrich 0.7712, Cozzolino 0.8178, Bayar & Stamm 0.9018, Rahmouni 0.8216, MesoNet 0.9526, XceptionNet 0.9885.
Celeb-DF baselines include Tolosana 0.836, Agarwal 0.990, Frick 0.773.

#### ⚠️ The stated claim contradicts the paper's own tables

The abstract claims "significant improvements in detection accuracy compared to existing techniques," and the resume repeats it. **Tables 3 and 4 show the method is mid-pack on both benchmarks**, behind XceptionNet, MesoNet, and Bayar & Stamm on FF++, and behind Agarwal, Tolosana, and (marginally) Frick on Celeb-DF. The accuracy claim is barred from the site.

#### The defensible claim

The paper's own conclusion states the real contribution: *"an optimal trade-off between accuracy and computation… avoids the high-cost feature extraction steps of deep neural networks… beneficial in resource-limited settings, for example mobile or edge devices."*

Hand-crafted texture and frequency features with gradient-boosted trees, reaching 0.86 on FF++ HQ **without a CNN forward pass**, is a legitimate efficiency result. That — not accuracy — is what the site states.

**Resolved:** the paper reports no measured latency, FLOPs, or model size. The efficiency claim therefore cites no number. The site says only "without a CNN forward pass" — architecturally true by construction, requiring no measurement. Repeating the accuracy mistake in the efficiency dimension is the failure mode avoided here.

#### Version, venue, and weighting — resolved

DOI 10939531 is the **conference version**, published via **ACOIT 2024** through IEEE.

ACOIT is not a highly-ranked venue, and Kedar's judgement is to weight the site toward EACL and the CAD preprint. That is correct and is now the design position:

- GLCM appears as a **single line under "Earlier"**, with no detail page.
- It states first authorship and the efficiency framing. Nothing more.
- The 0.86 / 0.77 figures do **not** appear on the site. Mid-pack numbers under a low-ranked venue invite the reader to evaluate his weakest work in detail, which is the opposite of what the page is for. First authorship is the part worth surfacing.

The journal version (GLCM + Fourier) is not represented on the site until its venue status is known.

> Typesetting defect to fix in the paper: the running head reads "Kedar et al." — a given name in the surname slot. It will propagate into citations.

### 2.5 PAFT / MemGenTOI

Listed on the resume; no source document provided.

**Resolution:** PAFT does not appear on the v1 homepage. A `papers/paft.md` file exists with `status: preprint` and a claim-free `tldr`, but is excluded from rendering by an explicit `order: null` until Kedar supplies the source document. Publishing a fourth entry under the reasoning thread whose numbers cannot be verified would violate §3 on the first day of the site's life.

Once a source is provided, it renders as a second entry under "Do models reason, or pattern-match?" — reinforcing that thread rather than diluting it.

---

## 3. Evidence tiers — the organising principle

The four works sit at three very different evidence levels:

| Work | Evidence |
|---|---|
| CAD | Effect sizes, 95% CIs, matched-n, held-out validation, six baselines, four architectures, documented exceptions |
| LogiQAte | Six models, three prompting settings, memorization tests, layer-wise probing, per-task breakdowns |
| GLCM (journal version) | Two benchmarks with full baseline tables — but the result is mid-pack accuracy, not the improvement claimed |
| Auto-PINN + NAS | No validation reported |

The current resume presents all four in the same confident register. That is the failure mode to design against: a reader who follows the GLCM citation looking for the claimed improvement and finds a scatter plot will retroactively discount the CAD and LogiQAte work, which genuinely earns its claims.

**Design principle:** the site must make evidence level structurally visible, and must make it impossible to blur. Measured results are stated flatly. Hypotheses are framed as questions. Unvalidated work carries no claim at all.

---

## 4. Architecture

**Astro 5**, static output, zero client-side JavaScript. Every page pre-rendered at build. No React, no hydration, no runtime framework.

```
src/
  content/
    papers/                 one Markdown file per paper
      logiqate.md
      cad.md
      auto-pinn-nas.md
      glcm-deepfake.md
      paft.md
    threads/                research-area blurbs
      reasoning.md
      representations.md
      physics.md
  data/
    profile.yml             name, role, one-liner, email, links
    cv.yml                  education, experience, skills, certifications
  layouts/
  components/
  styles/
public/
  cv.pdf                    stable URL, never moves
  papers/*.pdf
  figures/*.webp
```

**One mechanism, two outputs.** A paper file's frontmatter renders its homepage row. Its *body* is optional: empty body → listing entry only; non-empty body → Astro generates a detail page at `/papers/<slug>`. LogiQAte and CAD get bodies. The others do not. Promoting a paper later means writing prose in a file that already exists — no second system, no migration.

---

## 5. Content model

### 5.1 Paper schema

```ts
const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    authors:     z.array(z.string()),
    equalContrib: z.array(z.string()).default([]),
    firstAuthor: z.boolean().default(false),
    year:        z.number(),
    thread:      z.enum(['reasoning', 'representations', 'physics', 'earlier']),
    status:      z.enum(['published', 'preprint', 'patent']),
    venue:       z.string().optional(),
    tldr:        z.string().max(180),
    source:      z.string().optional(),   // required by guard 2, see §5.2
    order:       z.number().nullable(),   // null = authored but not rendered (see §2.5)
    pdf:  z.string().optional(),
    code: z.string().optional(),
    data: z.string().optional(),
    doi:  z.string().optional(),
    bibtex: z.string().optional(),
  })
```

### 5.2 Build-time guards

Two `.refine()` rules turn editorial discipline into compiler errors.

**Guard 1 — AAAI-27 compliance:**
```ts
.refine(p => !(p.status === 'preprint' && p.venue),
  'A preprint must not name a venue. See AAAI-27 blind review policy.')
```

**Guard 2 — claim discipline:**
```ts
const QUANTITATIVE_CLAIM = /%|\d+\.\d+/;

.refine(p => !QUANTITATIVE_CLAIM.test(p.tldr) || !!p.source,
  'A tldr stating a percentage or decimal must cite the paper section it came from.')
```

Guard 2 is what prevents §2.3 and §2.4 from silently regressing. Any performance number on the site must name its origin.

The pattern deliberately matches percentages and decimals — `86%`, `50–80%`, `d = 0.337`, `EVR₁ = 10.2%` — and deliberately does *not* match incidental digits in names and ranges: `GPT-4o`, `Celeb-DF (v2)`, `245K–50M`, `Llama-3.1-8B`. A naive `/\d/` would fire on all of those and train the author to ignore the guard, which defeats it.

### 5.3 Why `tldr` is capped at 180 characters

The cap is load-bearing, not cosmetic. It forces "Frontier models lose up to 86% accuracy when a problem is restated in a logically equivalent form" instead of a pasted abstract. Plain-language articulation of what a result *means* is the differentiator with this audience; a hard limit is the only reliable way to get it.

### 5.4 Author rendering

`profile.yml` holds the canonical name string. The author list component bolds it automatically wherever it appears, and appends an equal-contribution note when `equalContrib` includes it:

> Borah, Ghosh, **Joshi**, Guru, Ghosh — *equal contribution*

`firstAuthor: true` renders a plain "First author." line instead. It is set only on GLCM, and it exists because that fact is worth more to a reader than anything else the site can currently say about that paper (§2.4).

### 5.5 Threads and the `earlier` bucket

`thread` values `reasoning`, `representations`, and `physics` each map to a file in `src/content/threads/` supplying the section heading and its two-sentence blurb. `earlier` is deliberately **not** a thread file — it is a bucket with a bare heading and no framing prose. Giving it a blurb would imply a research programme where there is only chronology.

---

## 6. Page structure

Single scroll. Roughly 500 words total.

```
Kedar Joshi
MS Computer Science, University of Southern California

[2–3 sentence positioning statement — the most-read text on the site]

  ──────────────────────────────────────────

RESEARCH

  Do models reason, or pattern-match?
    LogiQAte / Logifus                    EACL 2026
    Frontier models lose up to 86% accuracy when a
    problem is restated in a logically equivalent form.
    Confidence collapses 50–80% in late layers.
    PDF · Code · Dataset · BibTeX

  Reading and steering representations
    Contrastive Activation Decomposition   preprint
    First author. Bias is not one direction. Measuring
    its geometry first predicts which intervention will
    work — housing bias is near rank-1, medicalization
    spans 40+ dimensions.
    PDF · BibTeX

  Physics instead of geometry
    Automated Physics-Informed NAS for
    Single-Radar 3D Wind Reconstruction   patent filed
    3D wind retrieval has required two radars since the
    1960s. This is the first method to reconstruct the
    full field from one, using conservation laws in place
    of the geometry the second radar provided. Architecture
    search across 245K–50M params treats physics compliance
    as a third objective.

  Earlier
    GLCM Texture Analysis for Deepfake Detection  ACOIT 2024
    First author. Texture and frequency features for
    detection without a CNN forward pass.

  ──────────────────────────────────────────

CV (PDF · web)   Google Scholar   GitHub   ORCID   email
```

Note the register shift across entries, implementing §3: measured results stated flatly; the patent framed as an open question ("Whether conservation laws can…"); GLCM carrying no performance claim.

The first two threads form one arc — *find the failure, then locate and fix it in the activations* — and the section is written to make that arc explicit. It is what distinguishes a researcher with a programme from a student with four projects.

### Routes

| Route | Content |
|---|---|
| `/` | The single scroll |
| `/papers/logiqate` | Full detail page (§6.1) |
| `/papers/cad` | Full detail page (§6.1) |
| `/cv` | HTML CV from `cv.yml` |
| `/cv.pdf` | Static, permanent URL |

**Detail pages exist for LogiQAte and CAD only.** Not for the patent — a filed application with no validation (§2.3) cannot fill a page of figures and explanation without padding. Not for GLCM — ACOIT 2024 does not warrant the reader's attention (§2.4).

### 6.1 Paper detail page structure

The homepage is compressed to the point of terseness by design; these pages are where a reader who is already interested gets the argument. Target 600–900 words plus figures.

```
Title
Authors · Venue · Year
PDF · Code · Dataset · BibTeX

The question            One paragraph. What was unknown before
                        this work, stated without jargon.

The approach            Two or three paragraphs. What was built
                        and why that design and not another.

  [FIGURE 1 + caption]  Method / framework diagram

What was found          The results, with the numbers that
                        matter and the conditions under which
                        they hold.

  [FIGURE 2 + caption]  Headline result

  [FIGURE 3 + caption]  Supporting analysis

Limitations             What the work does not establish.
                        Non-optional (see below).

BibTeX                  Copyable block
```

**The Limitations section is mandatory on every detail page.** It is the section that makes the rest credible to this audience, and it is the structural counterweight to the failure mode documented in §3 — every claim on these pages sits next to an explicit statement of what it does not cover. CAD's is already written in its own paper: two of nine AccessEval categories do not reach significance, the DiscrimEval result saturates approval rather than demonstrating fair allocation, and Mistral Target B is a documented sign inversion. Stating those *first*, before a reviewer does, is what separates a researcher from a candidate.

**Figures** are converted from the LaTeX sources at build time to WebP with PDF fallback, at explicit dimensions so CLS stays zero. Every figure carries a real caption written for a reader who has not read the paper — not the caption from the paper, which assumes the surrounding text.

| Page | Figures |
|---|---|
| LogiQAte | `intro.pdf` (obfuscation + layer-wise confidence), `relative_improvement_zero_shot.png` (degradation across tasks) |
| CAD | `figure-00-teaser.pdf` (framework), `figure-05-accesseval-multirank.pdf` (rank-1 failure vs multi-rank), optionally `figure-03-cad-spectral-profiles.pdf` (bias geometry across types) |

These pages carry a hydration budget of zero in v1, but are the designated home for the interactive explorables in §10.

---

## 7. Visual system

- **Type:** one text serif throughout (Source Serif 4 or Newsreader), self-hosted `.woff2`, subset, `font-display: swap`. Two weights maximum. Continuous with the `newtxtext` setting of his papers rather than a costume.
- **Measure:** 65–72 characters, single column, `max-width: 34rem`, generous leading. Readability executed precisely is the entire design; it is what separates austere from unfinished.
- **Scale:** 16px floor. Modular scale ≈1.2. Nothing exceeds ~1.75× body, including his name.
- **Colour:** near-black on warm off-white; one accent, used only for links. Dark mode via `prefers-color-scheme`.
- **Emphasis:** numbers only. Tabular figures, subtle weight increase on measured results. Nothing else on the site is bolded.
- **Motion:** none. CLS is zero by construction. For this audience motion reads as noise.
- **Photo:** small, square, near the contact line. Not a hero.

---

## 8. Quality bar

**Performance** (enforced in CI, build fails below threshold):
- **≤75 KB gzipped transfer for `/`, excluding the photo.** Broken down: ~35–45 KB for two Latin-subset `.woff2` faces, ~8 KB HTML, ~4 KB CSS, 0 KB JS. Fonts dominate the budget, so the subset must be Latin-basic plus the specific glyphs the site actually uses (∇, ×, ≈, ₁, –). If the two-weight budget proves tight, drop to one weight and let the single accent come from size and colour rather than boldness.
- LCP < 1.0s · INP < 200ms · CLS = 0.
- Lighthouse ≥ 98 across all four categories, via `treosh/lighthouse-ci-action` on every PR.

**Accessibility — WCAG 2.2 AA:**
- Semantic landmarks, single `h1`, no skipped heading levels.
- 16px floor; contrast ≥ 4.5:1 verified in both themes.
- Visible focus rings; full keyboard operation; `axe-core` in CI.

**Machine-readability** — how faculty, search engines, and citation indexes actually find him:
- `Person` schema on `/` with `affiliation` and `sameAs` → Scholar, GitHub, ORCID.
- `ScholarlyArticle` schema on each paper page.
- Highwire Press `citation_*` meta tags on paper pages (what Google Scholar's crawler reads).
- `sitemap.xml`, `robots.txt`, canonical URLs.

**Testing** — proportionate, not ceremonial:
- Zod schema validation at build (covers both guards in §5.2).
- Internal link + PDF checker. Dead PDF links are the most common form of academic-site rot.
- One Playwright smoke test: homepage renders, every paper link resolves, `/cv.pdf` returns 200.
- Visual regression testing: explicitly skipped as overkill.

---

## 9. Deploy

- Repo: **`kedarjoshi.github.io`** — a GitHub *user* site, so content sits at the root (`/papers/logiqate`, `/cv.pdf`). A project repo would nest everything under `/reponame/` and make Astro's `base` config a permanent nuisance.
- Astro config: `site: 'https://kedarjoshi.github.io'`, `base: '/'`.
- GitHub Actions with `withastro/action`. Push to `main` → build → publish.
- **No custom domain.** Decided by the user. Not a one-way door: adding one later is a `CNAME` file plus a DNS record, with zero content changes.
- **Never host at a `usc.edu/~kedar` path.** That path dies at graduation in May 2028 and takes every emailed link with it. The GitHub account persists.
- `/cv.pdf` is a permanent URL. Once it is in a professor's inbox it must never 404.

---

## 10. Future extension (explicitly not in v1)

The user chose "keep it clean" for now but flagged interest later. The architecture must not preclude it:

- Paper detail pages are already generated from Markdown bodies, so an interactive explorable of Logifus obfuscation or the CAD singular-value spectrum drops into an existing page as a component. No rewrite.
- Astro islands allow one hydrated component on one route without adding JavaScript to any other page, preserving the §8 budget elsewhere.
- Highest-value candidate: a Logifus explorable letting a reader restate a problem and watch measured accuracy fall.

---

## 11. Open items

Blocking implementation:

| Item | Owner | Notes |
|---|---|---|
| Positioning statement (2–3 sentences) | Kedar | The most-read text on the site |
| USC lab / advisor, current project | Kedar | For the "currently" line; may legitimately be empty in week one |
| ~~Non-anonymous CAD preprint PDF~~ | ✅ Done | Built and verified 2026-08-21: authors and affiliations render, no anonymity footer, zero AAAI/review-status references. Policy-compliant |
| Permanent contact email | Kedar | Flagged, not actioned. The Manipal student account expires post-graduation; the preprint outlives it. Fixable later via `\thanks{}` |
| arXiv posting decision | Kedar | Preferred over self-hosting: citable ID, Scholar indexing, no link rot. Listing must not mention AAAI or review status |
| Journal-version venue status | Kedar | GLCM + Fourier version; not on the site until known (§2.4) |
| Detail-page prose for LogiQAte and CAD | Kedar | Question / approach / findings / limitations, per §6.1 |
| ORCID iD | Kedar | Does not exist yet; being created |
| Google Scholar profile | Kedar | Does not exist yet; being created |
| Headshot | Kedar | Square, ≥800px |
| Updated CV PDF | Kedar | Change list and edit prompt in `docs/cv-revision-brief.md` |

Non-blocking, flagged for Kedar's own benefit:
- EACL six-vs-nine models inconsistency (§2.1).
- Patent five-vs-four configurations inconsistency (§2.3).
- GLCM running head reads "Kedar et al." instead of "Joshi et al." (§2.4).
- GLCM abstract claims an accuracy improvement its own tables contradict (§2.4).
- Resume rewrite. It simultaneously *undersells* the portfolio (omits CAD entirely; frames the EACL work as an internship) and *oversells* two entries (the unvalidated patent metrics, the contradicted GLCM accuracy claim). Both directions cost him with the same reader.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| AAAI-27 policy violation via a venue label or an anonymous-build PDF | Schema guard 1; explicit PDF-build check in the open items |
| Unvalidated claims migrating from patent/GLCM onto the site | Schema guard 2; §2.3 and §2.4 name the barred claims explicitly |
| Site goes stale after launch | Single-file edits; no framework churn; no blog to abandon |
| Missing content blocks the 24 Aug target | Ship with `currently` empty and GLCM claim-free; both are honest and both can be filled in later |
| CV HTML and CV PDF drift | Accepted deliberately. A YAML→PDF pipeline is not worth the maintenance cost |
