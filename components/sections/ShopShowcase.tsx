import { Building2, GraduationCap, Wrench, type LucideIcon } from "lucide-react";
import {
  shopAudiences,
  shopCategories,
  shopHeading,
  shopHighlights,
} from "@/content/shopHighlights";
import { shopCategoryImages } from "@/content/images";
import type { ShopAudience } from "@/content/types";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { ICON_STROKE } from "@/lib/tokens";

const AUDIENCE_ICONS: Record<ShopAudience["icon"], LucideIcon> = {
  graduation: GraduationCap,
  wrench: Wrench,
  building: Building2,
};

/** Section 07: "Can I buy what I need to build?" A tactile, light hardware catalogue. */
export function ShopShowcase() {
  return (
    <section
      id="shop"
      aria-labelledby="shop-title"
      className="surface-light section-pad bg-cloud-50 text-navy-950"
    >
      {/* Title, then the lead with the shop button beside it, bottoms aligned in one row, so
          the button is never detached from its heading (audit issue 24). */}
      <Reveal from="left" className="container-page">
        <VerifyMarker verified={shopHeading.verified}>
          <SectionHeading
            id="shop-title"
            eyebrow={shopHeading.eyebrow}
            title={shopHeading.title}
            tone="onLight"
          />
          <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <p className="max-w-prose text-lead text-slate-600">{shopHeading.lead}</p>
            <AnimatedButton
              href={shopHeading.cta.href}
              external
              size="lg"
              tone="light"
              className="shrink-0"
            >
              {shopHeading.cta.label}
            </AnimatedButton>
          </div>
        </VerifyMarker>
      </Reveal>

      <div className="mt-14 md:mt-16">
        <ProductGallery
          categories={shopCategories.map((category) => ({
            id: category.id,
            label: category.label,
          }))}
          products={shopHighlights.map((product) => ({
            id: product.id,
            name: product.name,
            displayName: product.displayName ?? product.name,
            categoryImage: shopCategoryImages[product.categoryId] ?? null,
            categoryId: product.categoryId,
            image: product.image,
            illustration: product.illustration,
            href: product.href,
            verified: product.verified,
          }))}
          labels={{
            all: shopHeading.allLabel,
            emptyMessage: shopHeading.emptyMessage,
            emptyAction: shopHeading.emptyActionLabel,
            errorMessage: shopHeading.errorMessage,
            errorFallback: shopHeading.errorFallbackLabel,
            illustrative: shopHeading.illustrativeLabel,
          }}
          shopHref={shopHeading.cta.href}
        />
      </div>

      <div className="container-page mt-20 md:mt-24">
        <ul className="grid grid-cols-1 gap-8 border-t border-slate-200 pt-10 md:grid-cols-3 md:gap-6 xl:gap-8">
          {shopAudiences.map((audience, index) => {
            const Icon = AUDIENCE_ICONS[audience.icon];
            return (
              <Reveal as="li" key={audience.id} index={index}>
                <VerifyMarker verified={audience.verified} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-button border border-deep-gold/50 text-deep-gold">
                    <Icon aria-hidden="true" size={20} strokeWidth={ICON_STROKE} />
                  </span>
                  <span>
                    <span className="block font-display text-h4 text-navy-950">
                      {audience.title}
                    </span>
                    <span className="mt-1 block text-body text-slate-600">{audience.text}</span>
                  </span>
                </VerifyMarker>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
