import { Mail, MapPin, Phone } from "lucide-react";
import { contact, contactSection } from "@/content/contact";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CopyToClipboard } from "@/components/ui/CopyToClipboard";
import { MountWhenNear } from "@/components/ui/MountWhenNear";
import { Reveal } from "@/components/ui/Reveal";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { WordReveal } from "@/components/ui/WordReveal";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";
import { ParticleNetwork } from "@/components/visuals/ParticleNetwork";
import { StaticNetwork } from "@/components/visuals/StaticNetwork";
import { ICON_STROKE } from "@/lib/tokens";

/**
 * Section 09: "How do I start?" The only centred section. The node network converges into one
 * bright node, closing the "Signal to Insight" story. No contact form (no verified endpoint).
 */
export function ContactSection() {
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contactSection.emailSubject)}`;
  const tel = `tel:${contact.phone}`;

  const details = [
    {
      id: "email",
      icon: Mail,
      text: contact.email,
      href: `mailto:${contact.email}`,
      copyLabel: "email address",
    },
    { id: "phone", icon: Phone, text: contact.phoneDisplay, href: tel, copyLabel: "phone number" },
    { id: "place", icon: MapPin, text: contact.locality, href: null, copyLabel: "location" },
  ] as const;

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="surface-dark section-pad relative isolate overflow-hidden bg-navy-950 text-cloud-50"
    >
      <AnimatedBackground variant="ctaGradient" className="-z-20" />
      <MountWhenNear
        className="absolute inset-0 -z-10"
        fallback={<StaticNetwork variant="converge" seed={23} />}
      >
        <ParticleNetwork mode="converge" seed={23} />
      </MountWhenNear>
      <div
        aria-hidden="true"
        className="bg-cta-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[120px]"
      />

      <div className="container-page">
        <div className="mx-auto max-w-cta text-center">
          <VerifyMarker verified={contactSection.verified}>
            <p className="eyebrow">{contactSection.eyebrow}</p>
            <h2 id="contact-title" className="mt-4 font-display text-display-l text-cloud-50">
              <WordReveal
                text={contactSection.titleLead}
                emphasis={contactSection.titleEmphasis}
                emphasisClassName="text-bright-gold"
              />
            </h2>
            <p className="mx-auto mt-6 max-w-[60ch] text-lead text-slate-400">
              {contactSection.lead}
            </p>
          </VerifyMarker>

          <Reveal className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <VerifyMarker verified={contact.verified} className="flex flex-col gap-3 sm:flex-row">
              <AnimatedButton href={mailto} size="lg" magnetic icon={Mail} iconPosition="left">
                {contactSection.emailLabel}
              </AnimatedButton>
              <AnimatedButton
                href={tel}
                size="lg"
                variant="secondary"
                icon={Phone}
                iconPosition="left"
                ariaLabel={`${contactSection.callLabel} on ${contact.phoneDisplay}`}
              >
                <span className="lg:hidden">{contactSection.callLabel}</span>
                <span className="hidden font-mono lg:inline">{contact.phoneDisplay}</span>
              </AnimatedButton>
            </VerifyMarker>
          </Reveal>

          <Reveal className="mt-12">
            <VerifyMarker verified={contact.verified}>
              <ul className="flex flex-col items-center justify-center gap-x-8 gap-y-1 border-t border-line-dark pt-8 font-mono text-small md:flex-row">
                {details.map((detail) => {
                  const Icon = detail.icon;
                  return (
                    <li key={detail.id} className="flex items-center gap-2">
                      <Icon
                        aria-hidden="true"
                        size={16}
                        strokeWidth={ICON_STROKE}
                        className="text-pioneer-gold"
                      />
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="inline-flex min-h-11 items-center text-cloud-50 underline-offset-4 hover:underline"
                        >
                          {detail.text}
                        </a>
                      ) : (
                        <span className="text-cloud-50">{detail.text}</span>
                      )}
                      <CopyToClipboard value={detail.text} label={detail.copyLabel} />
                    </li>
                  );
                })}
              </ul>
            </VerifyMarker>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
