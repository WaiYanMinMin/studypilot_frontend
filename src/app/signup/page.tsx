"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        // No active session; stay on sign-up page.
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
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Signup failed.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authShell">
      <section className="authHero">
        <p className="badge">Get started</p>
        <h1>Create your student account</h1>
        <p>
          Save your documents, track quiz practice, and build your own AI-powered
          study workflow.
        </p>
      </section>
      <section className="authCard">
        <h2>Create Account</h2>
        <p className="small">Use your details to create an account.</p>
        <form className="authForm" onSubmit={onSubmit}>
          <div className="authField">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="Wai Yan Min Min"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="authField">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
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
              required
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="authField">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="ctaButton authSubmit" disabled={busy}>
            {busy ? "Creating account..." : "Sign Up"}
          </button>
          {error ? <p className="authError">{error}</p> : null}
        </form>
        <p className="small authFooterText">
          Already have an account?{" "}
          <Link
            className="authLink"
            href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="authShell pageLoadingWrap"><div className="loaderRing" aria-label="Loading sign-up page" /></main>}>
      <SignUpPageContent />
    </Suspense>
  );
}
