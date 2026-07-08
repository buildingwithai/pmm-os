import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";

export default function AboutPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="About"
        title="Open-source product marketing for the terminal."
        copy="PMM OS turns the repetitive parts of go-to-market — positioning, messaging, pricing, competitive, launch — into grounded, inspectable skills you run locally in Claude Code."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-doc-panel">
          <h2 className="ut-gradient-text">Built around one idea</h2>
          <p>
            Product marketing is mostly structured thinking plus a lot of artifact production — and both are things a
            grounded set of skills can do well. PMM OS keeps the truth in one place, generates every artifact from it,
            and packages the result into an interactive launch kit you can edit and export. No SaaS, no upload; it&apos;s
            open-source and runs on your machine.
          </p>
        </div>
      </section>
    </UsertourPageShell>
  );
}
