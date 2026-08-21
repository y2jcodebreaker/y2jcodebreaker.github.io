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
