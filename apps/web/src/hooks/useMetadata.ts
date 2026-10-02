'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import {
  PAGE_TITLES,
  SITE_DESCRIPTION,
  SITE_NAME,
} from '@moimi/core/constants/metadata';

function getPageTitle(pathname: string) {
  const matchedPath = Object.keys(PAGE_TITLES).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  return matchedPath ? PAGE_TITLES[matchedPath] : '';
}

export function useMetadata() {
  const pathname = usePathname();

  useEffect(() => {
    const title = getPageTitle(pathname);

    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [pathname]);

  useEffect(() => {
    const existingMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    if (existingMeta) {
      existingMeta.content = SITE_DESCRIPTION;
      return;
    }

    const meta = document.createElement('meta');

    meta.name = 'description';
    meta.content = SITE_DESCRIPTION;

    document.head.appendChild(meta);
  }, []);
}
