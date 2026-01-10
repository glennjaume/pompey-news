import { type SummaryData } from "@/lib/summary";

interface AISummaryProps {
  summaryData: SummaryData;
}

function getRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function AISummary({ summaryData }: AISummaryProps) {
  const { summary, clusters, generatedAt } = summaryData;

  if (!summary) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-[#001489]/5 to-[#bba14f]/5 dark:from-[#001489]/20 dark:to-[#bba14f]/20 rounded-lg border border-[#001489]/20 dark:border-[#bba14f]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#001489] dark:text-[#bba14f]">
            AI Summary
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            powered by Claude
          </span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Updated {getRelativeTime(generatedAt)}
        </span>
      </div>

      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
        {summary}
      </p>

      {clusters.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#001489]/10 dark:border-[#bba14f]/20">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Related stories grouped:
          </p>
          <div className="flex flex-wrap gap-2">
            {clusters.map((cluster, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[#001489]/10 dark:bg-[#bba14f]/20 text-[#001489] dark:text-[#bba14f]"
              >
                <span>{cluster.topic}</span>
                <span className="text-[10px] opacity-60">
                  ({cluster.indices.length})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
