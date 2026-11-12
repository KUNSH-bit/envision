
import { useState, useEffect, useRef } from "react";

import { questions } from "./data/questions";

import QuestionCard from "./components/QuestionCard";
import ProgressBar from "./components/ProgressBar";
import SetupPlanView from "./components/SetupPlanView";
import IssueHelp from "./components/IssueHelp";

import { generateSetupPlan } from "./utils/generateSetupPlan";

import type {
  SetupConfiguration,
  SetupPlan
} from "./types/setup";

const initialConfig: SetupConfiguration = {
  operatingSystem: "",
  osVersion: "",
  linuxDistribution: "",
  environmentType: "",
  editors: [],
  languages: [],
  purposes: []
};

type Page =
  | "questionnaire"
  | "summary"
  | "choice"
  | "manual"
  | "automatic"
  | "issues";

function App() {
  const [step, setStep] = useState(0);

  const [config, setConfig] =
    useState<SetupConfiguration>(initialConfig);

  const [generatedPlan, setGeneratedPlan] =
    useState<SetupPlan | null>(null);

  const [page, setPage] = useState<Page>("questionnaire");

  const manualPlanRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (page === "manual") {
      manualPlanRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [page]);

  const visibleQuestions = questions.filter(
    question => !question.when || question.when(config)
  );

  const question = visibleQuestions[step];

  const handleSelect = (id: string) => {
    if (!question) return;

    setGeneratedPlan(null);

    if (question.type === "single") {
      setConfig(prev => {
        const updated = {
          ...prev,
          [question.id]: id
        } as SetupConfiguration;

        if (question.id === "operatingSystem") {
          updated.osVersion = "";
          updated.linuxDistribution = "";
        }

        if (
          question.id === "environmentType" &&
          id !== "wsl" &&
          prev.operatingSystem !== "linux"
        ) {
          updated.linuxDistribution = "";
        }

        return updated;
      });
    } else {
      setConfig(prev => {
        const values = prev[question.id] as string[];

        const updated = values.includes(id)
          ? values.filter(item => item !== id)
          : [...values, id];

        return {
          ...prev,
          [question.id]: updated
        } as SetupConfiguration;
      });
    }
  };

  const currentValue = question
    ? config[question.id]
    : [];

  const selected = Array.isArray(currentValue)
    ? currentValue
    : currentValue
      ? [currentValue]
      : [];

  const canContinue = selected.length > 0;

  const handleGeneratePlan = () => {
    const plan = generateSetupPlan(config);

    setGeneratedPlan(plan);
    setPage("choice");
  };

  const handleReset = () => {
    setStep(0);
    setConfig(initialConfig);
    setGeneratedPlan(null);
    setPage("questionnaire");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            DevSetup
          </h1>

          <p className="text-gray-400">
            Let's build your development environment.
          </p>

          {page !== "issues" && (
            <button
              onClick={() => setPage("issues")}
              className="mt-5 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 hover:border-green-500 transition-colors text-sm"
            >
              🔧 Troubleshoot an issue
            </button>
          )}
        </div>

        {page === "questionnaire" && (
          <>
            <ProgressBar
              current={step + 1}
              total={visibleQuestions.length}
            />

            {question && (
              <>
                <div className="mt-10 mb-8">
                  <h2 className="text-2xl font-semibold">
                    {question.title}
                  </h2>

                  <p className="text-gray-400 mt-2">
                    {question.description}
                  </p>
                </div>

                <QuestionCard
                  options={question.options}
                  selected={selected}
                  multiple={question.type === "multiple"}
                  onSelect={handleSelect}
                />
              </>
            )}

            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(prev => prev - 1)}
                disabled={step === 0}
                className="px-6 py-3 rounded-lg bg-gray-800 disabled:opacity-30"
              >
                Back
              </button>

              <button
                onClick={() => {
                  const nextStep = step + 1;

                  setStep(nextStep);

                  if (nextStep >= visibleQuestions.length) {
                    setPage("summary");
                  }
                }}
                disabled={!canContinue}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-30"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {page === "summary" && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold">
              Your setup is ready!
            </h2>

            <p className="text-gray-400 mt-2">
              Here's the configuration you've selected.
            </p>

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <SummaryItem
                label="Operating System"
                value={config.operatingSystem}
              />

              <SummaryItem
                label="OS Version"
                value={config.osVersion}
              />

              <SummaryItem
                label="Linux Distribution"
                value={config.linuxDistribution}
              />

              <SummaryItem
                label="Environment"
                value={config.environmentType}
              />

              <SummaryItem
                label="Editors"
                value={config.editors.join(", ")}
              />

              <SummaryItem
                label="Languages"
                value={config.languages.join(", ")}
              />

              <SummaryItem
                label="Development Purpose"
                value={config.purposes.join(", ")}
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                Start over
              </button>

              <button
                onClick={handleGeneratePlan}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500"
              >
                Generate setup plan
              </button>
            </div>
          </div>
        )}

        {page === "choice" && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold">
              How would you like to set up your environment?
            </h2>

            <p className="text-gray-400 mt-3">
              Your personalized setup plan is ready.
              Choose how you want to proceed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
              <button
                onClick={() => setPage("manual")}
                className="text-left p-6 rounded-xl border border-gray-700 bg-gray-900 hover:border-green-500 transition-all"
              >
                <div className="text-3xl mb-4">📖</div>

                <h3 className="text-xl font-semibold">
                  Manual Setup
                </h3>

                <p className="text-gray-400 text-sm mt-3">
                  Follow detailed instructions and configure
                  your development environment yourself.
                </p>

                <div className="mt-6 text-green-400 font-medium">
                  View documentation →
                </div>
              </button>

              <button
                onClick={() => setPage("automatic")}
                className="text-left p-6 rounded-xl border border-gray-700 bg-gray-900 hover:border-blue-500 transition-all"
              >
                <div className="text-3xl mb-4">⚡</div>

                <h3 className="text-xl font-semibold">
                  Automatic Setup
                </h3>

                <p className="text-gray-400 text-sm mt-3">
                  Let DevSetup configure and install the
                  required development tools for you.
                </p>

                <div className="mt-6 text-blue-400 font-medium">
                  Start automatic setup →
                </div>
              </button>
            </div>

            <button
              onClick={() => setPage("summary")}
              className="mt-8 px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              Back to configuration
            </button>
          </div>
        )}

        {page === "manual" && generatedPlan && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold">
              Manual Setup
            </h2>

            <p className="text-gray-400 mt-2">
              Follow the instructions below to configure
              your development environment.
            </p>

            <button
              onClick={() => setPage("choice")}
              className="mt-6 px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              ← Change setup method
            </button>

            <div
              ref={manualPlanRef}
              className="mt-8 scroll-mt-8"
            >
              <SetupPlanView plan={generatedPlan} />
            </div>
          </div>
        )}

        {page === "automatic" && (
          <div className="mt-10 bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="text-4xl mb-5">⚡</div>

            <h2 className="text-3xl font-bold">
              Automatic Setup
            </h2>

            <p className="text-gray-400 mt-4">
              Automatic installation is not available yet.
              We're working on the local setup agent that will
              install and configure tools on your computer.
            </p>

            <div className="mt-6 p-4 rounded-lg bg-gray-950 border border-gray-800">
              <p className="font-semibold">
                Your setup plan is safe.
              </p>

              <p className="text-sm text-gray-400 mt-2">
                You can switch to manual setup at any time
                and follow the documentation instead.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => setPage("manual")}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500"
              >
                Switch to manual setup
              </button>

              <button
                onClick={() => setPage("choice")}
                className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {page === "issues" && (
          <IssueHelp
            onBack={() => setPage("questionnaire")}
          />
        )}

      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-400">
        {label}
      </span>

      <span className="font-medium">
        {value}
      </span>
    </div>
  );
}

export default App;
