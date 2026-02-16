import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <div className="legalCard">
        <p className="smallTag">StudyPilot AI</p>
        <h1>Privacy Policy</h1>
        <p>
          Your privacy matters. This page explains what data we collect and how we use
          it to run StudyPilot AI.
        </p>

        <h3>Information We Store</h3>
        <p>
          We store your account info (name and email), document metadata, and extracted
          lecture text needed for search and AI features.
        </p>

        <h3>How We Use Data</h3>
        <p>
          Your data is used only to support core features: login, file access, AI
          answers, and generated study resources.
        </p>

        <h3>File Access Control</h3>
        <p>
          Each uploaded file is linked to your account. Only authenticated users can
          access their own files through authorized API endpoints.
        </p>

        <h3>Data Security</h3>
        <p>
          We use account-based access control and private storage patterns to protect
          your content. You can delete uploaded files anytime from your account page.
        </p>

        <h3>Contact</h3>
        <p>
          For privacy-related questions, contact:{" "}
          <a href="mailto:waiyanminmin29@gmail.com">waiyanminmin29@gmail.com</a>
        </p>

        <div className="row">
          <Link href="/" className="ghostButton">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
