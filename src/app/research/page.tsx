"use client";

import { useEffect, useState } from "react";

interface ResearchItem {
  id: number;
  title: string;
  description: string;
  category: string;
  file_url: string | null;
  link: string | null;
  created_at: string;
}

export default function ResearchPage() {
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/research")
      .then((r) => r.json())
      .then((data) => {
        setResearch(data.research || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(research.map((r) => r.category))];
  const filtered = filter === "all" ? research : research.filter((r) => r.category === filter);

  const categoryLabels: Record<string, string> = {
    paper: "📄 Paper",
    code: "💻 Code",
    data: "📊 Data",
    working_paper: "📝 Working Paper",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Research</h1>
        <p className="text-lg text-slate-600">
          Explore ongoing research projects, publications, working papers, code, and datasets.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat === "all" ? "All" : categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading research...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No research items yet.</p>
          <p className="text-slate-400 mt-2">Research will appear here once added by the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {categoryLabels[item.category] || item.category}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-600 mb-4">{item.description}</p>
              <div className="flex gap-3">
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    View Link →
                  </a>
                )}
                {item.file_url && (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                  >
                    Download File →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
