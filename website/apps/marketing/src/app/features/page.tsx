import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { PageHero, PrimaryAction, UsertourPageShell } from "@/components/usertour-page-shell";
import { featureCards, featureDetails } from "@/data/usertour-pages";

const anchorMap: Record<string, string> = {
  "45 skills": "skills-card",
  "10 research desks": "research",
  Orchestrator: "orchestrator",
  "Interactive launch kit": "kit-card",
  "Modeless editor": "editor-card",
  "Anchored comments": "comments",
  "One source, many outputs": "exports-card",
  "Runs locally": "local",
  "Open source": "open-source",
};

export default function FeaturesPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Features"
        title="Everything you need to turn a product brief into a shippable launch."
        copy="45 PMM, GTM, and PLG skills, a ten-desk research pipeline across every platform your buyers are on, and an interactive launch kit you can edit and export."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-resource-grid">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <article id={anchorMap[card.title]} key={card.title}>
                <Icon size={26} />
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="ut-page-section is-tight">
        <div className="ut-shell ut-section-heading">
          <h2 className="ut-gradient-text">Inside the launch kit</h2>
          <p>Generate it from your PMM work, edit it live, and export it — all from a single source of truth.</p>
        </div>
        <div className="ut-shell ut-feature-detail-stack">
          {featureDetails.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article className={index % 2 ? "is-reverse" : ""} id={feature.id} key={feature.id}>
                <div className="ut-feature-detail-copy">
                  <span className="ut-eyebrow">
                    <Icon size={16} />
                    {feature.title}
                  </span>
                  <h2 className="ut-gradient-text">{feature.title}</h2>
                  <p>{feature.copy}</p>
                  <ul>
                    {feature.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={17} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ut-feature-detail-visual">
                  <Image
                    src={feature.image}
                    alt={`${feature.title} interface`}
                    width={900}
                    height={620}
                    sizes="(max-width: 900px) 100vw, 48vw"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="ut-page-section is-tight">
        <div className="ut-shell ut-feature-banner">
          <div>
            <span className="ut-eyebrow">Open-source plugin</span>
            <h2 className="ut-gradient-text">One plugin for the whole go-to-market motion.</h2>
          </div>
          <PrimaryAction />
        </div>
      </section>
    </UsertourPageShell>
  );
}
