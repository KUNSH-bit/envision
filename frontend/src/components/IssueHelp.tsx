
import { useState } from "react";

interface IssueHelpProps {
  onBack: () => void;
}

function IssueHelp({ onBack }: IssueHelpProps) {
  const [description, setDescription] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("Windows");
  const [language, setLanguage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!description.trim()) {
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setDescription("");
    setLanguage("");
    setSubmitted(false);
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
          Describe the problem you're facing. DevSetup will use your
          environment details to help find the relevant solution.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your issue
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: I installed MinGW, but when I run g++ --version, Windows says that g++ is not recognized..."
              rows={6}
              required
              className="w-full rounded-xl bg-gray-900 border border-gray-700 p-4 text-white placeholder-gray-500 outline-none focus:border-green-500 resize-y"
            />

            <p className="text-xs text-gray-500 mt-2">
              Include the exact error message if possible.
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
                <option value="">Not applicable / Not sure</option>
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
            disabled={!description.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            Find a solution →
          </button>
        </form>
      ) : (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <div className="text-2xl mb-3">✓</div>

          <h3 className="text-xl font-semibold">
            Issue details captured
          </h3>

          <p className="text-gray-400 mt-2">
            The issue-search service is not connected yet. Once we connect
            the backend, DevSetup will search its knowledge base for
            matching issues and verified solutions.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-gray-400">Your issue</p>
              <p className="mt-1 whitespace-pre-wrap">{description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Operating system</p>
              <p className="mt-1">{operatingSystem}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Language or tool</p>
              <p className="mt-1">{language || "Not specified"}</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-7 px-5 py-3 rounded-lg bg-green-600 hover:bg-green-500"
          >
            Ask another issue
          </button>
        </div>
      )}
    </div>
  );
}

export default IssueHelp;
