import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownLite } from "@/components/markdown";
import { DOCS, getDoc } from "@/content/docs";

export function generateStaticParams() {
  return DOCS.filter((d) => d.slug !== "overview").map((d) => ({
    slug: d.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return {
    title: doc ? `${doc.title} · Docs` : "Docs",
    description: doc?.body.slice(0, 140),
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  return (
    <article>
      <h1
        className="mb-5 font-serif text-[32px] text-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        {doc.title}
      </h1>
      <MarkdownLite body={doc.body} />
    </article>
  );
}
