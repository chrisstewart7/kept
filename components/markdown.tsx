/* markdown-lite renderer for docs: paragraphs, "- " lists, "1. " lists,
   ``` code fences. Deliberately tiny — content is typed, not user input. */

export function MarkdownLite({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/);
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith("```")) {
          const code = block.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-xl border border-line bg-tint p-4 font-mono text-[12.5px] leading-relaxed text-ink-2"
            >
              {code}
            </pre>
          );
        }
        if (/^- /m.test(block) && block.split("\n").every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink-2">
              {block.split("\n").map((l, j) => (
                <li key={j}>{l.replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\. /.test(block)) {
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink-2">
              {block.split("\n").map((l, j) => (
                <li key={j}>{l.replace(/^\d+\. /, "")}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="text-[14px] leading-relaxed text-ink-2">
            {block}
          </p>
        );
      })}
    </div>
  );
}
