"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/paths";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other: Locale = locale === "jp" ? "en" : "jp";
  const href = switchLocalePath(pathname, other);
  return (
    <Link
      href={href}
      className="rounded-full border-2 border-oink-200 px-2.5 py-1 text-xs font-bold text-oink-700 hover:bg-oink-50"
      aria-label={other === "en" ? "Switch to English" : "日本語に切り替え"}
    >
      {other === "en" ? "EN" : "JP"}
    </Link>
  );
}
