'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/orders');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#22C55E" />
          <path d="M18 9v18M9 18h18" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    </div>
  );
}