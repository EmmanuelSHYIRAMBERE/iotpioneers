import {
  ArrowUpRight,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { contact } from "@/content/contact";
import { footerCompanyLinks, products } from "@/content/navigation";
import { site } from "@/content/site";
import { socialLinks } from "@/content/social";
import type { SocialPlatform } from "@/content/types";
import { Reveal } from "@/components/ui/Reveal";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";
import { runStagger } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";
import { BackToTop } from "./BackToTop";
import { BrandSignature } from "./BrandSignature";
import { Logo } from "./Logo";

const SOCIAL_ICONS: Record<SocialPlatform, LucideIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  x: Twitter,
  github: Github,
};

const linkClass =
  "group relative inline-flex min-h-11 items-center gap-1.5 text-slate-400 transition-colors duration-200 hover:text-cloud-50";
const underline =
  "absolute bottom-2.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-200 group-hover:scale-x-100";

/** Non-breaking space. */
const NBSP = String.fromCharCode(160);

/** Renders "IoT Pioneers Shop ↗" with the last word and the icon kept together on one line. */
function InlineIconText({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop() ?? "";
  const lead = words.join(" ");
  return (
    <>
      {lead ? `${lead} ` : null}
      <span className="whitespace-nowrap">
        {last}
        {NBSP}
        <ArrowUpRight
          aria-hidden="true"
          size={16}
          strokeWidth={ICON_STROKE}
          className="inline-block align-[-2px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </>
  );
}

/**
 * Section 10: the deepest navy footer. Four columns at lg (brand, Company, Products, Contact),
 * two at md, one on mobile. The bottom bar holds the copyright (year computed), the Reduce motion
 * toggle and Back to top.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="surface-dark relative isolate overflow-hidden bg-navy-1000 pt-16 text-cloud-50 md:pt-20">
      {site.flags.imigongoTexture ? (
        <AnimatedBackground variant="imigongoTexture" className="-z-10" />
      ) : null}
      <div className="container-page">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          <Reveal index={0} stepMs={runStagger.footerColumns} className="lg:col-span-4">
            <div>
              <Logo alt={site.name.text} size="footer" />
              <VerifyMarker verified={site.shortDescription.verified} className="mt-5">
                <p className="max-w-[40ch] text-body text-slate-400">
                  {site.shortDescription.text}
                </p>
              </VerifyMarker>
              {socialLinks.length > 0 ? (
                <ul aria-label="Social media" className="mt-6 flex gap-1">
                  {socialLinks.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform];
                    return (
                      <li key={social.href}>
                        <VerifyMarker verified={social.verified} as="span" className="block">
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${social.label} (opens in a new tab)`}
                            className="flex size-11 items-center justify-center rounded-button text-slate-400 transition-colors duration-200 hover:bg-navy-900 hover:text-cloud-50"
                          >
                            <Icon aria-hidden="true" size={20} strokeWidth={ICON_STROKE} />
                          </a>
                        </VerifyMarker>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </Reveal>

          <Reveal
            index={1}
            stepMs={runStagger.footerColumns}
            className="lg:col-span-2 lg:col-start-6"
          >
            <nav aria-labelledby="footer-company">
              <h2
                id="footer-company"
                className="font-mono text-small tracking-[0.14em] text-cloud-50 uppercase"
              >
                Company
              </h2>
              <ul className="mt-4 flex flex-col">
                {footerCompanyLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                      <span aria-hidden="true" className={underline} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Reveal
            index={2}
            stepMs={runStagger.footerColumns}
            className="lg:col-span-2 lg:col-start-8"
          >
            <nav aria-labelledby="footer-products">
              <h2
                id="footer-products"
                className="font-mono text-small tracking-[0.14em] text-cloud-50 uppercase"
              >
                Products
              </h2>
              <ul className="mt-4 flex flex-col">
                {products.map((product) => (
                  <li key={product.id}>
                    <a
                      href={product.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {/* Issue 34: the icon stays inline after the last word (no-wrap group with a
                        non-breaking space), so it never drifts to the far right. */}
                      <span>
                        <InlineIconText text={product.name} />
                      </span>{" "}
                      <span className="sr-only">(opens in a new tab)</span>
                      <span aria-hidden="true" className={underline} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Reveal
            index={3}
            stepMs={runStagger.footerColumns}
            className="lg:col-span-3 lg:col-start-10"
          >
            <div>
              <h2 className="font-mono text-small tracking-[0.14em] text-cloud-50 uppercase">
                Contact
              </h2>
              <VerifyMarker verified={contact.verified} className="mt-4">
                <address className="flex flex-col not-italic">
                  <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                    {contact.email}
                    <span aria-hidden="true" className={underline} />
                  </a>
                  <a href={`tel:${contact.phone}`} className={linkClass}>
                    {contact.phoneDisplay}
                    <span aria-hidden="true" className={underline} />
                  </a>
                  <p className="mt-2 text-body text-slate-400">{contact.address}</p>
                  <p className="mt-1 text-small text-slate-400">{contact.hours}</p>
                </address>
              </VerifyMarker>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 md:mt-24">
          <BrandSignature text={site.legalName.text.replace(/\s+Ltd$/, "")} />
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-line-dark-soft py-6 md:flex-row md:items-center md:justify-between">
          <VerifyMarker verified={site.legalName.verified}>
            <p className="text-legal text-slate-400">
              © {year} {site.legalName.text}. All rights reserved.
            </p>
          </VerifyMarker>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
