
import { useState, type FormEvent } from "react";

interface IssueHelpProps {
  onBack: () => void;
}

interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
}

interface TutorialStep {
  id: string;
  order: number;
  title: string;
  instructions: string;
  command: string | null;
  expectedOutput: string | null;
}

interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  sources: Source[];
}

interface Solution {
  id: string;
  title: string;
  description: string;
  verification: string;
  steps: TutorialStep[];
  tutorials: Tutorial[];
  sources: Source[];
}

interface IssueResult {
  id: string;
  title: string;
  description: string;
  severity: string;
  matchReason: string;
  solutions: Solution[];
  tutorials: Tutorial[];
}

interface SearchResponse {
  message: string;
  resultCount: number;
  results: IssueResult[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function IssueHelp({ onBack }: IssueHelpProps) {
  const [description, setDescription] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("Windows");
  const [language, setLanguage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResponse, setSearchResponse] =
    useState<SearchResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!description.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setSearchResponse(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/issues/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            description: description.trim(),
            operatingSystem,
            language
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not search for your issue."
        );
      }

      setSearchResponse(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the DevSetup backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription("");
    setLanguage("");
    setError("");
    setSearchResponse(null);
  };

  return (
    <div className="mt-10">
      <button
        onClick={onBack}
        className="mb-8 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
      >
        ← Back
      </button>

      <div className="mb-8">
        <div className="text-4xl mb-4">🔧</div>

        <h2 className="text-3xl font-bold">
          Troubleshoot an issue
        </h2>

        <p className="text-gray-400 mt-3">
          Describe the problem you're facing. DevSetup will
          search its knowledge base for matching issues and solutions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your issue
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: When I run g++ --version, Windows says that g++ is not recognized as an internal or external command..."
            rows={6}
            maxLength={3000}
            required
            className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 text-white placeholder-gray-500 outline-none focus:border-green-500 resize-y"
          />

          <p className="text-xs text-gray-500 mt-2">
            Include the exact error message if possible.
            {description.length}/3000
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Operating system
            </label>

            <select
              value={operatingSystem}
              onChange={(event) =>
                setOperatingSystem(event.target.value)
              }
              className="w-full rounded-lg bg-gray-900 border border-gray-700 p-3 text-white outline-none focus:border-green-500"
            >
              <option value="Windows">Windows</option>
              <option value="Linux">Linux</option>
              <option value="macOS">macOS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Programming language or tool
            </label>

            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 p-3 text-white outline-none focus:border-green-500"
            >
              <option value="">Not sure / Not applicable</option>
              <option value="C++">C++</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Java">Java</option>
              <option value="Rust">Rust</option>
              <option value="VS Code">VS Code</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!description.trim() || loading}
          className="w-full sm:w-auto px-7 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Searching..." : "Find a solution →"}
        </button>
      </form>

      {loading && (
        <div className="mt-8 p-5 rounded-xl bg-gray-900 border border-gray-800">
          <p className="text-gray-300">
            Searching the DevSetup knowledge base...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-8 p-5 rounded-xl bg-red-950/30 border border-red-800">
          <h3 className="font-semibold text-red-300">
            Search failed
          </h3>

          <p className="text-sm text-red-200 mt-2">
            {error}
          </p>

          <p className="text-xs text-gray-400 mt-3">
            Check that your backend server is running and that
            PostgreSQL is connected.
          </p>
        </div>
      )}

      {searchResponse && (
        <div className="mt-10">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <h3 className="text-2xl font-bold">
                Search results
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {searchResponse.resultCount} matching issue(s) found
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Ask another issue
            </button>
          </div>

          {searchResponse.results.length === 0 ? (
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <h4 className="text-lg font-semibold">
                No matching issue found
              </h4>

              <p className="text-gray-400 mt-2">
                This issue may not be in our knowledge base yet.
                Try including the exact error message or a little
                more context.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResponse.results.map((issue) => (
                <div
                  key={issue.id}
                  className="p-6 rounded-xl bg-gray-900 border border-gray-800"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-green-950 text-green-300">
                      {issue.severity}
                    </span>

                    <span className="text-xs text-gray-500">
                      Knowledge base match
                    </span>
                  </div>

                  <h4 className="text-xl font-semibold mt-3">
                    {issue.title}
                  </h4>

                  <p className="text-gray-400 mt-2">
                    {issue.description}
                  </p>

                  <p className="text-xs text-gray-500 mt-3">
                    {issue.matchReason}
                  </p>

                  <div className="mt-6 space-y-5">
                    {issue.solutions.length === 0 && (
                      <p className="text-sm text-yellow-300">
                        This issue has no saved solutions yet.
                      </p>
                    )}

                    {issue.solutions.map((solution) => (
                      <div
                        key={solution.id}
                        className="border-t border-gray-800 pt-5"
                      >
                        <h5 className="text-lg font-semibold text-green-400">
                          {solution.title}
                        </h5>

                        <p className="text-gray-300 mt-2">
                          {solution.description}
                        </p>

                        {solution.steps.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-medium mb-3">
                              Follow these steps
                            </h6>

                            <ol className="space-y-4 list-decimal list-inside">
                              {solution.steps.map((step) => (
                                <li key={step.id}>
                                  <span className="font-medium">
                                    {step.title}
                                  </span>

                                  <p className="text-sm text-gray-400 mt-1 ml-6">
                                    {step.instructions}
                                  </p>

                                  {step.command && (
                                    <pre className="mt-2 ml-6 p-3 rounded-lg bg-gray-950 border border-gray-800 overflow-x-auto text-sm text-green-300">
                                      <code>{step.command}</code>
                                    </pre>
                                  )}

                                  {step.expectedOutput && (
                                    <p className="text-xs text-gray-500 mt-2 ml-6">
                                      Expected result: {step.expectedOutput}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {solution.verification && (
                          <div className="mt-5 p-4 rounded-lg bg-gray-950 border border-gray-800">
                            <h6 className="font-medium">
                              Verify the solution
                            </h6>

                            <p className="text-sm text-gray-400 mt-2">
                              {solution.verification}
                            </p>
                          </div>
                        )}

                        {solution.sources.length > 0 && (
                          <div className="mt-4">
                            <h6 className="text-sm font-medium mb-2">
                              Sources
                            </h6>

                            <ul className="space-y-2">
                              {solution.sources.map((source) => (
                                <li key={source.id}>
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-400 hover:underline"
                                  >
                                    {source.title} — {source.publisher}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {solution.tutorials.length > 0 && (
                          <div className="mt-4">
                            <h6 className="text-sm font-medium mb-2">
                              Related tutorials
                            </h6>

                            {solution.tutorials.map((tutorial) => (
                              <p
                                key={tutorial.id}
                                className="text-sm text-blue-400"
                              >
                                {tutorial.title}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueHelp;
