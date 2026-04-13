import { requireUser } from "@/lib/auth/session";

export default async function AppPage() {
  const auth = await requireUser("/app");

  return (
    <main className="flex min-h-screen bg-zinc-950 px-6 py-20 text-zinc-50">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">App Area</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Authenticated app shell is ready.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            This page is protected server-side. Unauthenticated requests are redirected before the
            page renders.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-zinc-400">Current user</p>
            <p className="mt-2 text-xl font-semibold">{auth.user.email}</p>
            <p className="mt-2 text-sm text-zinc-300">User ID: {auth.user.id}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-zinc-400">Role source</p>
            <p className="mt-2 text-xl font-semibold">{auth.profile.role}</p>
            <p className="mt-2 text-sm text-zinc-300">
              Loaded from `user_profiles` and ready for future dashboard/auth UI.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
