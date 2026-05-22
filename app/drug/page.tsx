"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import drugsData from "../../data/drugs-enriched.json";

type DrugDetail = {
  normalDose?: string;
  usage?: string;
  dialysis?: string;
  ckd?: string;
  otherReports?: string;
  features?: string;
  sideEffects?: string;
  monitoring?: string;
  dialysability?: string;
  importance?: string;
  unit?: string;
  genericName?: string;
};

type Drug = {
  name: string;
  primaryName: string;
  group: string;
  detail: DrugDetail | null;
  pdfId?: string;
};

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 border-b border-gray-700 ${highlight ? "bg-blue-900/30" : ""}`}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-sm leading-relaxed ${highlight ? "text-blue-200 font-medium" : "text-gray-200"}`}>
        {value}
      </p>
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
          <Link href="/" className="text-blue-400 text-sm">
            ← 戻る
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">薬剤が見つかりません</p>
        </div>
      </div>
    );
  }

  const detail = drug.detail;

  return (
    <div className="flex flex-col min-h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-3 sticky top-0 z-10 border-b border-gray-700">
        <Link href="/" className="text-blue-400 text-sm">
          ← 一覧に戻る
        </Link>
        <h1 className="text-base font-bold mt-1">{drug.name}</h1>
        {detail?.genericName && (
          <p className="text-xs text-gray-400 mt-0.5">{detail.genericName}</p>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        {detail ? (
          <div>
            {/* Key renal dosing info - highlighted */}
            {detail.dialysis && (
              <InfoRow
                label="透析患者への投与方法"
                value={detail.dialysis}
                highlight
              />
            )}
            {detail.ckd && (
              <InfoRow
                label="保存期CKD患者への投与方法"
                value={detail.ckd}
                highlight
              />
            )}

            {/* Standard dosing */}
            {detail.normalDose && (
              <InfoRow label="常用量" value={detail.normalDose} />
            )}
            {detail.usage && <InfoRow label="用法" value={detail.usage} />}
            {detail.unit && <InfoRow label="規格" value={detail.unit} />}

            {/* Additional info */}
            {detail.dialysability && (
              <InfoRow label="透析性" value={detail.dialysability} />
            )}
            {detail.otherReports && (
              <InfoRow label="その他の報告" value={detail.otherReports} />
            )}
            {detail.features && (
              <InfoRow label="特徴" value={detail.features} />
            )}
            {detail.monitoring && (
              <InfoRow
                label="モニターすべき項目"
                value={detail.monitoring}
              />
            )}
            {detail.sideEffects && (
              <InfoRow label="主な副作用" value={detail.sideEffects} />
            )}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>この薬剤の詳細データはありません</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        <p className="text-[11px] text-gray-500 text-center">
          出典：PMDA添付文書情報を基に作成。実際の処方は最新の添付文書を確認してください。
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
