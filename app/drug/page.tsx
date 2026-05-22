"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import drugsData from "../../data/drugs-final.json";

type Drug = (typeof drugsData)[number];

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  contraindicated: {
    label: "禁忌",
    className: "bg-red-900/40 border-red-700/60 text-red-200",
    icon: "✕",
  },
  reduce: {
    label: "減量が必要",
    className: "bg-yellow-900/40 border-yellow-700/60 text-yellow-200",
    icon: "▼",
  },
  normal: {
    label: "常用量でOK",
    className: "bg-green-900/40 border-green-700/60 text-green-200",
    icon: "○",
  },
  caution: {
    label: "注意して投与",
    className: "bg-orange-900/40 border-orange-700/60 text-orange-200",
    icon: "△",
  },
  unknown: {
    label: "データなし",
    className: "bg-gray-800 border-gray-700 text-gray-400",
    icon: "—",
  },
};

function StatusCard({ title, status, detail }: { title: string; status: string; detail: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  return (
    <div className={`rounded-lg border p-4 ${config.className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className="text-xs text-gray-400">{title}</span>
        <span className="font-bold text-sm">{config.label}</span>
      </div>
      {detail && (
        <p className="text-sm leading-relaxed opacity-90">{detail}</p>
      )}
    </div>
  );
}

function DrugDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const drugs = drugsData as Drug[];
  const drug = id ? drugs[parseInt(id)] : null;

  if (!drug) {
    return (
      <div className="flex flex-col min-h-full bg-gray-900 text-gray-100">
        <header className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <Link href="/" className="text-blue-400 text-sm">← 戻る</Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">薬剤が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-3 sticky top-0 z-10 border-b border-gray-700">
        <Link href="/" className="text-blue-400 text-sm">← 一覧に戻る</Link>
        <h1 className="text-base font-bold mt-1">{drug.name}</h1>
        {drug.genericName && (
          <p className="text-xs text-gray-400 mt-0.5">{drug.genericName}</p>
        )}
      </header>

      {/* Status Cards */}
      <main className="flex-1 px-4 py-3 space-y-3">
        <StatusCard
          title="透析患者（HD）"
          status={drug.status.dialysis}
          detail={drug.dialysis}
        />
        <StatusCard
          title="保存期CKD患者"
          status={drug.status.ckd}
          detail={drug.ckd}
        />

        {/* Additional Info */}
        <div className="space-y-1 mt-4">
          {drug.normalDose && (
            <div className="px-4 py-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">常用量</p>
              <p className="text-sm text-gray-200">{drug.normalDose}</p>
            </div>
          )}
          {drug.usage && (
            <div className="px-4 py-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">用法</p>
              <p className="text-sm text-gray-200">{drug.usage}</p>
            </div>
          )}
          {drug.dialysability && (
            <div className="px-4 py-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">透析性</p>
              <p className="text-sm text-gray-200">{drug.dialysability}</p>
            </div>
          )}
          {drug.features && (
            <div className="px-4 py-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">特徴</p>
              <p className="text-sm text-gray-200">{drug.features}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        <p className="text-[11px] text-gray-500 text-center">
          出典：PMDA添付文書情報等を基に作成。実際の処方は最新の添付文書を確認してください。
        </p>
      </footer>
    </div>
  );
}

export default function DrugPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-400">
          読み込み中...
        </div>
      }
    >
      <DrugDetailContent />
    </Suspense>
  );
}
