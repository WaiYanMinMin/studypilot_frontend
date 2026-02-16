"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ApiError, apiFetch, apiFetchJson } from "@/lib/apiClient";
import {
  FALLBACK_MODELS,
  getAiConfig,
  isAiSetupComplete,
  updateAiConfig
} from "@/lib/aiConfigApi";

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [allowedModels, setAllowedModels] = useState<string[]>(FALLBACK_MODELS);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsAiRetry, setNeedsAiRetry] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

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
        const aiConfig = await getAiConfig();
        if (!active) return;
        setAllowedModels(
          aiConfig.allowedModels.length ? aiConfig.allowedModels : FALLBACK_MODELS
        );
        setModel((prev) => prev || aiConfig.model || aiConfig.allowedModels[0] || "");
        if (needsAiRetry || !isAiSetupComplete(aiConfig)) return;
        router.replace(callbackUrl);
      } catch (_error) {
        // No active session; stay on sign-up page.
      }
    }
    void checkSession();
    return () => {
      active = false;
    };
  }, [router, callbackUrl, needsAiRetry]);

  async function saveAiSetup() {
    const result = await updateAiConfig({ apiKey, model });
    setAllowedModels(result.allowedModels.length ? result.allowedModels : FALLBACK_MODELS);
    setModel(result.model || model);
    setNeedsAiRetry(false);
    setSignupSuccess(false);
    router.push(callbackUrl);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (apiKey.trim().length < 20) {
      setError("Please enter a valid OpenAI API key (minimum 20 characters).");
      return;
    }
    if (!model) {
      setError("Please select an OpenAI model.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await apiFetchJson("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword
        })
      });
      setSignupSuccess(true);
      try {
        await saveAiSetup();
      } catch (setupError) {
        setNeedsAiRetry(true);
        const message =
          setupError instanceof Error
            ? setupError.message
            : "Account created, but AI setup failed.";
        setError(
          `${message} Please retry AI setup below to continue.`
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/signin?callbackUrl=/signup");
        return;
      }
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authShell">
      <section className="authHero">
        <p className="badge">Get started</p>
        <h1>Create your study account</h1>
        <p>
          Save your lecture files, practice with quizzes, and study smarter every week.
        </p>
      </section>
      <section className="authCard">
        <h2>Create Account</h2>
        <p className="small">It only takes a minute to get started.</p>
        <form className="authForm" onSubmit={onSubmit}>
          <div className="authField">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
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
              autoComplete="new-password"
              required
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="authField">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Type your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="authField">
            <label htmlFor="openai-api-key">OpenAI API Key</label>
            <input
              id="openai-api-key"
              type="password"
              required
              minLength={20}
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="small">Required to run AI answers, summaries, and quizzes.</p>
          </div>
          <div className="authField">
            <label htmlFor="openai-model">OpenAI Model</label>
            <select
              id="openai-model"
              className="modelSelect"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">Select a model</option>
              {allowedModels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button className="ctaButton authSubmit" disabled={busy}>
            {busy ? "Creating account..." : "Sign Up"}
          </button>
          {needsAiRetry ? (
            <button
              type="button"
              className="ghostButton authSubmit"
              disabled={busy || apiKey.trim().length < 20 || !model}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await saveAiSetup();
                } catch (setupError) {
                  setError(
                    setupError instanceof Error
                      ? setupError.message
                      : "Failed to save AI settings."
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Retry AI Setup
            </button>
          ) : null}
          {signupSuccess && needsAiRetry ? (
            <p className="small">Your account is created. Complete AI setup to continue.</p>
          ) : null}
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
