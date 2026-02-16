"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { asDocumentList, type DocumentListItem } from "@/components/dashboard/dashboardApi";

type ProfileUser = {
  id: string;
  fullName: string;
  email: string;
};

async function asJson<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    const message = (body as { error?: string }).error || "Request failed.";
    throw new Error(message);
  }
  return body as T;
}

export function ProfilePageClient() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [status, setStatus] = useState("Update your profile and manage your uploaded files.");

  async function loadProfile() {
    const profile = await asJson<{ user: ProfileUser | null }>(await apiFetch("/api/auth/me"));
    setUser(profile.user);
    if (profile.user) {
      setFullName(profile.user.fullName);
      setEmail(profile.user.email);
    }
  }

  async function loadDocuments() {
    setDocsLoading(true);
    try {
      const result = asDocumentList(await asJson<unknown>(await apiFetch("/api/documents")));
      setDocs(result);
    } finally {
      setDocsLoading(false);
    }
  }

  useEffect(() => {
    async function loadAll() {
      try {
        await Promise.all([loadProfile(), loadDocuments()]);
      } finally {
        setInitialLoading(false);
      }
    }
    void loadAll();
  }, []);

  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace("/signin?callbackUrl=/profile");
    }
  }, [initialLoading, user, router]);

  if (initialLoading) {
    return (
      <main className="dashboardWrap pageLoadingWrap">
        <div className="loaderRing" aria-label="Loading profile data" />
      </main>
    );
  }

  return (
    <main className="dashboardWrap">
      <header className="dashboardTopbar">
        <div>
          <p className="smallTag">Account</p>
          <h1>Your Profile & Files</h1>
        </div>
        <div className="row">
          <button className="ghostButton" onClick={() => router.back()}>
            Back
          </button>
          <Link href="/dashboard/select" className="ghostButton">
            Back to Workspace
          </Link>
          <button
            className="ghostButton"
            disabled={busy}
            onClick={async () => {
              await apiFetch("/api/auth/signout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="featurePageGrid">
        <section className="panel">
          <h3>Profile Details</h3>
          <p className="small">Keep your name and email up to date.</p>
          <div className="authForm">
            <div className="authField">
              <label htmlFor="profile-fullname">Full Name</label>
              <input
                id="profile-fullname"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="authField">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              className="ctaButton"
              disabled={busy || !user}
              onClick={async () => {
                if (!user) return;
                setBusy(true);
                setStatus("Saving your changes...");
                try {
                  const result = await asJson<{ user: ProfileUser }>(
                    await apiFetch("/api/auth/me", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ fullName, email })
                    })
                  );
                  setUser(result.user);
                  setStatus("Profile updated.");
                } catch (error) {
                  setStatus(
                    error instanceof Error ? error.message : "Profile update failed."
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save Changes
            </button>
          </div>
        </section>

        <section className="panel">
          <h3>Your Uploaded PDFs</h3>
          <p className="small">See your files and remove any you no longer need.</p>
          {docsLoading ? (
            <div className="inlineLoaderWrap">
              <div className="loaderRing" aria-label="Loading uploaded files" />
            </div>
          ) : (
            <div className="documentList">
              {docs.map((doc) => (
                <div key={doc.id} className="docItemRow">
                  <div>
                    <strong>{doc.title}</strong>
                    <span>
                      {doc.pageCount || 0} pages • {doc.chunkCount || 0} chunks
                    </span>
                  </div>
                  <button
                    className="ghostButton danger docDeleteButton"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setStatus("Removing file...");
                      try {
                        await asJson(
                          await apiFetch(`/api/documents/${doc.id}`, { method: "DELETE" })
                        );
                        await loadDocuments();
                        setStatus("File removed.");
                      } catch (error) {
                        setStatus(error instanceof Error ? error.message : "Delete failed.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="small">{status}</p>
        </section>
      </div>
    </main>
  );
}
