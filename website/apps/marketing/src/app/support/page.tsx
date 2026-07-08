import { LifeBuoy, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";

const supportOptions = [
  { title: "Documentation", copy: "Find setup guides, SDK notes, and product concepts.", icon: LifeBuoy },
  { title: "Community", copy: "Ask implementation questions and share patterns.", icon: MessageSquare },
  { title: "Email support", copy: "Reach the team for product and account questions.", icon: Mail },
  { title: "Security", copy: "Review deployment, privacy, and security topics.", icon: ShieldCheck },
];

export default function SupportPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Support"
        title="Get help shipping your launch."
        copy="Docs, community help, and GitHub issues — the fastest ways to get unstuck with the plugin."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-resource-grid">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <article key={option.title}>
                <Icon size={26} />
                <h2>{option.title}</h2>
                <p>{option.copy}</p>
              </article>
            );
          })}
        </div>
      </section>
    </UsertourPageShell>
  );
}
