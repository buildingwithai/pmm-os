import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero, UsertourPageShell } from "@/components/usertour-page-shell";
import { blogPosts } from "@/data/usertour-pages";

export default function BlogPage() {
  return (
    <UsertourPageShell>
      <PageHero
        eyebrow="Blog Articles"
        title="Discovering the latest insights and strategies in tech, development, and innovation"
        copy="Explore our blog for thought-provoking articles, expert insights, and practical advice on navigating the dynamic landscape of technology, software development, and digital innovation."
      />
      <section className="ut-page-section">
        <div className="ut-shell ut-blog-grid">
          {blogPosts.map((post) => (
            <Link className="ut-blog-card" href={`/blog/${post.slug}`} key={post.slug}>
              <div className="ut-blog-cover">
                <Image src={post.image} alt={post.title} width={820} height={520} sizes="(max-width: 900px) 100vw, 33vw" />
              </div>
              <div className="ut-blog-card-body">
                <div className="ut-card-row">
                  <span className="ut-eyebrow">{post.category}</span>
                  <ArrowUpRight size={18} />
                </div>
                <h2>{post.title}</h2>
                <time>{post.date}</time>
              </div>
            </Link>
          ))}
        </div>
        <nav className="ut-pagination" aria-label="Blog pages">
          {[1, 2, 3, 4].map((page) => (
            <Link className={page === 1 ? "is-active" : ""} href="/blog" key={page}>
              {page}
            </Link>
          ))}
        </nav>
      </section>
    </UsertourPageShell>
  );
}
