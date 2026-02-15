import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <div className="legalCard">
        <p className="smallTag">StudyPilot AI</p>
        <h1>Privacy Policy</h1>
        <p>
          We value your privacy. This page explains what data is collected and how it
          is used in the StudyPilot AI application.
        </p>

        <h3>Information We Store</h3>
        <p>
          We store account information (name, email), uploaded document metadata, and
          extracted lecture text required for search and AI features.
        </p>

        <h3>How We Use Data</h3>
        <p>
          Your data is used only to provide product functionality: authentication,
          document retrieval, AI responses, and generated study resources.
        </p>

        <h3>File Access Control</h3>
        <p>
          Uploaded files are linked to your user account. Only authenticated users can
          access their own files through authorized backend endpoints.
        </p>

        <h3>Data Security</h3>
        <p>
          We use backend access controls and private storage patterns to protect your
          content. You may delete uploaded files from your account pages.
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
