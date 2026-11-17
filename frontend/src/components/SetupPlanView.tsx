
import { useEffect, useState } from "react";
import type { SetupConfiguration, SetupPlan } from "../types/setup";

interface Props {
  plan: SetupPlan;
  config: SetupConfiguration;
}

interface TutorialSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  os: string;
  status: "DRAFT" | "VERIFIED" | "OUTDATED";
  version?: string | null;
  lastVerifiedAt?: string | null;
}

interface TutorialStep {
  id: string;
  order: number;
  title: string;
  instructions: string | string[];
  command?: string | null;
  expectedOutput?: string | null;
}

interface TutorialSource {
  id: string;
  title: string;
  url: string;
  publisher?: string | null;
  sourceVersion?: string | null;
  lastVerifiedAt?: string | null;
}

interface TutorialDetails extends TutorialSummary {
  steps: TutorialStep[];
  sources: TutorialSource[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const osMap: Record<string, string> = {
  windows: "Windows",
  linux: "Linux",
  macos: "macOS",
};

function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();

  const languageMap: Record<string, string> = {
    "c++": "C++",
    cpp: "C++",
    python: "Python",
    javascript: "Node.js",
    "node.js": "Node.js",
    nodejs: "Node.js",
    java: "Java",
    rust: "Rust",
  };

  return languageMap[normalized] || language;
}

async function readJson(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function getTutorialArray(data: unknown): TutorialSummary[] {
  if (Array.isArray(data)) {
    return data as TutorialSummary[];
  }

  if (
    data &&
    typeof data === "object" &&
    "tutorials" in data &&
    Array.isArray(data.tutorials)
  ) {
    return data.tutorials as TutorialSummary[];
  }

  return [];
}

function getTutorialDetails(data: unknown): TutorialDetails {
  if (
    data &&
    typeof data === "object" &&
    "tutorial" in data &&
    data.tutorial
  ) {
    return data.tutorial as TutorialDetails;
  }

  return data as TutorialDetails;
}

function StatusLabel({ status }: { status: TutorialSummary["status"] }) {
  const styles = {
    VERIFIED: "bg-green-900/40 text-green-400 border-green-800",
    DRAFT: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
    OUTDATED: "bg-red-900/40 text-red-400 border-red-800",
  };

  return (
    <span
      className={`inline-block border rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.DRAFT}`}
    >
      {status}
    </span>
  );
}

function SetupPlanView({ plan, config }: Props) {
  const [tutorials, setTutorials] = useState<TutorialSummary[]>([]);
  const [selectedTutorial, setSelectedTutorial] =
    useState<TutorialDetails | null>(null);

  const [loadingTutorials, setLoadingTutorials] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTutorials() {
      setTutorials([]);
      setSelectedTutorial(null);
      setError("");

      const os = osMap[config.operatingSystem.toLowerCase()];

      if (!os || config.languages.length === 0) {
        return;
      }

      setLoadingTutorials(true);

      try {
        const languages = [
          ...new Set(config.languages.map(normalizeLanguage)),
        ];

        const results = await Promise.all(
          languages.map(async (language) => {
            const params = new URLSearchParams({
              os,
              language,
            });

            const response = await fetch(
              `${API_BASE_URL}/api/tutorials?${params.toString()}`,
              { signal: controller.signal }
            );

            const data = await readJson(response);
            return getTutorialArray(data);
          })
        );

        if (controller.signal.aborted) return;

        const uniqueTutorials = new Map<string, TutorialSummary>();

        results.flat().forEach((tutorial) => {
          uniqueTutorials.set(tutorial.id, tutorial);
        });

        setTutorials(Array.from(uniqueTutorials.values()));
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Could not load tutorials:", err);
        setError(
          "Could not load tutorials. Make sure the backend server is running."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTutorials(false);
        }
      }
    }

    fetchTutorials();

    return () => controller.abort();
  }, [config.operatingSystem, config.languages]);

