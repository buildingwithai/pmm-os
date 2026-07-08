import { CheckCircle2 } from "lucide-react";
import { PageHero, PrimaryAction, UsertourPageShell } from "@/components/usertour-page-shell";
import { comparisonRows, pricingPlans } from "@/data/usertour-pages";

export default function PricingPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Pricing"
        title="Pricing on your terms"
        copy="Get started for free. Upgrade as you grow."
      />
      <section className="ut-page-section">
        <div className="ut-pricing-shell">
          <input defaultChecked id="pricing-cloud" name="pricing-deployment" type="radio" />
          <input id="pricing-self-managed" name="pricing-deployment" type="radio" />
          <input defaultChecked id="pricing-monthly" name="pricing-billing" type="radio" />
          <input id="pricing-yearly" name="pricing-billing" type="radio" />
          <div className="ut-shell ut-pricing-controls" aria-label="Pricing options">
            <div>
              <label className="ut-control-cloud" htmlFor="pricing-cloud">Cloud</label>
              <label className="ut-control-self-managed" htmlFor="pricing-self-managed">Self-Managed</label>
            </div>
            <div>
              <label className="ut-control-monthly" htmlFor="pricing-monthly">Monthly</label>
              <label className="ut-control-yearly" htmlFor="pricing-yearly">Yearly</label>
              <span>2 MONTHS FOR FREE ✨</span>
            </div>
          </div>
          <div className="ut-shell ut-pricing-grid">
            {pricingPlans.map((plan) => (
              <article className={plan.popular ? "is-featured" : ""} key={plan.name}>
                {plan.popular ? <span className="ut-popular">POPULAR</span> : null}
                <h2>{plan.name}</h2>
                <div className="ut-price">
                  <span className="ut-price-value price-cloud-monthly">{plan.cloudMonthly}</span>
                  <span className="ut-price-value price-cloud-yearly">{plan.cloudYearly}</span>
                  <span className="ut-price-value price-self-monthly">{plan.selfManagedMonthly}</span>
                  <span className="ut-price-value price-self-yearly">{plan.selfManagedYearly}</span>
                  <span className="ut-price-unit">/month</span>
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
                <PrimaryAction>Get started</PrimaryAction>
              </article>
            ))}
          </div>
          <div className="ut-shell ut-comparison">
            <div className="ut-comparison-head">
              <span>Usage</span>
              {pricingPlans.map((plan) => (
                <strong key={plan.name}>{plan.name}</strong>
              ))}
            </div>
            {comparisonRows.map(([label, ...values]) => (
              <div className="ut-comparison-row" key={label}>
                <span>{label}</span>
                {values.map((value, index) => (
                  <span key={`${label}-${index}`}>{value}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </UsertourPageShell>
  );
}
