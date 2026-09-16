import Link from "next/link";
import { KeptMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <KeptMark size={40} />
      <h1
        className="font-serif text-[40px] text-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        Nothing here
      </h1>
      <p className="max-w-sm text-[14px] text-ink-2">
        This page does not exist. The fees, however, keep routing.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Back home
      </Link>
    </div>
  );
}
