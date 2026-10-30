import { Pig } from "@/components/Pig";
import { SupportForm } from "@/components/SupportForm";
import { getUser } from "@/lib/auth";

export default async function SupportPage() {
  const user = await getUser();
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-6 text-center">
        <div className="flex justify-center"><Pig size={100} /></div>
        <h1 className="mt-3 text-2xl font-extrabold">サポート</h1>
        <p className="mt-2 text-ink/70">お困りのことがあれば、お気軽にご連絡ください。</p>
      </div>
      <SupportForm loggedInEmail={user?.email} />
    </div>
  );
}
