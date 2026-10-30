import Link from "next/link";
import { Pig } from "@/components/Pig";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <Pig size={120} mood="thinking" magnifier />
      <h1 className="text-2xl font-extrabold">ページが見つかりません</h1>
      <p className="text-ink/60">ブーちゃんが探しましたが、見つかりませんでした…</p>
      <Link href="/" className="btn-primary mt-2">トップへ戻る</Link>
    </div>
  );
}
