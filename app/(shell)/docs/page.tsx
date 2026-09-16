import type { Metadata } from "next";
import { MarkdownLite } from "@/components/markdown";
import { DOCS } from "@/content/docs";

export const metadata: Metadata = {
  title: "Docs",
  description: "How Kept routes token fees into OnlyFans subscriptions and dollars.",
};

/* The full manual on one page — every section, anchored. Per-section pages
   remain at /docs/[slug]. */
export default function DocsIndexPage() {
  return (
    <div className="space-y-12">
      {DOCS.map((doc, i) => (
        <article key={doc.slug} id={doc.slug} className="scroll-mt-24">
          <h1
            className={`mb-5 font-serif text-ink ${i === 0 ? "text-[32px]" : "text-[24px]"}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            {doc.title}
          </h1>
          <MarkdownLite body={doc.body} />
          {i < DOCS.length - 1 && (
            <hr className="mt-12 border-line" aria-hidden />
          )}
        </article>
      ))}
    </div>
  );
}
