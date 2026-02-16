"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FeedbackForm } from "@/components/FeedbackForm";
import { apiFetch } from "@/lib/apiClient";

const features = [
  {
    title: "Simple 3-Step Study Flow",
    description:
      "Pick your file, choose a tool, and focus on one task at a time without feeling overwhelmed."
  },
 
  {
    title: "Tools for Real Study Sessions",
    description:
      "Get summaries, ask questions, explain highlights, build cheat sheets, and practice with quizzes."
  }
];

const highlights = [
  "Built for university students and self-learners",
  "Upload your lecture slides and ask questions instantly",
  "Focus on key concepts instead of rereading everything"
];

const steps = [
  {
    title: "Upload Your Lecture PDF",
    detail: "Add a new file or pick one you already uploaded."
  },
  {
    title: "Pick How You Want to Study",
    detail:
      "Choose Summary, Ask, Highlight Help, Cheat Sheet, or Quiz on separate focused pages."
  },
  {
    title: "Come Back Anytime",
    detail:
      "Your files stay ready whenever you want to review and practice again."
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
        <p className="badge">Made for students</p>
        <h1>Turn Lecture Slides into Easy Study Sessions</h1>
        <p className="heroSub">
          Stop jumping between notes and tabs. Upload your slides, choose a tool, and
          study with your PDF always visible.
        </p>
        <div className="heroActions">
          <Link href="/signup?callbackUrl=/dashboard/select" className="ctaButton large">
            Start for Free
          </Link>
          <a href="#features" className="ghostButton large">
            Explore Features
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
          <h2>From lecture slides to exam confidence</h2>
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
        <h2>Make studying feel less stressful.</h2>
        <p>
          Join students using StudyPilot AI to understand faster, revise better, and
          walk into exams more prepared.
        </p>
        <div className="heroActions">
          <Link href="/signup?callbackUrl=/dashboard/select" className="ctaButton large">
            Create My Account
          </Link>
          <Link href="/signin?callbackUrl=/dashboard/select" className="ghostButton large">
            I already have an account
          </Link>
        </div>
      </section>

      <section id="contact" className="contactSection">
        <div className="sectionHeader">
          <p className="badge">Contact</p>
          <h2>Need help with StudyPilot?</h2>
        </div>
        <p className="contactLead">
          Reach out anytime for support, feedback, or ideas to make the app better for
          students.
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
          <p className="small">Your AI study buddy for lectures and revision</p>
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
