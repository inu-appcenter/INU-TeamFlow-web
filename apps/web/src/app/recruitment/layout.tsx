'use client';

import { useEffect, type ReactNode } from 'react';

export default function RecruitmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    return () => {
      window.setTimeout(() => {
        const path = window.location.pathname;
        const isRecruitmentPage =
          path === '/recruitment' || path.startsWith('/recruitment/');

        if (!isRecruitmentPage) {
          sessionStorage.removeItem('recruitment:list');
        }
      }, 0);
    };
  }, []);

  return children;
}
