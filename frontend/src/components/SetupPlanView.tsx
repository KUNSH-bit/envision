
import type { SetupPlan } from "../types/setup";

interface Props {
  plan: SetupPlan;
}

function SetupPlanView({ plan }: Props) {

  return (
    <div className="mt-10">

      <h2 className="text-3xl font-bold">
        {plan.title}
      </h2>

      <p className="text-gray-400 mt-2">
        {plan.description}
      </p>

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

              <h3 className="text-xl font-semibold">
                {step.title}
              </h3>

            </div>

            <p className="text-gray-400 mt-3">
              {step.description}
            </p>

            <div className="mt-5">

              <h4 className="font-semibold mb-3">
                Instructions
              </h4>

              <ol className="list-decimal list-inside space-y-2 text-gray-300">

                {step.instructions.map((instruction, i) => (

                  <li key={i}>
                    {instruction}
                  </li>

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

    </div>
  );
}

export default SetupPlanView;
