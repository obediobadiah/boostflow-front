'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketersRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect from old marketers page to new users page
    router.replace('/users');
  }, [router]);
  
  return (
    <div className="container mx-auto py-6 text-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
} 