
import { useState } from "react";

import { questions } from "./data/questions";

import QuestionCard from "./components/QuestionCard";
import ProgressBar from "./components/ProgressBar";

import type { SetupConfiguration } from "./types/setup";

const initialConfig: SetupConfiguration = {
  operatingSystem: "",
  osVersion: "",
  linuxDistribution: "",
  environmentType: "",
  editors: [],
  languages: [],
  purposes: []
};

function App() {

  const [step, setStep] = useState(0);

  const [config, setConfig] =
    useState<SetupConfiguration>(initialConfig);

  // Only show questions whose conditions are satisfied.
  const visibleQuestions = questions.filter(
    question => !question.when || question.when(config)
  );

  const question = visibleQuestions[step];

  // Show the summary after the last question.
  const isComplete = step >= visibleQuestions.length;

  const currentValue = question
    ? config[question.id]
    : [];

  // Normalize single and multiple selections.
  const selected = Array.isArray(currentValue)
    ? currentValue
    : currentValue
      ? [currentValue]
      : [];

  
const handleSelect = (id: string) => {

  if (!question) return;

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


  const canContinue = selected.length > 0;

  return (

    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">

      <div className="w-full max-w-3xl">

        <h1 className="text-3xl font-bold mb-2">
          DevSetup
        </h1>

        <p className="text-gray-400 mb-10">
          Let's build your development environment.
        </p>

        {!isComplete ? (

          <>
            <ProgressBar
              current={step + 1}
              total={visibleQuestions.length}
            />

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

            <div className="flex justify-between mt-10">

              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="px-6 py-3 rounded-lg bg-gray-800 disabled:opacity-30"
              >
                Back
              </button>

              <button
                onClick={() => setStep(step + 1)}
                disabled={!canContinue}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-30"
              >
                Continue
              </button>

            </div>
          </>

        ) : (

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

            <button
              onClick={() => setStep(0)}
              className="mt-8 px-6 py-3 rounded-lg bg-green-600"
            >
              Back to beginning
            </button>

            <button
              onClick={() => {
                console.log("Final configuration:", config);
              }}
              className="mt-8 ml-3 px-6 py-3 rounded-lg bg-gray-800"
            >
              Generate setup plan
            </button>

          </div>

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
