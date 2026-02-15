"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FeedbackForm } from "@/components/FeedbackForm";
import { apiFetch } from "@/lib/apiClient";

const features = [
  {
    title: "Focused Feature Workflow",
    description:
      "Upload/select one PDF first, then choose one task at a time for a clean study flow."
  },
 
  {
    title: "Multiple Study Tools",
    description:
      "Summary, Q&A, highlight Q&A, cheat sheet, and quiz each have dedicated pages."
  }
];

const highlights = [
  "Built for university and self-paced learners",
  "Easily upload your study materials and ask AI questions about them",
  "Extract only what you need to study and focus on your learning"
];

const steps = [
  {
    title: "Upload Lecture PDFs",
    detail: "Upload a new PDF or choose one from your previous uploads."
  },
  {
    title: "Choose One Study Feature",
    detail:
      "Open Summary, Ask, Highlight Ask, Cheat Sheet, or Quiz as separate focused pages."
  },
  {
    title: "Come back to your study materials anytime",
    detail:
      "Your study materials are always available for you to review and study."
  }
];

export function LandingPage() {
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(
    null
  );
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        const res = await apiFetch("/api/auth/me", { cache: "no-store" });
        if (!active || !res.ok) return;
        const body = (await res.json()) as {
          user: { id: string; fullName: string; email: string } | null;
        };
        setUser(body.user);
      } catch {
        // Keep unauthenticated state.
      } finally {
        if (active) setAuthChecked(true);
      }
    }
    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  const userInitial = useMemo(
    () => (user?.fullName?.trim()?.charAt(0) || "U").toUpperCase(),
    [user]
  );

  if (!authChecked) {
    return (
      <main className="landing pageLoadingWrap">
        <div className="loaderRing" aria-label="Loading session status" />
      </main>
    );
  }

  return (
    <main className="landing">
      <header className="topbar">
        <div className="brand">StudyPilot AI</div>
        <div className="row">
          {user ? (
            <>
              <Link href="/dashboard/select" className="ghostButton">
                Open Workspace
              </Link>
              <Link href="/profile" className="profileIconLink" title="Open profile">
                {userInitial}
              </Link>
            </>
          ) : (
            <>
              <Link href="/signin?callbackUrl=/dashboard/select" className="ghostButton">
                Sign In
              </Link>
              <Link href="/signup?callbackUrl=/dashboard/select" className="ctaButton">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <p className="badge">Built for students and educators</p>
        <h1>Turn Lecture Slides into a Personal AI Study System</h1>
        <p className="heroSub">
          Follow a focused workflow: select a PDF, pick one feature, and study with a
          large in-view document for better context.
        </p>
        <div className="heroActions">
          <Link href="/signup?callbackUrl=/dashboard/select" className="ctaButton large">
            Start Studying
          </Link>
          <a href="#features" className="ghostButton large">
            See Features
          </a>
        </div>
      </section>

      <section className="studentStrip">
        {highlights.map((item) => (
          <article key={item} className="studentStripItem">
            <span className="studentDot" />
            <p>{item}</p>
          </article>
        ))}
      </section>

      <section id="features" className="featureGrid">
        {features.map((feature) => (
          <article key={feature.title} className="featureCard">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="howItWorks">
        <div className="sectionHeader">
          <p className="badge">How It Works</p>
          <h2>From lecture slides to exam-ready confidence</h2>
        </div>
        <div className="stepsGrid">
          {steps.map((step, idx) => (
            <article key={step.title} className="stepCard">
              <span className="stepNumber">0{idx + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="finalCta">
        <h2>Study smarter this semester.</h2>
        <p>
          Join students using StudyPilot AI to understand faster, revise better, and
          score higher.
        </p>
        <div className="heroActions">
          <Link href="/signup?callbackUrl=/dashboard/select" className="ctaButton large">
            Create Free Account
          </Link>
          <Link href="/signin?callbackUrl=/dashboard/select" className="ghostButton large">
            I already have an account
          </Link>
        </div>
      </section>

      <section id="contact" className="contactSection">
        <div className="sectionHeader">
          <p className="badge">Contact</p>
          <h2>Need help or want to collaborate?</h2>
        </div>
        <p className="contactLead">
          Reach out directly for product support, student pilot programs, or
          collaboration opportunities.
        </p>
        <div className="contactGrid">
          <a className="contactCard" href="mailto:waiyanminmin29@gmail.com">
            <h3>Email</h3>
            <p>waiyanminmin29@gmail.com</p>
          </a>
          <a className="contactCard" href="tel:+6591366148">
            <h3>Phone</h3>
            <p>+65 9136 6148</p>
          </a>
        </div>
        <div className="contactFeedbackCard">
          <h3>Send Feedback</h3>
          <p className="small">
            Share your ideas and suggestions. We review all feedback to improve
            StudyPilot for students.
          </p>
          <FeedbackForm />
        </div>
      </section>

      <footer className="landingFooter">
        <div>
          <strong>StudyPilot AI</strong>
          <p className="small">AI Study Assistant for modern students</p>
        </div>
        <div className="footerLinks">
          <Link href="/signin?callbackUrl=/dashboard/select">Sign In</Link>
          <Link href="/signup?callbackUrl=/dashboard/select">Sign Up</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </main>
  );
}
