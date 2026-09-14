"use client";

import { Reveal, SectionHeading } from "@/components/Reveal";
import type { ProfileData } from "@/lib/types";

export function Contact({ profile }: { profile: ProfileData }) {
  const links = [
    { label: "Email", href: `mailto:${profile.email}`, value: profile.email },
    { label: "Phone", href: profile.phoneHref, value: profile.phone },
    { label: "WhatsApp", href: profile.whatsapp, value: "Message on WhatsApp" },
    { label: "LinkedIn", href: profile.linkedin, value: profile.linkedin.replace("https://", "") },
    { label: "GitHub", href: profile.github, value: profile.github.replace("https://", "") },
    ...(profile.cvUrl
      ? [{ label: "CV", href: "/api/cv", value: "Download resume (PDF)" }]
      : []),
  ];

  return (
    <section id="contact" className="section-pad py-20 md:py-28">
      <div className="container-max">
        <SectionHeading
          eyebrow="Contact"
          title="Let’s build something solid"
          description="Open to full-time roles and serious freelance work. Reach out and I’ll reply quickly."
        />

        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="surface-card block p-5 hover:-translate-y-0.5"
              >
                <p className="eyebrow text-[0.7rem]">{item.label}</p>
                <p className="mt-3 break-all text-[0.98rem] font-semibold tracking-[-0.015em] text-navy-deep md:text-[1.02rem]">
                  {item.value}
                </p>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
