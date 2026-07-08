import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";

export default function PrivacyPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Privacy"
        title="Your data never leaves your machine."
        copy="PMM OS is a local plugin. There's no account, no server, and nothing to upload — so there's very little to a privacy policy."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-doc-panel">
          <h2 className="ut-gradient-text">What we collect: nothing</h2>
          <p>
            The plugin runs inside Claude Code on your computer. Your product strategy, the launch kit, and every
            artifact stay local. This website collects only the minimal, privacy-respecting analytics needed to keep it
            running. There&apos;s no telemetry in the plugin itself — read the source and confirm it.
          </p>
        </div>
      </section>
    </UsertourPageShell>
  );
}
