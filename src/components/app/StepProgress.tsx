import { ProgressBar } from "@/components/ui/Progress";
import { toPersianDigits } from "@/lib/utils";

export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2 flex items-center justify-between text-xs text-text-500">
        <span>{toPersianDigits(current)} از {toPersianDigits(total)}</span>
      </div>
      <ProgressBar value={(current / total) * 100} />
    </div>
  );
}
