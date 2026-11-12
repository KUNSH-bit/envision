
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
  matchedPhrase?: string;
  matchScore?: number;
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

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    null
  );

  const [completedSteps, setCompletedSteps] = useState<
    Record<string, boolean>
  >({});

  const [copiedCommand, setCopiedCommand] = useState("");
  const [copyError, setCopyError] = useState("");

  const selectedIssue = searchResponse?.results.find(
    issue => issue.id === selectedIssueId
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!description.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setSearchResponse(null);
    setSelectedIssueId(null);
    setCompletedSteps({});
    setCopiedCommand("");
    setCopyError("");

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
    setSelectedIssueId(null);
    setCompletedSteps({});
    setCopiedCommand("");
    setCopyError("");
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps(previous => ({
      ...previous,
      [stepId]: !previous[stepId]
    }));
  };

  const handleCopyCommand = async (
    command: string,
    stepId: string
  ) => {
    try {
      await navigator.clipboard.writeText(command);

      setCopiedCommand(stepId);
      setCopyError("");
    } catch {
      setCopyError(
        "Could not copy automatically. Please select and copy the command manually."
      );
    }
  };

  const getProgress = (steps: TutorialStep[]) => {
    if (steps.length === 0) {
      return 0;
    }

    const completed = steps.filter(
      step => completedSteps[step.id]
    ).length;

    return Math.round((completed / steps.length) * 100);
  };

  const renderSteps = (steps: TutorialStep[]) => {
    if (steps.length === 0) {
      return (
        <p className="text-sm text-gray-500 mt-4">
          No detailed steps have been added to this solution yet.
        </p>
      );
    }

    const progress = getProgress(steps);

    return (
      <div className="mt-5">
        <div className="flex justify-between items-center mb-2">
          <h6 className="font-semibold text-gray-200">
            Follow these steps
          </h6>

          <span className="text-xs text-green-400">
            {progress}% completed
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden mb-5">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = Boolean(completedSteps[step.id]);

            return (
              <details
                key={step.id}
                className={`rounded-xl border ${
                  isCompleted
                    ? "border-green-800 bg-green-950/10"
                    : "border-gray-800 bg-gray-950/50"
                }`}
              >
                <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                  <span
                    className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-sm font-semibold ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>

                  <span
                    className={`flex-1 font-medium ${
                      isCompleted
                        ? "text-green-400"
                        : "text-gray-200"
                    }`}
                  >
                    {step.title}
                  </span>

                  <span className="text-gray-500 text-xs">
                    {isCompleted ? "Completed" : "View step"}
                  </span>

                  <span className="text-gray-400">▾</span>
                </summary>

                <div className="px-4 pb-4">
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-sm text-gray-300 leading-7 whitespace-pre-line">
                      {step.instructions}
                    </p>

                    {step.command && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Command
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCommand(
                                step.command!,
                                step.id
                              )
                            }
                            className="text-xs px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
                          >
                            {copiedCommand === step.id
                              ? "✓ Copied"
                              : "Copy command"}
                          </button>
                        </div>

                        <pre className="p-4 rounded-lg bg-black border border-gray-800 overflow-x-auto text-sm text-green-300 whitespace-pre-wrap break-all">
                          <code>{step.command}</code>
                        </pre>
                      </div>
                    )}

                    {step.expectedOutput && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-950/20 border border-blue-900/50">
                        <p className="text-xs font-semibold text-blue-300 mb-1">
                          EXPECTED RESULT
                        </p>

                        <p className="text-sm text-gray-300 leading-6">
                          {step.expectedOutput}
                        </p>
                      </div>
                    )}

                    <label className="flex items-center gap-3 mt-5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleStep(step.id)}
                        className="w-4 h-4 accent-green-500"
                      />

                      <span className="text-sm text-gray-300">
                        I've completed this step
                      </span>
                    </label>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSources = (sources: Source[]) => {
    if (sources.length === 0) {
      return (
        <p className="text-xs text-yellow-400 mt-4">
          No sources have been attached to this solution yet.
        </p>
      );
    }

    return (
      <div className="mt-5">
        <h6 className="text-sm font-medium mb-3">
          Official documentation and sources
        </h6>

        <ul className="space-y-2">
          {sources.map(source => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                {source.title} — {source.publisher} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTutorials = (tutorials: Tutorial[]) => {
    if (tutorials.length === 0) {
      return null;
    }

    return (
      <div className="mt-5">
        <h6 className="text-sm font-medium mb-3">
          Related tutorials
        </h6>

        <div className="space-y-3">
          {tutorials.map(tutorial => (
            <div
              key={tutorial.id}
              className="p-3 rounded-lg bg-gray-950 border border-gray-800"
            >
              <p className="font-medium text-blue-300">
                {tutorial.title}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                {tutorial.description}
              </p>

              {tutorial.sources.map(source => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-400 hover:underline mt-2"
                >
                  {source.title} ↗
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
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
          search its knowledge base for possible matching issues.
        </p>
      </div>

      {!searchResponse && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your issue
            </label>

            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Example: When I run g++ --version, Windows says that g++ is not recognized as an internal or external command..."
              rows={6}
              maxLength={3000}
              required
              className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 text-white placeholder-gray-500 outline-none focus:border-green-500 resize-y"
            />

            <p className="text-xs text-gray-500 mt-2">
              Include the exact error message if possible.
              {" "}{description.length}/3000
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Operating system
              </label>

              <select
                value={operatingSystem}
                onChange={event =>
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
                onChange={event => setLanguage(event.target.value)}
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
            {loading ? "Searching..." : "Find possible errors →"}
          </button>
        </form>
      )}

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
          </p>        </div>
      )}

      {searchResponse && !selectedIssue && (
        <div className="mt-10">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <h3 className="text-2xl font-bold">
                Possible errors
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {searchResponse.resultCount} possible matching issue(s) found.
                Select one to view its complete solution.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              New search
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
            <div className="space-y-3">
              {searchResponse.results.map((issue, index) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => {
                    setSelectedIssueId(issue.id);
                    setCopyError("");
                    setCopiedCommand("");
                  }}
                  className="w-full text-left p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-green-600 hover:bg-gray-900/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 text-gray-300 text-sm shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-100 group-hover:text-green-400 transition-colors">
                          {issue.title}
                        </h4>

                        <span className="text-xs px-2 py-1 rounded bg-green-950 text-green-300">
                          {issue.severity}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mt-1">
                        {issue.description}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {issue.solutions.length} saved solution(s)
                        {issue.matchedPhrase
                          ? ` · Matched: "${issue.matchedPhrase}"`
                          : ""}
                      </p>
                    </div>

                    <span className="text-gray-500 group-hover:text-green-400 text-lg shrink-0">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {searchResponse && selectedIssue && (
        <div className="mt-10">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <button
              onClick={() => {
                setSelectedIssueId(null);
                setCopyError("");
                setCopiedCommand("");
              }}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              ← Back to results
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              New search
            </button>
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-gray-900 border border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-green-950 text-green-300">
                {selectedIssue.severity}
              </span>

              <span className="text-xs text-gray-500">
                Knowledge base match
              </span>
            </div>

            <h3 className="text-2xl font-bold mt-4">
              {selectedIssue.title}
            </h3>

            <p className="text-gray-400 mt-3 leading-7">
              {selectedIssue.description}
            </p>

            <div className="mt-3 text-xs text-gray-500">
              <p>{selectedIssue.matchReason}</p>

              {selectedIssue.matchedPhrase && (
                <p className="mt-1">
                  Matched phrase: {selectedIssue.matchedPhrase}
                </p>
              )}
            </div>

            {selectedIssue.solutions.length === 0 && (
              <p className="text-sm text-yellow-300 mt-6">
                This issue has no saved solutions yet.
              </p>
            )}

            {selectedIssue.solutions.map(solution => (
              <div
                key={solution.id}
                className="border-t border-gray-800 mt-6 pt-6"
              >
                <h4 className="text-xl font-semibold text-green-400">
                  {solution.title}
                </h4>

                <p className="text-gray-300 mt-2 leading-7">
                  {solution.description}
                </p>

                {renderSteps(solution.steps)}

                {solution.verification && (
                  <div className="mt-6 p-4 rounded-lg bg-gray-950 border border-gray-800">
                    <h5 className="font-medium text-green-400">
                      Verify the solution
                    </h5>

                    <p className="text-sm text-gray-400 mt-2 leading-6">
                      {solution.verification}
                    </p>
                  </div>
                )}

                {renderSources(solution.sources)}
                {renderTutorials(solution.tutorials)}
              </div>
            ))}

            {renderTutorials(selectedIssue.tutorials)}
          </div>

          {copyError && (
            <div className="mt-5 p-3 rounded-lg bg-yellow-950/30 border border-yellow-800">
              <p className="text-sm text-yellow-300">
                {copyError}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueHelp;
