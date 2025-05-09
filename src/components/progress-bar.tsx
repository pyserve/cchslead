import { cn } from "@/lib/utils";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full relative py-2">
      <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            progress === 100 ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span
        className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold ${
          progress > 50 ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {progress}%
      </span>
    </div>
  );
}
