
interface Props {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: Props) {

  const percentage = (current / total) * 100;

  return (
    <div className="w-full">

      <div className="flex justify-between text-sm mb-2">
        <span>Setup progress</span>
        <span>{current}/{total}</span>
      </div>

      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">

        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />

      </div>

    </div>
  );
}

export default ProgressBar;
