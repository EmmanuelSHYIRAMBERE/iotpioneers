/**
 * Organization JSON-LD built only from verified content. Any unverified field is left out;
 * if the organisation name itself is unverified, no structured data is emitted at all.
 */
import type { ContactDetails, SocialLink, VerifiableText } from "@/content/types";

export interface OrganizationInput {
  legalName: VerifiableText;
  siteUrl: URL;
  siteUrlVerified: boolean;
  contact: ContactDetails;
  social: readonly SocialLink[];
  logoPath: string | null;
}

export function buildOrganizationJsonLd(input: OrganizationInput): Record<string, unknown> | null {
  if (!input.legalName.verified) return null;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.legalName.text,
  };
  if (input.siteUrlVerified) {
    data.url = input.siteUrl.toString();
    if (input.logoPath) data.logo = new URL(input.logoPath, input.siteUrl).toString();
  }
  if (input.contact.verified) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: input.contact.address,
      addressLocality: "Kigali",
      addressCountry: input.contact.countryCode,
    };
    data.contactPoint = {
      "@type": "ContactPoint",
      telephone: input.contact.phone,
      email: input.contact.email,
      contactType: "customer service",
    };
  }
  const sameAs = input.social.filter((link) => link.verified).map((link) => link.href);
  if (sameAs.length > 0) data.sameAs = sameAs;
  return data;
}
