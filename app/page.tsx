"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import drugsData from "../data/drugs-enriched.json";

type Drug = { name: string; primaryName: string; url: string; group: string; detail?: Record<string, string> | null };

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("全て");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const drugs = drugsData as Drug[];

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
    <div className="flex flex-col min-h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-3 sticky top-0 z-10 shadow-md border-b border-gray-700">
        <h1 className="text-lg font-bold">腎機能別 薬剤用量検索</h1>
        <p className="text-gray-400 text-xs mt-0.5">
          PMDA添付文書から腎機能別の用法用量をすばやく確認
        </p>
      </header>

      {/* Search */}
      <div className="sticky top-[52px] z-10 bg-gray-900 px-4 pt-3 pb-2 shadow-sm border-b border-gray-800">
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

      {/* Results */}
      <main className="flex-1 px-4 py-2">
        <p className="text-xs text-gray-500 mb-2">
          {filtered.length} 件の薬剤
        </p>
        <ul className="space-y-1">
          {filtered.map((drug) => {
            const idx = drugs.indexOf(drug);
            const hasCkd = drug.detail?.ckd;
            const hasDialysis = drug.detail?.dialysis;
            return (
              <li key={`${drug.primaryName}-${idx}`}>
                <Link
                  href={`/drug?id=${idx}`}
                  className="flex items-center justify-between px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-colors active:bg-gray-700"
                >
                  <span className="text-sm leading-snug flex-1 text-gray-200">
                    {drug.name}
                  </span>
                  <span className="flex gap-1 ml-2 flex-shrink-0">
                    {hasDialysis && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">
                        HD
                      </span>
                    )}
                    {hasCkd && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-300">
                        CKD
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">該当する薬剤が見つかりません</p>
            <p className="text-sm mt-1">検索条件を変更してください</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-4 mt-4">
        <div className="space-y-3 text-xs text-gray-400">
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="font-semibold text-gray-300 hover:text-blue-400 flex items-center gap-1"
          >
            <span>{showDisclaimer ? "▼" : "▶"}</span>
            免責事項・データソース
          </button>
          {showDisclaimer && (
            <div className="space-y-3">
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 space-y-2">
                <p className="font-semibold text-gray-200">免責事項</p>
                <p>
                  本アプリは、医療従事者が腎機能に応じた薬剤投与量を迅速に参照するための補助ツールです。
                </p>
                <p>
                  薬剤名タップ時はPMDA（医薬品医療機器総合機構）の添付文書検索へ遷移します。
                  <strong className="text-gray-200">
                    情報の正確性・完全性を保証するものではありません。
                  </strong>
                </p>
                <p>
                  実際の処方にあたっては、必ず最新の添付文書・ガイドライン・各施設の基準に基づいてご判断ください。
                  本アプリの利用により生じたいかなる損害についても、開発者は責任を負いかねます。
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-2">
                <p className="font-semibold text-gray-200">データソース</p>
                <p>
                  添付文書情報：
                  <a
                    href="https://www.pmda.go.jp/PmdaSearch/iyakuSearch/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    PMDA 医薬品医療機器総合機構 添付文書等情報検索
                  </a>
                </p>
                <p className="text-[11px] leading-relaxed">
                  腎機能別投与量の主要参考文献：Aronoff GR, et al: Drug
                  Prescribing in Renal Failure, 5th ed. ACP, 2007 / Bennett WM:
                  Clin Pharmacokinet 15: 326-354, 1988 / 乾賢一 他編:
                  腎機能別薬剤使用マニュアル, じほう, 1999 / Larry K. Golightly,
                  et al: Renal Pharmacotherapy, Springer, 2013
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-gray-500 pt-2">
            最終データ更新日: 2025年5月
          </p>
        </div>
      </footer>
    </div>
  );
}
