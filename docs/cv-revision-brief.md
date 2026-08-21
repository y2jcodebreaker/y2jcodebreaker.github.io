# CV Revision Brief

**Date:** 2026-08-21
**Source reviewed:** `Resume_edited_collegepond_august_2026_2.pdf`
**Method:** upload the existing PDF to the Claude app and apply the prompt in §3 as edits.

---

## 1. Why the CV needs revision

Two problems pull in opposite directions, and both cost credibility with the same reader.

**It undersells.** The Contrastive Activation Decomposition work is absent entirely — the portfolio's strongest artifact, with effect sizes, confidence intervals, held-out validation, six baselines, and four architectures. The EACL 2026 acceptance is buried inside a bullet under "Research Intern," rather than presented as an accepted main-conference paper with equal-contribution authorship.

**It oversells.** Two claims are not supported by their own source documents:

- *"achieving significant improvements in detection accuracy"* (GLCM) — the paper's own Tables 3 and 4 place the method 4th of 7 on FaceForensics++ HQ (0.86 vs XceptionNet 0.9885) and 4th of 11 on Celeb-DF v2 (0.77 AUC vs Agarwal 0.990). The paper contradicts its own abstract.
- The patent's performance figures — 95% wind shear detection, 50% cost reduction, 100% uptime — appear in the patent draft inside hypothetical scenarios ("Consider the scenario where aviation regulatory bodies…"). No validation, no ground truth, no test set is reported.

A reader who checks either claim discounts everything else on the page, including the CAD work that fully earns its claims.

**It is out of date.** No USC entry; Manipal still reads as current.

---

## 2. Change list

| # | Change | Reason |
|---|---|---|
| 1 | Add USC: MS Computer Science, Aug 2026 – May 2028, Los Angeles | Currently absent |
| 2 | Move Manipal to past tense; B.Tech CS with Distinction, CGPA 8.88/10, May 2026 | Now completed |
| 3 | Create a dedicated **Publications** section, separate from projects | Mixing a peer-reviewed paper with unpublished projects flattens the distinction a reader cares most about |
| 4 | Add CAD as a publication entry | Absent; strongest work |
| 5 | Promote LogiQAte to a publication entry with full author list and equal-contribution marker | Currently buried in an internship bullet |
| 6 | Delete "achieving significant improvements in detection accuracy" from the GLCM entry; replace with the efficiency framing | Contradicted by the paper's own tables |
| 7 | Delete all patent performance figures; replace with the priority claim | Unvalidated |
| 8 | Reconcile "six state-of-the-art models" vs "nine" | The paper's abstract and contributions disagree; pick one |
| 9 | Add website, Google Scholar, ORCID to the header once created | Discoverability |
| 10 | Add a US phone number if available | Currently +91 only, while based in Los Angeles |
| 11 | Mark first authorship explicitly on the GLCM paper | His only first-author publication; currently invisible |

---

## 3. Prompt for the Claude app

Upload `Resume_edited_collegepond_august_2026_2.pdf`, then paste the following.

---

I'm attaching my current CV. Please edit it — keep the existing structure, formatting, and voice, and change only what I list below. Do not rewrite sections I haven't flagged, and do not add anything I haven't asked for.

**Context:** I'm an incoming MS Computer Science student at USC (Aug 2026 – May 2028), applying to PhD programs and to research groups. The CV is currently out of date and, in two places, claims results my own papers don't support. Fix both.

**1. Education**

Add above Manipal:
> University of Southern California, Los Angeles, CA — MS in Computer Science — Aug 2026 – May 2028

Change Manipal to past tense. Keep the CGPA and Distinction.

**2. Create a new "Publications" section, placed directly after Education**

Move the peer-reviewed work out of "Professional Experience" and "Academic Projects and Papers" into this new section. Format each as a proper citation, not as an experience bullet.

Entry 1:
> Abhilekh Borah, Shubhra Ghosh\*, **Kedar Joshi**\*, Aditya Kumar Guru\*, Kripabandhu Ghosh. "Don't Judge a Book by its Cover: Testing LLMs' Robustness Under Logical Obfuscation." **EACL 2026** (main conference). \*Equal contribution.

