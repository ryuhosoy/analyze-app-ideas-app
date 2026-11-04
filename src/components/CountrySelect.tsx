"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CountryFlag } from "./CountryFlag";

type CountryOption = { code: string; label: string };

export function CountrySelect({
  value,
  onChange,
  countries,
  storeSuffix,
  ariaLabel,
}: {
  value: string;
  onChange: (code: string) => void;
  countries: CountryOption[];
  storeSuffix: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = countries.find((c) => c.code === value) ?? countries[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        className="input flex w-full items-center gap-2.5 text-left"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <CountryFlag code={selected.code} className="h-4 w-[1.35rem]" />
        <span className="min-w-0 flex-1 truncate">
          {selected.label}
          {storeSuffix}
        </span>
        <span className="text-ink/40" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border-2 border-oink-200 bg-white py-1 shadow-lg"
        >
          {countries.map((c) => {
            const active = c.code === value;
            return (
              <li key={c.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-oink-50 ${active ? "bg-oink-50 font-bold" : ""}`}
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                >
                  <CountryFlag code={c.code} className="h-4 w-[1.35rem]" />
                  <span className="min-w-0 flex-1 truncate">
                    {c.label}
                    {storeSuffix}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
