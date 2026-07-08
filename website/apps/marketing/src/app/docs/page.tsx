import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";
import { apiRows, docsCards, quickstartSteps, stackCards } from "@/data/usertour-pages";

export default function DocsPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Docs"
        title="Install the plugin, call a skill, ship the launch kit."
        copy="Add PMM OS to Claude Code, run the orchestrator or jump straight to the launch kit, then edit and export it — all locally."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-docs-layout">
          <aside className="ut-docs-sidebar">
            <strong>Documentation</strong>
            {docsCards.map((card) => {
              const id = card.title === "Security" ? "support" : card.title.toLowerCase().replaceAll(" ", "-");
              return (
                <a href={`#${id}`} key={card.title}>
                  {card.title}
                </a>
              );
            })}
          </aside>
          <div className="ut-docs-main">
            <section className="ut-doc-panel" id="quickstart">
              <div>
                <span className="ut-eyebrow">Quickstart</span>
                <h2 className="ut-gradient-text">Install, call a skill, ship.</h2>
                <p>Add the plugin, run a skill against your product, and open the generated launch kit in your browser.</p>
              </div>
              <ol>
                {quickstartSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <pre>{`# one command (npm)\nnpx pmm-os install\n\n# — or straight from GitHub, in Claude Code —\n/plugin marketplace add buildingwithai/pmm-os\n\n# run the orchestrator, or jump straight to the kit\n/product-marketing-os\n/pmm-launch-kit`}</pre>
            </section>
            <div className="ut-resource-grid is-docs">
              {docsCards.slice(1).map((card) => {
                const Icon = card.icon;
                const id = card.title === "Security" ? "support" : card.title.toLowerCase().replaceAll(" ", "-");
                return (
                  <article id={id} key={card.title}>
                    <Icon size={26} />
                    <h2>{card.title}</h2>
                    <p>{card.copy}</p>
                  </article>
                );
              })}
            </div>
            <section className="ut-doc-panel" id="api-reference">
              <span className="ut-eyebrow">Commands</span>
              <h2 className="ut-gradient-text">Skills you&apos;ll call</h2>
              <div className="ut-api-table">
                {apiRows.map(([name, copy]) => (
                  <div key={name}>
                    <strong>{name}</strong>
                    <span>{copy}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
      <section className="ut-page-section is-tight">
        <div className="ut-shell ut-section-heading">
          <h2 className="ut-gradient-text">Built on a zero-dependency foundation</h2>
          <p>The launch-kit generator runs on Node built-ins; the editor and exports layer cleanly on top.</p>
        </div>
        <div className="ut-shell ut-resource-grid is-small">
          {stackCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title}>
                <Icon size={24} />
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
              </article>
            );
          })}
        </div>
      </section>
    </UsertourPageShell>
  );
}
