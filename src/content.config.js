import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const artikel = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/artikel'
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pillar: z.enum([
      'program-pengendalian-kebisingan',
      'alat-pelindung-diri',
      'penyakit-akibat-kerja',
      'panduan-penerapan-smk3'
    ]),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
    related: z.array(z.string()).optional()
  })
});

export const collections = { artikel };
