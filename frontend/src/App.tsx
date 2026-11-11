
import { useState } from "react";

import { questions } from "./data/questions";

import QuestionCard from "./components/QuestionCard";
import ProgressBar from "./components/ProgressBar";

import type { SetupConfiguration } from "./types/setup";

const initialConfig: SetupConfiguration = {
  operatingSystem: "",
  osVersion: "",
  environmentType: "",
  linuxDistribution: "",
  editors: [],
  languages: [],
  purposes: []
};

function App() {

  const [step, setStep] = useState(0);

  const [config, setConfig] =
    useState<SetupConfiguration>(initialConfig);

  const question = questions[step];

  const selected = config[
    question.id as keyof SetupConfiguration
  ] as string[];

  const handleSelect = (id: string) => {

    const current = config[
      question.id as keyof SetupConfiguration
    ];

    if (question.type === "single") {

      setConfig({
        ...config,
        [question.id]: id
      });

    } else {

      const values = current as string[];

      const updated = values.includes(id)
        ? values.filter(item => item !== id)
        : [...values, id];

      setConfig({
        ...config,
        [question.id]: updated
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

        <ProgressBar
          current={step + 1}
          total={questions.length}
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
            onClick={() => {
              if (step < questions.length - 1) {
                setStep(step + 1);
              } else {
                console.log("Final configuration:", config);
              }
            }}
            disabled={!canContinue}
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-30"
          >
            {step === questions.length - 1
              ? "Finish"
              : "Continue"}
          </button>

        </div>

      </div>

    </div>

  );
}

export default App;
