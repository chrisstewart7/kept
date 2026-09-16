import { DocsNav } from "./docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <DocsNav />
      <div className="min-w-0 max-w-2xl">{children}</div>
    </div>
  );
}
