'use client';

import { useEffect, type ReactNode } from 'react';

export default function InfoPostLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    return () => {
      window.setTimeout(() => {
        if (!window.location.pathname.startsWith('/infoPost')) {
          sessionStorage.removeItem('infoPost:list');
        }
      }, 0);
    };
  }, []);

  return children;
}
