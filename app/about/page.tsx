import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-3 sticky top-0 z-10 border-b border-gray-700">
        <Link href="/" className="text-blue-400 text-sm">
          ← 一覧に戻る
        </Link>
        <h1 className="text-base font-bold mt-1">製作者について</h1>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Profile */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-bold text-gray-100">Dr. いわたつ</h2>
          <p className="text-sm text-blue-400 mt-1">
            糖尿病・内分泌 専門医・指導医
          </p>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            糖尿病・内分泌内科の専門医として臨床に従事しながら、医療現場で本当に使えるツールを自ら開発しています。
          </p>
        </div>

        {/* Apps */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-300">開発アプリ</h3>
          <a
            href="https://insulin-calculator-tau.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <p className="text-sm font-medium text-gray-200">InsuCalc</p>
            <p className="text-xs text-gray-400">
              インスリン量計算ツール
            </p>
          </a>
          <a
            href="https://t1life.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <p className="text-sm font-medium text-gray-200">T1Life</p>
            <p className="text-xs text-gray-400">
              1型糖尿病の生活サポートアプリ
            </p>
          </a>
        </div>

        {/* SNS */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-300">SNS</h3>
          <div className="space-y-2">
            <a
              href="https://www.instagram.com/dr.iwatatsu/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <span className="text-sm text-gray-200">Instagram</span>
              <span className="text-xs text-gray-400">@dr.iwatatsu</span>
            </a>
            <a
              href="https://x.com/dr_iwatatsu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <span className="text-sm text-gray-200">X (Twitter)</span>
              <span className="text-xs text-gray-400">@dr_iwatatsu</span>
            </a>
            <a
              href="https://note.com/dr_iwatatsu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <span className="text-sm text-gray-200">note</span>
              <span className="text-xs text-gray-400">dr_iwatatsu</span>
            </a>
          </div>
        </div>

        {/* Message */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-2">
            このアプリについて
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            腎機能に応じた薬剤投与量の確認は、忙しい臨床現場で意外と手間がかかります。このアプリは、必要な情報に最速でたどり着くことを目指して作りました。
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mt-2">
            ご意見・ご要望・掲載薬の追加リクエストなどがあれば、SNSからお気軽にご連絡ください。
          </p>
        </div>
      </main>
    </div>
  );
}