  async function openTutorial(tutorial: TutorialSummary) {
    setSelectedTutorial(null);
    setLoadingDetails(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tutorials/${encodeURIComponent(tutorial.id)}`
      );

      const data = await readJson(response);
      setSelectedTutorial(getTutorialDetails(data));
    } catch (err) {
      console.error("Could not load tutorial details:", err);
      setError("Could not load this tutorial. Please try again.");
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold">{plan.title}</h2>

      <p className="text-gray-400 mt-2">{plan.description}</p>

      <div className="mt-8 space-y-5">
        {plan.steps.map((step, index) => (
          <div
            key={step.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-green-400 font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="text-xl font-semibold">{step.title}</h3>
            </div>

            <p className="text-gray-400 mt-3">{step.description}</p>

            <div className="mt-5">
              <h4 className="font-semibold mb-3">Instructions</h4>

              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                {step.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ol>
            </div>

            {step.verificationCommands &&
              step.verificationCommands.length > 0 && (
                <div className="mt-5">
                  <h4 className="font-semibold mb-3">
                    Verification commands
                  </h4>

                  {step.verificationCommands.map((command, i) => (
                    <code
                      key={i}
                      className="block bg-gray-950 rounded-lg p-3 text-green-400 mb-2"
                    >
                      {command}
                    </code>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      <div className="mt-14 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold">Tutorials from DevSetup</h2>

        <p className="text-gray-400 mt-2">
          Detailed tutorials retrieved from the DevSetup knowledge base.
        </p>

        {loadingTutorials && (
          <p className="text-gray-400 mt-6">
            Loading tutorials for your configuration...
          </p>
        )}

        {!loadingTutorials && !error && tutorials.length === 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold">No matching tutorials yet</h3>
            <p className="text-gray-400 text-sm mt-2">
              We don't currently have tutorials for this operating system and
              language combination. More tutorials will be added to the
              knowledge base.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-950/40 border border-red-900 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {!loadingTutorials && tutorials.length > 0 && (
          <div className="mt-6 space-y-4">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    {tutorial.title}
                  </h3>

                  <StatusLabel status={tutorial.status} />
                </div>

                <p className="text-gray-400 text-sm mt-2">
                  {tutorial.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-400">
                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    {tutorial.language}
                  </span>

                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    {tutorial.os}
                  </span>

                  {tutorial.version && (
                    <span className="bg-gray-800 px-3 py-1 rounded-full">
                      Version {tutorial.version}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => openTutorial(tutorial)}
                  className="mt-5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
                >
                  View full tutorial →
                </button>
              </div>
            ))}
          </div>
        )}

        {loadingDetails && (
          <p className="text-gray-400 mt-8">
            Loading the full tutorial...
          </p>
        )}

        {selectedTutorial && (
          <div className="mt-10 bg-gray-900 border border-gray-700 rounded-xl p-6">
            <button
              onClick={() => setSelectedTutorial(null)}
              className="text-green-400 hover:text-green-300 text-sm mb-6"
            >
              ← Back to tutorials
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">
                {selectedTutorial.title}
              </h2>

              <StatusLabel status={selectedTutorial.status} />
            </div>

            <p className="text-gray-400 mt-3">
              {selectedTutorial.description}
            </p>

            {selectedTutorial.status === "DRAFT" && (
              <div className="mt-5 p-4 rounded-lg border border-yellow-800 bg-yellow-950/30 text-yellow-300 text-sm">
                This tutorial is currently a draft. Its instructions have
                not yet been marked as verified.
              </div>
            )}

            {selectedTutorial.status === "OUTDATED" && (
              <div className="mt-5 p-4 rounded-lg border border-red-800 bg-red-950/30 text-red-300 text-sm">
                This tutorial may contain outdated instructions. Check the
                official documentation before following it.
              </div>
            )}

            <div className="mt-8 space-y-8">
              {selectedTutorial.steps
                ?.slice()
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <div
                    key={step.id}
                    className="border-t border-gray-800 pt-6"
                  >
                    <h3 className="text-xl font-semibold">
                      <span className="text-green-400 mr-2">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step.title}
                    </h3>

                    {Array.isArray(step.instructions) ? (
                      <ol className="list-decimal list-inside mt-4 space-y-2 text-gray-300">
                        {step.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-gray-300 mt-4 whitespace-pre-line">
                        {step.instructions}
                      </p>
                    )}

                    {step.command && (
                      <div className="mt-5">
                        <h4 className="font-semibold text-sm mb-2">
                          Command
                        </h4>

                        <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-gray-950 border border-gray-800 rounded-lg p-4 text-green-400 text-sm">
                          {step.command}
                        </pre>
                      </div>
                    )}

                    {step.expectedOutput && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">
                          Expected output
                        </h4>

                        <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 text-sm">
                          {step.expectedOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {selectedTutorial.sources?.length > 0 && (
              <div className="mt-10 border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold">
                  Documentation sources
                </h3>

                <div className="mt-4 space-y-3">
                  {selectedTutorial.sources.map((source) => (
                    <div key={source.id} className="text-sm">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:underline"
                      >
                        {source.title} ↗
                      </a>

                      {source.publisher && (
                        <p className="text-gray-500 mt-1">
                          {source.publisher}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SetupPlanView;
