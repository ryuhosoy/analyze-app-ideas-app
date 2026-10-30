"use client";

export function LogoutButton() {
  return (
    <button
      className="rounded-full px-3 py-1.5 text-ink/60 hover:bg-oink-50"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      ログアウト
    </button>
  );
}
