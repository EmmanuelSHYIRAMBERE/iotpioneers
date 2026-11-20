"use client";

import { useRef } from "react";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { contact, contactSection } from "@/content/contact";
import { ctaImage } from "@/content/images";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CopyToClipboard } from "@/components/ui/CopyToClipboard";
import { MountWhenNear } from "@/components/ui/MountWhenNear";
import { Reveal } from "@/components/ui/Reveal";
import { VerifyMarker } from "@/components/ui/VerifyMarker";
import { WordReveal } from "@/components/ui/WordReveal";
import { AnimatedBackground } from "@/components/visuals/AnimatedBackground";
import { ParticleNetwork } from "@/components/visuals/ParticleNetwork";
import { StaticNetwork } from "@/components/visuals/StaticNetwork";
import { colors, hexToRgb, ICON_STROKE } from "@/lib/tokens";
import { motion } from "motion/react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { ease, runTiming, s, viewportAmount } from "@/lib/motion";

/**
 * Section 09: "How do I start?" A centred section. The node network converges into one bright
 * node placed in the gap below the button row, never over text (audit issue 30), closing the
 * "Signal to Insight" story. No contact form (no verified endpoint).
 */
/** Headline glow (reference-ui-patterns): brightGold at 25%, 40px blur; GLOW_OFF is its transparent start. */
const GOLD = hexToRgb(colors.brightGold).join(" ");
const GLOW_ON = `0 0 40px rgb(${GOLD} / 0.25)`;
const GLOW_OFF = `0 0 40px rgb(${GOLD} / 0)`;

export function ContactSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();
  const focusRef = useRef<HTMLSpanElement>(null);
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
      className="surface-dark section-pad section-pad-joined relative isolate overflow-hidden bg-navy-950 text-cloud-50"
    >
      <AnimatedBackground variant="ctaGradient" className="-z-30" />
      {ctaImage.src ? (
        // Stand-in photo, decorative, under an 85% navy overlay so text stays at AA contrast.
        <div aria-hidden="true" className="absolute inset-0 -z-20">
          <Image src={ctaImage.src} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-navy-950/85" />
        </div>
      ) : null}
      <MountWhenNear
        className="absolute inset-0 -z-10"
        fallback={<StaticNetwork variant="converge" seed={23} focus={{ x: 0.5, y: 0.62 }} />}
      >
        <ParticleNetwork mode="converge" seed={23} calmRef={textRef} focusRef={focusRef} />
      </MountWhenNear>
      <div
        aria-hidden="true"
        className="bg-cta-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[120px]"
      />

      <div className="container-page">
        <div className="mx-auto max-w-cta text-center">
          {/* Nodes stay at 0.3 opacity or less over the heading and lead. */}
          <div ref={textRef}>
            <VerifyMarker verified={contactSection.verified}>
              <p className="eyebrow">{contactSection.eyebrow}</p>
              {/* The headline glow fades in over 1200ms once in view (static with reduced motion). */}
              <motion.h2
                id="contact-title"
                className="mt-4 font-display text-display-l text-cloud-50"
                initial={reduced ? false : { textShadow: GLOW_OFF }}
                whileInView={{ textShadow: GLOW_ON }}
                viewport={{ once: true, amount: viewportAmount.headline }}
                transition={{ duration: s(runTiming.glowFadeIn), ease: ease.standard }}
                style={reduced ? { textShadow: GLOW_ON } : {}}
              >
                <WordReveal
                  text={contactSection.titleLead}
                  emphasis={contactSection.titleEmphasis}
                  emphasisClassName="text-bright-gold"
                />
              </motion.h2>
              <p className="mx-auto mt-6 max-w-[60ch] text-lead text-slate-400">
                {contactSection.lead}
              </p>
            </VerifyMarker>
          </div>

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
                {contactSection.callLabel}
              </AnimatedButton>
            </VerifyMarker>
          </Reveal>

          <Reveal className="relative mt-12">
            {/* The network converges here: in the gap between the buttons and the contact row. */}
            <span
              ref={focusRef}
              aria-hidden="true"
              data-converge-point=""
              className="pointer-events-none absolute -top-6 left-1/2 size-px"
            />
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