Add two or three sub-bullets:
- Introduced Logifus, a structure-preserving logical obfuscation algorithm, and LogiQAte, a 1,108-question diagnostic benchmark across four reasoning tasks.
- Frontier models degrade by 28.8% on average under logically equivalent rewrites, up to −86% in the worst case.
- Layer-wise analysis shows 50–80% collapse in late-layer next-token confidence; memorization detection rises from 50% to 82%.
- Code: github.com/abhilekhborah/logical-obfuscation · Data: huggingface.co/datasets/abhilekhborah/LogiQAte

Entry 2 — this is missing from my CV entirely and should be added. Place it **first** in the section, above the EACL entry, since I'm first author on it:
> **Kedar Joshi**, Kripabandhu Ghosh. "Contrastive Activation Decomposition: Activation Steering Mitigation by Leveraging Bias Geometry." Preprint, 2026. **First author.**

Do not name a venue for this one and do not write "under review" or "submitted" anywhere — I need it listed as a plain preprint.

Sub-bullets:
- Diagnostic that applies SVD to contrastive activation differences, returning three statistics that prescribe intervention rank and target layers before any steered generation.
- Bias geometry varies by type: housing discrimination is near rank-1 (EVR₁ = 67.9%), medicalization bias is diffuse across 40+ dimensions (EVR₁ = 10.2%), explaining why rank-1 steering methods fail on one and succeed on the other.
- On matched-n AccessEval (n=250), matches CAA's debiasing (d = 0.337 vs 0.341, overlapping 95% CIs) with no per-task hyperparameter sweep, at a fifth of the output-quality cost (judge Δ −0.12 vs −0.54).
- Validated across Llama-3.1-8B, Qwen2.5-7B, Gemma-2-9B, and Mistral-7B.

Entry 3:
> **Kedar Joshi**, Aditya Sinha. "Integrating GLCM Texture Analysis for Improved Deepfake Detection on CelebDF(v2) Dataset." ACOIT 2024, IEEE. **First author.**

Replace the existing accuracy bullet entirely. **Delete "achieving significant improvements in detection accuracy" — my own results tables contradict it.** Use instead:
- Texture and frequency features with gradient-boosted trees, detecting manipulation without a CNN forward pass.
- Targets resource-constrained and edge deployment where CNN-based detectors are impractical.
- ieeexplore.ieee.org/document/10939531

**3. Professional Experience — rewrite both entries**

For IISER Kolkata (May 2025 – Nov 2025), remove the bullets now covered by the LogiQAte publication entry so they don't appear twice. Keep only the role and one line of scope. If it currently says "six state-of-the-art models," keep "six" and don't write "nine."

For India Meteorological Department (Nov 2024 – Present), **delete every performance number.** Specifically remove any mention of 95% wind shear detection accuracy, 50% infrastructure cost reduction, 100% uptime, 3–5 minute warning times, or accuracy comparable to dual-radar systems. Those figures come from hypothetical scenarios in the patent draft, not from validation, and I can't defend them if asked.

Replace with:
- Filed a patent application for automated physics-informed neural architecture search for single-radar 3D atmospheric velocity field reconstruction.
- 3D wind retrieval has required two or more Doppler radars since the 1960s because a single radar measures only the radial velocity component. This is the first method to reconstruct the full field from one radar, using conservation laws — continuity, bounded vorticity, dynamics tolerances — in place of the geometric constraints the second radar provided.
- Architecture search combining DARTS and Bayesian optimization, treating physics compliance as a third objective alongside accuracy and efficiency, across 245K to 50M+ parameters.

**4. Header**

Add placeholders I'll fill in: personal website, Google Scholar, ORCID. Keep the Los Angeles address and email.

**5. Constraints**

- Fit on one page if possible; two is acceptable.
- Do not add any number that isn't in this message.
- Do not use words like "revolutionary," "novel," "cutting-edge," "pioneering," or "significant improvements."
- Keep bullets factual and specific. Let the numbers carry the emphasis.

---

## 4. After the edit

Check that the following are all true of the output:

- [ ] No mention of AAAI, "submitted," or "under review" anywhere near the CAD entry
- [ ] No performance figures on the IMD/patent entry
- [ ] No accuracy claim on the GLCM entry
- [ ] "six" not "nine" models, used consistently
- [ ] CAD present, listed first, first authorship marked
- [ ] USC present; Manipal in past tense
- [ ] First authorship marked on GLCM
- [ ] Equal contribution marked on LogiQAte

Then export as `cv.pdf` and place it at the site root so it serves from a permanent `/cv.pdf` URL.
