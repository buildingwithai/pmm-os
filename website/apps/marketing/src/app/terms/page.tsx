import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";

export default function TermsPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Terms"
        title="Terms of use."
        copy="The plugin is open-source software you run locally. These terms cover the website and the optional paid tiers."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-doc-panel">
          <h2 className="ut-gradient-text">Terms overview</h2>
          <p>
            PMM OS is provided as open-source software, as-is, under its license — there&apos;s no hosted service or
            account required to use it. Optional supporter and Pro subscriptions are billed separately and cover
            premium skill packs and support. The software does not transmit your data; you&apos;re responsible for how
            you use the artifacts it helps you create.
          </p>
        </div>
      </section>
    </UsertourPageShell>
  );
}
