"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS } from "@/content/docs";

export function DocsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Documentation"
      className="top-[76px] h-max lg:sticky"
    >
      <p className="sec-label mb-2 px-3">Documentation</p>
      <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {DOCS.map((d) => {
          const href = d.slug === "overview" ? "/docs" : `/docs/${d.slug}`;
          const active =
            pathname === href ||
            (d.slug === "overview" && pathname === "/docs");
          return (
            <Link
              key={d.slug}
              href={href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-blue-soft text-blue"
                  : "text-ink-2 hover:bg-tint hover:text-ink"
              }`}
            >
              {d.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
