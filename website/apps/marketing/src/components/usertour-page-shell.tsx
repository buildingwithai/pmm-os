import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Badge, Footer, Header } from "@/components/usertour-home";

export function UsertourPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="ut-page">
      <Header />
      {children}
      <Footer />
    </main>
  );
}

export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="ut-subhero">
      <div className="ut-hero-aurora" />
      <div className="ut-shell ut-subhero-inner">
        <Badge>{eyebrow}</Badge>
        <h1 className="ut-gradient-text">{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}

export function PrimaryAction({ href = "/pricing", children = "Get started for free" }: { href?: string; children?: ReactNode }) {
  return (
    <a className="ut-button ut-button-primary" href={href}>
      {children}
      <ArrowRight size={18} />
    </a>
  );
}
