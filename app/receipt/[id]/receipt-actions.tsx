"use client";

import { useState } from "react";
import { Check, Link as LinkIcon, Printer } from "lucide-react";

export function ReceiptActions() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="no-print mt-5 flex justify-center gap-2">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => window.print()}
      >
        <Printer size={14} aria-hidden /> Print
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? (
          <Check size={14} className="text-green" aria-hidden />
        ) : (
          <LinkIcon size={14} aria-hidden />
        )}
        Copy link
      </button>
    </div>
  );
}
