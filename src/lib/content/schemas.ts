import { z } from 'zod';

const Https = z.url({ protocol: /^https$/ });
const PublicPath = z.string().regex(/^\/[a-z0-9/_.-]+$/);

/** Privacy guard: no phone, WhatsApp or tel links can ever be published. */
export const isNotPhoneLink = (s: string): boolean => !/^tel:|wa\.me|whatsapp/i.test(s);
const NoPhone = (schema: z.ZodString) => schema.refine(isNotPhoneLink, 'phone links are not allowed');
const SafeHttps = Https.refine(isNotPhoneLink, 'phone links are not allowed');

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ImageRefSchema = z
  .object({
    src: PublicPath,
    alt: z.string().min(5).max(160),
    fit: z.enum(['cover', 'contain']).default('cover'),
  })
  .strict();

export const ProfileSchema = z
  .object({
    name: z.string(),
    shortName: z.string(),
    nameLines: z.tuple([z.string(), z.string(), z.string()]),
    role: z.string(),
    roleShort: z.string(),
    location: z.literal('Maringá, PR'),
    available: z.boolean(),
    heroIntro: z.string().max(320),
    bio: z.string().max(600),
    motto: z.string().max(120).optional(),
    typewriterPhrases: z.array(z.string().max(40)).min(1).max(5),
    heroChips: z.array(z.string().max(24)).min(1).max(4),
    hints: z.array(z.string().max(60)).max(3),
    photo: ImageRefSchema,
    cvPath: PublicPath.endsWith('.pdf'),
    connect: z
      .array(
        z
          .object({
            kind: z.enum(['linkedin', 'github', 'instagram', 'site', 'email']),
            label: z.string(),
            display: z.string(),
            url: NoPhone(z.string()),
            personal: z.boolean(),
          })
          .strict()
          .superRefine((v, ctx) => {
            const ok = v.kind === 'email' ? v.url.startsWith('mailto:') : v.url.startsWith('https://');
            if (!ok) {
              ctx.addIssue({
                code: 'custom',
                path: ['url'],
                message: 'email needs mailto:, others https://',
              });
            }
          }),
      )
      .min(1),
  })
  .strict();

const YearMonth = z.string().regex(/^\d{4}(-\d{2})?$/);

export const ExperienceSchema = z
  .object({
    role: z.string(),
    org: z.string(),
    start: YearMonth,
    end: YearMonth.nullable(),
    short: z.string().max(24),
  })
  .strict();
export const ExperienceListSchema = z.array(ExperienceSchema);

export const TECH_CATEGORIES = ['languages', 'frontend-mobile', 'backend', 'data', 'tools'] as const;
export const TechCategorySchema = z.enum(TECH_CATEGORIES);
export const TechItemSchema = z
  .object({
    name: z.string().max(40),
    monogram: z.string().min(1).max(3),
    category: TechCategorySchema,
  })
  .strict();
export const StackSchema = z.object({ items: z.array(TechItemSchema).min(1) }).strict();

export const ProjectSchema = z
  .object({
    title: z.string().max(60),
    kind: z.string().max(32),
    summary: z.string().min(40).max(260),
    metaDescription: z.string().max(160).optional(),
    cover: ImageRefSchema,
    gallery: z.array(ImageRefSchema).max(8).default([]),
    tech: z.array(z.string().max(32)).min(1).max(16),
    features: z.array(z.string().min(3).max(140)).min(1).max(10),
    link: z.discriminatedUnion('status', [
      z.object({ status: z.literal('live'), url: SafeHttps }).strict(),
      z.object({ status: z.literal('private-tool') }).strict(),
      z.object({ status: z.literal('none') }).strict(),
    ]),
    repoUrl: SafeHttps.refine((u) => u.startsWith('https://github.com/'), 'must be a github.com URL').optional(),
    featured: z.boolean().default(false),
    order: z.number().int().min(0),
  })
  .strict();

export const CertificateSchema = z
  .object({
    title: z.string().max(80),
    issuer: z.string().max(60),
    date: z.string().regex(/^\d{4}-\d{2}$/),
    image: ImageRefSchema.optional(),
    url: SafeHttps.optional(),
  })
  .strict();

export type ImageRef = z.infer<typeof ImageRefSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type TechCategory = z.infer<typeof TechCategorySchema>;
export type TechItem = z.infer<typeof TechItemSchema>;
export type ProjectData = z.infer<typeof ProjectSchema>;
export type Project = ProjectData & { slug: string };
export type CertificateData = z.infer<typeof CertificateSchema>;
export type Certificate = CertificateData & { slug: string };
export type StackGroup = { category: TechCategory; items: TechItem[] };
