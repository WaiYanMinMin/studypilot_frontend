"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const res = await apiFetch("/api/auth/me", { cache: "no-store" });
        if (!active || !res.ok) return;
        const body = (await res.json()) as {
          user: { id: string; fullName: string; email: string } | null;
        };
        if (!body.user) return;
        router.replace(callbackUrl);
      } catch {
        // No active session; stay on sign-in page.
      }
    }
    void checkSession();
    return () => {
      active = false;
    };
  }, [router, callbackUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await apiFetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Sign in failed.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authShell">
      <section className="authHero">
        <p className="badge">Welcome back</p>
        <h1>Continue your study sessions</h1>
        <p>
          Sign in to access your uploaded lectures, highlight context, and AI study
          tools.
        </p>
      </section>
      <section className="authCard">
        <h2>Sign In</h2>
        <p className="small">Use your email and password to continue.</p>
        <form className="authForm" onSubmit={onSubmit}>
          <div className="authField">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="authField">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="ctaButton authSubmit" disabled={busy}>
            {busy ? "Signing in..." : "Sign In"}
          </button>
          {error ? <p className="authError">{error}</p> : null}
        </form>
        <p className="small authFooterText">
          New here?{" "}
          <Link className="authLink" href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="authShell pageLoadingWrap"><div className="loaderRing" aria-label="Loading sign-in page" /></main>}>
      <SignInPageContent />
    </Suspense>
  );
}
