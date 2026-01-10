import { type SummaryData } from "@/lib/summary";

interface AISummaryProps {
  summaryData: SummaryData;
}

function SummaryContent({ summary }: { summary: string }) {
  // Check if this is transfer window format
  const isTransferFormat = summary.includes("Current news:") ||
                           summary.includes("Signed:") ||
                           summary.includes("Rumored:");

  if (!isTransferFormat) {
    return (
      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
        {summary}
      </p>
    );
  }

  // Parse transfer window format
  const sections: { label: string; content: string; icon: string }[] = [];

  // Extract each section using regex
  const currentNewsMatch = summary.match(/Current news:\s*([^]*?)(?=Signed:|Rumored:|$)/i);
  const signedMatch = summary.match(/Signed:\s*([^]*?)(?=Rumored:|$)/i);
  const rumoredMatch = summary.match(/Rumored:\s*([^]*?)$/i);

  if (currentNewsMatch?.[1]?.trim()) {
    sections.push({ label: "Current News", content: currentNewsMatch[1].trim(), icon: "📰" });
  }
  if (signedMatch?.[1]?.trim()) {
    sections.push({ label: "Signed", content: signedMatch[1].trim(), icon: "✅" });
  }
  if (rumoredMatch?.[1]?.trim()) {
    sections.push({ label: "Rumored", content: rumoredMatch[1].trim(), icon: "👀" });
  }

  if (sections.length === 0) {
    return (
      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
        {summary}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <div key={i}>
          <div className="flex items-center gap-1.5 mb-1">
            <span>{section.icon}</span>
            <span className="text-xs font-semibold text-[#001489] dark:text-[#bba14f] uppercase tracking-wide">
              {section.label}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed pl-5">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
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

      <SummaryContent summary={summary} />

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
