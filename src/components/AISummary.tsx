"use client";

import { useState } from "react";

interface StoryCluster {
  topic: string;
  indices: number[];
}

interface AISummaryProps {
  headlines: string[];
}

export function AISummary({ headlines }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [clusters, setClusters] = useState<StoryCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setSummary(data.summary);
      setClusters(data.clusters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-[#001489]/5 to-[#bba14f]/5 dark:from-[#001489]/20 dark:to-[#bba14f]/20 rounded-lg border border-[#001489]/20 dark:border-[#bba14f]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#001489] dark:text-[#bba14f]">
            AI Summary
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            powered by Claude
          </span>
        </div>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium rounded-md bg-[#001489] text-white hover:bg-[#001489]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating..." : summary ? "Refresh" : "Generate"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {summary ? (
        <>
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
        </>
      ) : !loading && !error ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm italic">
          Click &quot;Generate&quot; to get an AI summary and group related stories
        </p>
      ) : null}

      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <div className="animate-spin h-4 w-4 border-2 border-[#001489] border-t-transparent rounded-full" />
          <span className="text-sm">Analyzing headlines...</span>
        </div>
      )}
    </div>
  );
}
