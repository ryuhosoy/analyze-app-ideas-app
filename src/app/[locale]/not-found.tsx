"use client";

import { Pig } from "@/components/Pig";
import { L, useI18n } from "@/components/I18nProvider";

export default function NotFound() {
  const { dict } = useI18n();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <Pig size={120} mood="thinking" magnifier ariaLabel={dict.pigAria} />
      <h1 className="text-2xl font-extrabold">{dict.notFound.title}</h1>
      <p className="text-ink/60">{dict.notFound.body}</p>
      <L href="/" className="btn-primary mt-2">
        {dict.notFound.home}
      </L>
    </div>
  );
}
