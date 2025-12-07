import React, { FormEvent, useEffect, useState } from "react";

const API_URL = "http://localhost:8000/generate-project";

const App: React.FC = () => {
  const [requirements, setRequirements] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("generated-project.zip");
  const [error, setError] = useState<string | null>(null);

  // Clean up blob URL when component unmounts or when new one is created
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!requirements.trim()) {
      setError("Please describe your programming requirement first.");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Clear previous file if any
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Try to extract filename from content-disposition header
      const contentDisposition =
        response.headers.get("Content-Disposition") ||
        response.headers.get("content-disposition");

      let inferredFileName = "generated-project.zip";

      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (match && match[1]) {
          inferredFileName = match[1];
        }
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileName(inferredFileName);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Something went wrong while generating the project. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExample = () => {
    setRequirements(
      `Build a full-stack task manager:
- React frontend with task list, filters, and status badges
- FastAPI backend with CRUD endpoints for tasks
- PostgreSQL database
- Unit tests for backend endpoints and core task logic`
    );
  };

  return (
    <div className="app-root">
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <h2>AI agents are coding your project…</h2>
            <p>
              Orchestrating frontend, backend, and tests. This can take{" "}
              <strong>30–40 seconds</strong>.
            </p>
            <ul className="loading-steps">
              <li>🧠 Understanding your requirements</li>
              <li>⚙️ Designing architecture & code structure</li>
              <li>🧪 Generating tests and packaging everything into a ZIP</li>
            </ul>
          </div>
        </div>
      )}

      <div className="shell">
        <header className="header">
          <div className="logo-circle">⚙️</div>
          <div>
            <h1>AI Project Forge</h1>
            <p className="subtitle">
              Describe your programming requirement. Let a swarm of AI agents deliver a
              full project ZIP: frontend, backend, and tests.
            </p>
          </div>
        </header>

        <main className="main">
          <section className="panel">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-header">
                <h2>1. Describe your project</h2>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={handleUseExample}
                >
                  Use example requirement
                </button>
              </div>

              <label className="label">
                Project requirements
                <textarea
                  className="textarea"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={`Example:
- Build a REST API for a library system
- React frontend with book search and detail page
- SQLite or PostgreSQL database
- Include unit tests for key endpoints`}
                />
              </label>

              {error && <div className="error-banner">{error}</div>}

              <button
                type="submit"
                className="primary-btn"
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Project ZIP"}
              </button>

              <p className="hint">
                The request may take <strong>30–40 seconds</strong> while the agents
                work. Don’t close this tab.
              </p>
            </form>
          </section>

          <section className="panel">
            <h2>2. Download generated project</h2>
            {!downloadUrl && (
              <p className="empty-state">
                No project generated yet. Submit your requirements to get a downloadable
                ZIP package.
              </p>
            )}

            {downloadUrl && (
              <div className="download-card">
                <div className="file-meta">
                  <div className="file-icon">📦</div>
                  <div>
                    <div className="file-name">{fileName}</div>
                    <div className="file-desc">
                      Auto-generated full stack project from your requirements
                    </div>
                  </div>
                </div>

                <a
                  href={downloadUrl}
                  download={fileName}
                  className="primary-btn secondary"
                >
                  Download ZIP
                </a>
              </div>
            )}
          </section>

          <section className="panel mini-grid">
            <div>
              <h3>Multi-agent powered</h3>
              <p>
                Behind the scenes, specialized AI agents handle design, coding, and
                testing, then assemble everything into a ready-to-run project.
              </p>
            </div>
            <div>
              <h3>Full-stack out of the box</h3>
              <p>
                Generate backend APIs, frontend UI, and unit tests together, aligned to
                your single requirements document.
              </p>
            </div>
            <div>
              <h3>ZIP & run</h3>
              <p>
                Download the ZIP, open it in your IDE, install dependencies, and you’re
                ready to run and tweak.
              </p>
            </div>
          </section>
        </main>

        <footer className="footer">
          <span>Powered by AI multi-agent orchestration</span>
        </footer>
      </div>
    </div>
  );
};

export default App;
