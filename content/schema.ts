/**
 * zod schemas mirroring content/types.ts. Used only at build and test time
 * (scripts/checkContent.ts), never shipped to the browser.
 */
import { z } from "zod";

export const verifiableSchema = z.object({
  verified: z.boolean(),
  source: z.string().min(1, "Every content object needs a source note"),
  todo: z.string().min(1).optional(),
});

/** Visible copy must never contain the internal placeholder syntax (audit issue 12). */
const noPlaceholder = (value: string): boolean => !value.includes("[VERIFY:");

/** A visible string field that must not contain the placeholder syntax. */
const visibleString = z
  .string()
  .min(1)
  .refine(
    noPlaceholder,
    "Visible copy must not contain [VERIFY: ...]; use draft copy and a todo note",
  );

export const verifiableTextSchema = verifiableSchema.extend({ text: z.string().min(1) });
export const visibleTextSchema = verifiableSchema.extend({
  text: z
    .string()
    .min(1)
    .refine(
      noPlaceholder,
      "Visible copy must not contain [VERIFY: ...]; use draft copy and a todo note",
    ),
});

const sectionHref = z.string().regex(/^#[a-z]+$/, "In page links must be #section anchors");
const httpsUrl = z.url({ protocol: /^https$/ });

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(2),
  external: z.boolean(),
});

export const productEntrySchema = verifiableSchema.extend({
  id: z.enum(["iotdatahub", "shop"]),
  name: z.string().min(1),
  description: z.string().min(1),
  sectionHref,
  externalHref: z.enum(["https://www.iotdatahub.rw/", "https://iotpioneersshop.com/"]),
  ctaLabel: z.string().min(1),
});

export const solutionSchema = verifiableSchema.extend({
  id: z.string().min(1),
  index: z.string().regex(/^\d{2}$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  deliverables: z.array(z.string().min(1)).min(3).max(4),
  illustration: z.enum(["iot", "software", "cloud", "automation", "integration"]),
  ctaLabel: z.string().min(1),
});

export const editorialImageSchema = verifiableSchema.extend({
  src: z.string().startsWith("/images/").nullable(),
  alt: z.string().min(1).refine(noPlaceholder, "Alt text must not contain [VERIFY: ...]"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  placeholderLabel: z.string().min(1),
});

export const shopCategorySchema = verifiableSchema.extend({
  id: z.string().min(1),
  label: z.string().min(1),
  href: httpsUrl.startsWith("https://iotpioneersshop.com/"),
});

export const productHighlightSchema = verifiableSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  image: z
    .object({
      src: z.string().startsWith("/images/shop/"),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullable(),
  illustration: z.enum(["board", "camera", "sensor", "display", "segment", "module", "component"]),
  href: httpsUrl.startsWith("https://iotpioneersshop.com/"),
});

export const shopAudienceSchema = verifiableSchema.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  icon: z.enum(["graduation", "wrench", "building"]),
});

export const contactDetailsSchema = verifiableSchema.extend({
  email: z.string().min(3),
  phone: z.string().regex(/^(\+\d{8,15}|\[VERIFY:.+\])$/, "Phone must be in international format"),
  phoneDisplay: z.string().min(1),
  address: z.string().min(1),
  locality: z.string().min(1),
  countryCode: z.string().length(2),
  hours: z.string().min(1),
});

export const socialLinkSchema = verifiableSchema.extend({
  platform: z.enum(["linkedin", "instagram", "youtube", "facebook", "x", "github"]),
  label: z.string().min(1),
  href: httpsUrl,
});

export const principleSchema = verifiableSchema.extend({
  id: z.string().min(1),
  index: z.string().regex(/^\d{2}$/),
  title: z.string().min(1),
  text: z.string().min(1),
});

export const dataHubStepSchema = verifiableSchema.extend({
  id: z.enum(["connect", "collect", "monitor", "act"]),
  index: z.string().regex(/^\d{2}$/),
  title: z.string().min(1),
  text: z.string().min(1),
});

export const featureSchema = verifiableSchema.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  icon: z.enum(["plug", "activity", "chart", "layers", "bell"]),
});

/** Stand-in photographs (content/images.ts). */
const stockImageSchema = verifiableSchema.extend({
  src: z.string().startsWith("/images/").nullable(),
  alt: z.string().refine(noPlaceholder, "Alt text must not contain [VERIFY: ...]"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  photographer: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
  illustrative: z.boolean(),
});

/** Schemas for each content export, keyed "file.export". Exports without an entry are walked but not shape checked. */
export const contentSchemas: Record<string, z.ZodType> = {
  "navigation.navItems": z.array(navItemSchema).min(1),
  "navigation.products": z.array(productEntrySchema).length(2),
  "navigation.footerCompanyLinks": z.array(navItemSchema),
  "solutions.solutions": z.array(solutionSchema).min(1).max(5),
  "shopHighlights.shopCategories": z.array(shopCategorySchema).min(1),
  "shopHighlights.shopHighlights": z.array(productHighlightSchema).max(16),
  "shopHighlights.shopAudiences": z.array(shopAudienceSchema),
  "principles.principles": z.array(principleSchema).length(4),
  "contact.contact": contactDetailsSchema,
  "images.solutionImages": z.record(z.string(), stockImageSchema),
  "images.whyBandImage": stockImageSchema,
  "images.ctaImage": stockImageSchema,
  "images.shopCategoryImages": z.record(
    z.string(),
    stockImageSchema.refine(
      (image) => image.illustrative && image.alt.startsWith("Illustrative image"),
      "Shop images must be labelled as illustrative",
    ),
  ),
  "principles.whyHeading": verifiableSchema.extend({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: visibleString,
  }),
  "pathTable.pathHeading": verifiableSchema.extend({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lead: visibleString,
    caption: z.string().min(1),
    needsHeader: z.string().min(1),
    ctaRowLabel: z.string().min(1),
  }),
  "pathTable.pathNeeds": z.array(z.object({ id: z.string(), label: z.string().min(1) })).length(3),
  "pathTable.pathOfferings": z
    .array(
      verifiableSchema.extend({
        id: z.enum(["engineering", "iotdatahub", "shop"]),
        name: z.string().min(1),
        serves: z.array(z.string()),
        ctaLabel: z.string().min(1),
        ctaAccessibleName: z.string().min(1),
        href: z.string().min(1),
        external: z.boolean(),
      }),
    )
    .length(3),
  "social.socialLinks": z.array(socialLinkSchema),
  "site.site": z.object({
    name: verifiableTextSchema,
    legalName: verifiableTextSchema,
    siteUrl: verifiableTextSchema,
    shortDescription: verifiableTextSchema,
    metaTitle: verifiableTextSchema,
    metaDescription: verifiableTextSchema,
    logo: verifiableSchema.extend({
      src: z.string().startsWith("/images/brand/"),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
    flags: verifiableSchema.extend({ imigongoTexture: z.boolean() }),
  }),
  "about.about": z.object({
    lead: visibleTextSchema,
    body: visibleTextSchema,
    annotation: visibleTextSchema,
    images: z.object({ large: editorialImageSchema, small: editorialImageSchema }),
    mission: verifiableTextSchema.nullable(),
    vision: verifiableTextSchema.nullable(),
  }),
  "dataHub.dataHub": z.object({
    steps: z.array(dataHubStepSchema).length(4),
    features: z.array(featureSchema).length(4),
    cta: z.object({ label: z.string(), href: z.literal("https://www.iotdatahub.rw/") }),
  }),
};
