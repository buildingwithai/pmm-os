import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";

export default function LicensePage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="License"
        title="Open-source — use it, fork it, ship with it."
        copy="PMM OS is open-source. Install it, read every skill, adapt it to your product, and build on top of it."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-doc-panel">
          <h2 className="ut-gradient-text">License overview</h2>
          <p>
            The plugin ships under a permissive open-source license: free to use, modify, and self-host. Optional
            supporter and Pro tiers fund ongoing development and unlock premium skill packs, but the core 39 skills and
            the launch kit are free forever. See the LICENSE file in the repository for the authoritative terms.
          </p>
        </div>
      </section>
    </UsertourPageShell>
  );
}
