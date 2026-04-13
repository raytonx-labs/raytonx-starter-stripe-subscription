import Link from "next/link";

import { APP_ROUTES } from "@/lib/auth/config";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function Home() {
  const isReady = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-20 text-zinc-50">
      <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur md:p-10">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
            Auth foundation
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">
            Supabase auth foundation is ready for the app shell.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            Issue 1 focuses on server-side auth foundations: session loading, protected routes,
            role-backed admin access, and the profile schema needed for later login UI.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-zinc-400">Environment status</p>
            <p className="mt-2 text-2xl font-semibold">
              {isReady ? "Configured" : "Waiting for .env.local"}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {isReady
                ? "Supabase URL and publishable key were detected."
                : "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to continue."}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-zinc-400">What is already done</p>
            <p className="mt-2 text-2xl font-semibold">Protected route foundation</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              `app`, `admin`, and `api/auth/session` now share the same auth context and guard
              layer.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={APP_ROUTES.app}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Open protected app shell
          </Link>
          <Link
            href={APP_ROUTES.admin}
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10"
          >
            Open admin guard
          </Link>
        </div>
      </section>
    </main>
  );
}
