import { requireAdmin } from "@/lib/auth/session";

export default async function AdminPage() {
  const auth = await requireAdmin("/admin");

  return (
    <main className="flex min-h-screen bg-neutral-100 px-6 py-20 text-zinc-950">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl border border-black/10 bg-white p-8 shadow-xl shadow-black/5">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin Area</p>
          <h1 className="text-4xl font-semibold tracking-tight">Admin guard is active.</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            Only users whose `user_profiles.role` is `admin` can render this page.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-zinc-50 p-5">
          <p className="text-sm text-zinc-500">Authenticated admin</p>
          <p className="mt-2 text-xl font-semibold">{auth.user.email}</p>
          <p className="mt-2 text-sm text-zinc-600">
            This page is the admin shell for upcoming subscription management features.
          </p>
        </div>
      </section>
    </main>
  );
}
