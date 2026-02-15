"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("Feedback email is not configured.");
      }
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          message: feedback,
          to_email: "waiyanminmin29@gmail.com",
          subject: "studyPilot feedback",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setMessage("Thanks! Your feedback has been emailed.");
      setName("");
      setEmail("");
      setFeedback("");
    } catch (err) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "text" in err &&
        typeof (err as { text?: unknown }).text === "string"
          ? (err as { text: string }).text
          : err instanceof Error
            ? err.message
            : "Failed to send feedback.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="feedbackForm" onSubmit={onSubmit}>
      <div className="feedbackField">
        <label htmlFor="feedback-name">Name</label>
        <input
          id="feedback-name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="feedbackField">
        <label htmlFor="feedback-email">Email</label>
        <input
          id="feedback-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="feedbackField">
        <label htmlFor="feedback-message">Feedback</label>
        <textarea
          id="feedback-message"
          placeholder="Tell us what you like, what is missing, or what we can improve..."
          required
          minLength={10}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <button className="ctaButton" disabled={busy}>
        {busy ? "Submitting..." : "Submit Feedback"}
      </button>
      {message ? <p className="feedbackSuccess">{message}</p> : null}
      {error ? <p className="feedbackError">{error}</p> : null}
    </form>
  );
}
