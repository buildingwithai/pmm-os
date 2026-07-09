import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";
import { pricingPlans } from "@/data/usertour-pages";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — PMM OS",
  description:
    "The PMM OS plugin is open-source and free forever. PMM OS Cloud — the companion web app — is coming; join the waitlist.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Pricing"
        title="The plugin is free. Forever."
        copy="Everything that runs in your terminal — all 45 skills, the ten research desks, the launch kit — is open source with no account and no metering. Cloud is the optional companion we’re building next."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-pricing-grid is-two">
          {pricingPlans.map((plan) => (
            <article className={plan.available ? "" : "is-featured"} key={plan.name}>
              {plan.available ? null : <span className="ut-popular">WAITLIST OPEN</span>}
              <h2>{plan.name}</h2>
              <div className="ut-price">
                <span className="ut-price-value">{plan.price}</span>
                <span className="ut-price-unit">{plan.cadence}</span>
              </div>
              <p>{plan.copy}</p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} />
                    {item}
                  </li>
                ))}
              </ul>
              {plan.href.startsWith("http") ? (
                <a className="ut-button ut-button-primary" href={plan.href}>
                  {plan.cta}
                  <ArrowRight size={18} />
                </a>
              ) : (
                <Link className="ut-button ut-button-primary" href={plan.href}>
                  {plan.cta}
                  <ArrowRight size={18} />
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className="ut-shell">
          <p className="ut-pricing-note">
            No credit card, no trial clock, no gated core features. The plugin stays MIT-licensed and
            local — Cloud only ever adds what a terminal can&apos;t do: durable memory across
            engagements, image and video generation, and a hosted research reranker.{" "}
            <Link href="/cloud">See what Cloud will do →</Link>
          </p>
        </div>
      </section>
    </UsertourPageShell>
  );
}
