import {
  shopCategories,
  shopHeading,
  shopHighlights,
} from "@/content/shopHighlights";
import { shopCategoryImages } from "@/content/images";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyMarker } from "@/components/ui/VerifyMarker";

/** Section 07: "Can I buy what I need to build?" A tactile, light hardware catalogue. */
export function ShopShowcase() {
  return (
    <section
      id="shop"
      aria-labelledby="shop-title"
      className="surface-light section-pad border-t border-slate-200 bg-cloud-50 text-navy-950"
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
    </section>
  );
}
