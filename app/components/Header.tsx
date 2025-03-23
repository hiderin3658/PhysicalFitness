'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            体力測定アプリ
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              {/* ユーザー一覧リンクを削除 */}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
