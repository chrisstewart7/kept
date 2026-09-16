import { LegalDoc } from "@/content/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-2xl">
      <h1
        className="font-serif text-[32px] text-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        {doc.title}
      </h1>
      <p className="mt-1 text-[12.5px] text-ink-3">Updated {doc.updated}</p>
      <div className="mt-6 space-y-6">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-[15px] font-semibold text-ink">{s.heading}</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
