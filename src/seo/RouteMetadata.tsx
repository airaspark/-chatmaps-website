import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageMetadata } from './pageMetadata';

/** Keeps document metadata aligned with the current client-side route. */
export const RouteMetadata = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageMetadata(pathname);
  }, [pathname]);

  return null;
};
