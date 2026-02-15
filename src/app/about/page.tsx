import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="legalPage">
      <div className="legalCard">
        <p className="smallTag">StudyPilot AI</p>
        <h1>About</h1>
        <p>
          StudyPilot AI is an AI-powered study workspace designed to help students
          understand lecture material faster. You can upload lecture PDFs, ask
          context-aware questions, analyze highlighted excerpts, and generate study
          resources such as summaries, revision briefs, and quizzes.
        </p>
        <p>
          Our goal is to make exam preparation more focused, structured, and practical
          by turning static slide decks into interactive learning workflows.
        </p>
        <p>
          If you would like to collaborate or share suggestions, contact us via the
          contact section on the landing page.
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
