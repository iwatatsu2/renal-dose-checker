"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type DrugStatus = {
  dialysis: "normal" | "reduce" | "contraindicated" | "caution" | "unknown";
  ckd: "normal" | "reduce" | "contraindicated" | "caution" | "unknown";
};

type Drug = {
  name: string;
  routes: string[];
  group: string;
  status: DrugStatus;
  dialysis: string;
  ckd: string;
  normalDose: string;
  [key: string]: unknown;
};

const KANA_GROUPS = [
  "全て",
  "ア行",
  "カ行",
  "サ行",
  "タ行",
  "ナ行",
  "ハ行",
  "マ行",
  "ヤ行",
  "ラ行",
  "ワ行",
];

const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  contraindicated: {
    label: "禁忌",
    className: "bg-red-900/60 text-red-300 border-red-700/50",
  },
  reduce: {
    label: "減量",
    className: "bg-yellow-900/60 text-yellow-300 border-yellow-700/50",
  },
  normal: {
    label: "常用量",
    className: "bg-green-900/60 text-green-300 border-green-700/50",
  },
  caution: {
    label: "注意",
    className: "bg-orange-900/60 text-orange-300 border-orange-700/50",
  },
  unknown: {
    label: "—",
    className: "bg-gray-800 text-gray-500 border-gray-700",
  },
};

export default function DrugList({
  drugs,
  allDrugs,
}: {
  drugs: Drug[];
  allDrugs: Drug[];
}) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("全て");

  const filtered = useMemo(() => {
    let result = drugs;
    if (activeGroup !== "全て") {
      result = result.filter((d) => d.group === activeGroup);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    return result;
  }, [drugs, query, activeGroup]);

  return (
    <>
      {/* Search */}
      <div className="sticky top-[52px] z-10 bg-gray-900 px-4 pt-3 pb-2 shadow-sm border-b border-gray-800 max-w-3xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="薬剤名で検索（例：アムロジピン）"
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-600 bg-gray-800 text-gray-100 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* 50音 Filter */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
          {KANA_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeGroup === g
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-3xl mx-auto px-4 pt-2 pb-1 flex items-center gap-3 text-[10px]">
        <span className="text-gray-500">{filtered.length}件</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-500">HD=透析</span>
        <span className="text-gray-500">CKD=保存期</span>
      </div>

      {/* Drug list */}
      <ul className="max-w-3xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-1 pb-4">
        {filtered.map((drug) => {
          const idx = allDrugs.indexOf(drug);
          const ds = STATUS_BADGE[drug.status.dialysis];
          const cs = STATUS_BADGE[drug.status.ckd];
          return (
            <li key={`${drug.name}-${idx}`}>
              <Link
                href={`/drug?id=${idx}`}
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors active:bg-gray-700"
              >
                <span className="text-sm leading-snug flex-1 text-gray-200 min-w-0 truncate">
                  {drug.name}
                </span>
                <span className="flex gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${ds.className}`}
                    title="透析"
                  >
                    HD:{ds.label}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${cs.className}`}
                    title="CKD"
                  >
                    CKD:{cs.label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">該当する薬剤が見つかりません</p>
        </div>
      )}
    </>
  );
}
