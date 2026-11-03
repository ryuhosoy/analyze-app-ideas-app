"use client";

import { useI18n } from "./I18nProvider";
import { localePath } from "@/i18n/paths";

export function LogoutButton() {
  const { locale, dict } = useI18n();
  return (
    <button
      className="rounded-full px-3 py-1.5 text-ink/60 hover:bg-oink-50"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = localePath(locale, "/");
      }}
    >
      {dict.nav.logout}
    </button>
  );
}
