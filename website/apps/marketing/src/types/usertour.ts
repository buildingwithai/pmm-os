import type { LucideIcon } from "lucide-react";

export type FeatureSection = {
  eyebrow: string;
  title: string;
  description: string;
  points: {
    title: string;
    description: string;
    icon: LucideIcon;
  }[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

export type TechItem = {
  name: string;
  description: string;
  href: string;
  tone: "dark" | "blue" | "cyan" | "violet" | "orange";
};
