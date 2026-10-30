import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { EXAMPLES, getExample } from "@/lib/examples";

export function generateStaticParams() {
  return EXAMPLES.map((e) => ({ slug: e.slug }));
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const ex = getExample((await params).slug);
  if (!ex) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-700">
        📝 これはサンプルレポートです（架空のアプリ・レビューで作成）
      </div>
      <ReportView idea={ex.idea} competitors={ex.competitors} reviewCount={ex.reviewCount} result={ex.result} />
      <div className="mt-8 text-center">
        <Link href="/#new-report" className="btn-primary text-lg">自分のアイデアで試す →</Link>
      </div>
    </div>
  );
}
