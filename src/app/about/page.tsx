import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="legalPage">
      <div className="legalCard">
        <p className="smallTag">StudyPilot AI</p>
        <h1>About</h1>
        <p>
          StudyPilot AI is built to make studying from lecture slides faster and less
          stressful. Upload your PDFs, ask questions, highlight confusing parts, and
          generate summaries, cheat sheets, and quizzes in one place.
        </p>
        <p>
          Our goal is to help students spend less time organizing notes and more time
          understanding what matters for class and exams.
        </p>
        <p>
          Have suggestions? We would love to hear from you through the contact section
          on the home page.
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
