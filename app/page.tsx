"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import drugsData from "../data/drugs-final.json";
import DrugList from "./components/DrugList";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Drug = any;

const TABS = [
  { key: "oral", label: "内服薬", route: "oral" },
  { key: "injection", label: "注射薬", route: "injection" },
  { key: "external", label: "外用薬", route: "external" },
] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("oral");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const allDrugs = drugsData as Drug[];
  const filtered = allDrugs.filter((d) => d.routes.includes(activeTab));

  return (
    <div className="flex flex-col min-h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-3 sticky top-0 z-10 shadow-md border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon-192.png"
              alt="KidneyRx"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-lg font-bold">KidneyRx</h1>
          </div>
          <Link href="/about" className="text-xs text-gray-400 hover:text-blue-400">
            製作者
          </Link>
        </div>

        {/* Route Tabs */}
        <div className="flex gap-1 mt-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.route)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.route
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Drug List */}
      <main className="flex-1">
        <DrugList drugs={filtered} allDrugs={allDrugs} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="space-y-3 text-xs text-gray-400">
          {/* Status legend */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50">
              禁忌
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-900/60 text-yellow-300 border border-yellow-700/50">
              減量
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-900/60 text-orange-300 border border-orange-700/50">
              注意
            </span>
            <span className="px-2 py-0.5 rounded bg-green-900/60 text-green-300 border border-green-700/50">
              常用量
            </span>
          </div>

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
                  主要参考文献：Aronoff GR, et al: Drug Prescribing in Renal
                  Failure, 5th ed. ACP, 2007 / 日本腎臓病薬物療法学会:
                  腎機能別薬剤投与量 POCKET BOOK / 乾賢一 他編:
                  腎機能別薬剤使用マニュアル
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center pt-2">
            <span className="text-gray-500">最終更新: 2025年5月</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
