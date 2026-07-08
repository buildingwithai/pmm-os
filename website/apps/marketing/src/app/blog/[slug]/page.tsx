import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BlogShareActions } from "@/components/blog-share-actions";
import { UsertourPageShell } from "@/components/usertour-page-shell";
import { articleTemplate, blogPosts, getPost, type ArticleBlock, type ArticleText } from "@/data/usertour-pages";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  return {
    title: `${post.title} | PMM OS`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = getPost(slug);
  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <UsertourPageShell>
      <article className="ut-article-page">
        <header className="ut-shell ut-post-hero">
          <Link className="ut-back-link" href="/blog">Back to Blog</Link>
          <div className="ut-post-meta">
            <span>{post.category}</span>
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="ut-gradient-text">{post.title}</h1>
          <p>{post.summary}</p>
        </header>
        <div className="ut-shell ut-post-cover">
          <Image src={post.image} alt={post.title} width={1240} height={700} sizes="(max-width: 900px) 100vw, 1120px" priority />
        </div>
        <div className="ut-shell ut-article-layout">
          <aside className="ut-article-aside is-left">
            <strong>On this page</strong>
            {articleTemplate.toc.map((item) => (
              <a href={`#${item.id}`} key={item.id}>{item.title}</a>
            ))}
          </aside>
          <div className="ut-article-copy">
            {articleTemplate.blocks.map((block, index) => (
              <ArticleBlockView block={block} key={`${block.type}-${index}`} />
            ))}
          </div>
          <aside className="ut-article-aside is-right">
            <BlogShareActions title={post.title} />
          </aside>
        </div>
        <section className="ut-shell ut-related-reading">
          <div>
            <span className="ut-eyebrow">Related reading</span>
            <h2 className="ut-gradient-text">More from the PMM OS blog.</h2>
          </div>
          <Link href="/blog" className="ut-view-all">View all</Link>
          <div className="ut-related-grid">
            {relatedPosts.map((item) => (
              <Link className="ut-related-card" href={`/blog/${item.slug}`} key={item.slug}>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <small>
                  {item.date}
                  <ArrowUpRight size={15} />
                </small>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </UsertourPageShell>
  );
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    return <h2 id={block.id}>{block.title}</h2>;
  }

  if (block.type === "subheading") {
    return <h3 id={block.id}>{block.title}</h3>;
  }

  if (block.type === "list") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{renderInlineText(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "numbered") {
    return (
      <ol>
        {block.items.map((item) => (
          <li key={item}>{renderInlineText(item)}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "callout") {
    return <blockquote>{renderArticleText(block.text)}</blockquote>;
  }

  if (block.type === "leadQuestion") {
    return <p className="ut-article-question">{block.text}</p>;
  }

  if (block.type === "figure") {
    return (
      <figure className="ut-article-figure">
        <Image src={block.src} alt={block.alt} width={900} height={620} sizes="(max-width: 900px) 100vw, 760px" />
        <figcaption>{block.caption}</figcaption>
      </figure>
    );
  }

  if (block.type === "linkList") {
    return (
      <div className="ut-article-link-list">
        {block.items.map((item) => (
          <Link href={item.href} key={item.href}>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
    );
  }

  return <p>{renderArticleText(block.text)}</p>;
}

function renderArticleText(text: ArticleText) {
  if (typeof text === "string") {
    return renderInlineText(text);
  }

  return text.map((part, index) => {
    if (typeof part === "string") {
      return <span key={`text-${index}`}>{renderInlineText(part)}</span>;
    }

    return (
      <Link href={part.href} key={`${part.href}-${index}`}>
        {part.text}
      </Link>
    );
  });
}

function renderInlineText(text: string) {
  const parts = text.split(/(`[^`]+`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
