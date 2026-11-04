import type { CountryCode } from "@/lib/countries";

/** CSS background flags (flag-icons) — renders on Windows unlike emoji flags */
export function CountryFlag({ code, className = "" }: { code: string; className?: string }) {
  const iso = code.toLowerCase() as CountryCode;
  return (
    <span
      className={`fi fi-${iso} inline-block shrink-0 rounded-sm shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
      aria-hidden
    />
  );
}
