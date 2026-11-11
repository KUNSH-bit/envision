
import type { QuestionOption } from "../types/setup";

interface Props {
  options: QuestionOption[];
  selected: string[];
  multiple: boolean;
  onSelect: (id: string) => void;
}

function QuestionCard({
  options,
  selected,
  multiple,
  onSelect
}: Props) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {options.map((option) => {

        const active = selected.includes(option.id);

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`text-left p-5 rounded-xl border transition-all
              ${
                active
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-700 bg-gray-900 hover:border-gray-500"
              }`}
          >

            <div className="flex items-center justify-between">

              <span className="text-lg font-semibold">
                {option.label}
              </span>

              <span>
                {active ? "✓" : multiple ? "+" : "○"}
              </span>

            </div>

            <p className="text-sm text-gray-400 mt-2">
              {option.description}
            </p>

          </button>
        );
      })}

    </div>
  );
}

export default QuestionCard;
