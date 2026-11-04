"use client";

import { useEffect, useId, useState } from "react";
import { Pig } from "@/components/Pig";
import { L, useI18n } from "@/components/I18nProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { LogoutButton } from "@/components/LogoutButton";
import { APP_NAME } from "@/lib/config";

const desktopLink =
  "rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-oink-50 max-md:hidden";
const mobileLink =
  "block w-full rounded-2xl px-4 py-3 text-left text-base hover:bg-oink-50 md:hidden";

export function SiteHeader({ loggedIn, credits }: { loggedIn: boolean; credits: number }) {
  const { locale, dict } = useI18n();
  const t = dict.nav;
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [locale]);

  function closeMenu() {
    setOpen(false);
  }

  const authLinks = loggedIn ? (
    <>
      <L href="/" className={desktopLink} onClick={closeMenu}>
        {t.newReport}
      </L>
      <L href="/reports" className={desktopLink} onClick={closeMenu}>
        {t.reports}
      </L>
      <L
        href="/credits"
        className={`${desktopLink} bg-oink-50 text-oink-700 hover:bg-oink-100`}
        onClick={closeMenu}
      >
        🪙 {credits}
      </L>
      <span className="max-md:hidden">
        <LogoutButton />
      </span>

      <L href="/" className={mobileLink} onClick={closeMenu}>
        {t.newReport}
      </L>
      <L href="/reports" className={mobileLink} onClick={closeMenu}>
        {t.reports}
      </L>
      <L href="/credits" className={`${mobileLink} font-bold text-oink-700`} onClick={closeMenu}>
        🪙 {credits}
      </L>
      <div className="px-1 pt-1 md:hidden [&_button]:w-full [&_button]:rounded-2xl [&_button]:px-4 [&_button]:py-3 [&_button]:text-left">
        <LogoutButton />
      </div>
    </>
  ) : (
    <>
      <L href="/login" className={desktopLink} onClick={closeMenu}>
        {t.login}
      </L>
      <L href="/signup" className={`btn-primary !px-4 !py-1.5 text-sm ${desktopLink}`} onClick={closeMenu}>
        {t.signup}
      </L>

      <L href="/login" className={mobileLink} onClick={closeMenu}>
        {t.login}
      </L>
      <L href="/signup" className={`btn-primary mt-1 w-full !py-3 text-base md:hidden`} onClick={closeMenu}>
        {t.signup}
      </L>
    </>
  );

  return (
    <header className="sticky top-0 z-20 border-b-2 border-oink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <L href="/" className="flex min-w-0 shrink items-center gap-2 text-lg font-extrabold text-oink-600 sm:text-xl">
          <Pig size={32} ariaLabel={dict.pigAria} className="sm:hidden" />
          <Pig size={36} ariaLabel={dict.pigAria} className="hidden sm:block" />
          <span className="truncate">{APP_NAME}</span>
        </L>

        <nav className="hidden items-center gap-1 text-sm font-bold md:flex md:gap-3" aria-label={t.mainNav}>
          <LocaleSwitcher locale={locale} />
          {authLinks}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher locale={locale} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-oink-200 text-oink-700 hover:bg-oink-50"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? t.menuClose : t.menuOpen}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="fill-current">
              {open ? (
                <path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3a1 1 0 0 0-1.4 1.4L10.6 11 5.7 15.9a1 1 0 1 0 1.4 1.4L12 12.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 11l4.9-4.9z" />
              ) : (
                <path d="M4 7h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2zm0 5h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2zm0 5h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id={panelId}
          className="border-t border-oink-100 bg-white px-2 pb-3 pt-2 md:hidden"
          aria-label={t.mainNav}
        >
          <div className="flex flex-col gap-0.5 font-bold">{authLinks}</div>
        </nav>
      )}
    </header>
  );
}
