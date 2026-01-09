"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#001489] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-[#bba14f]">⚓</span>
            Pompey News
          </h1>
          <p className="mt-2 text-blue-200 text-sm">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#bba14f] transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-[#bba14f] text-[#001489] font-semibold hover:bg-[#bba14f]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>

      </div>
    </main>
  );
}
