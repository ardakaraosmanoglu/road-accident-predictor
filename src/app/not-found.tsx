import Link from "next/link";

import { routing } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Sayfa bulunamadı</h1>
        <p className="text-gray-500">Ana sayfaya dönün.</p>
        <Link
          href={`/${routing.defaultLocale}`}
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-blue-700"
        >
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
