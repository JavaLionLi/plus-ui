import { history, useLocation } from '@umijs/max';
import { useEffect } from 'react';

export default function RedirectPage() {
  const location = useLocation();

  useEffect(() => {
    const target = location.pathname.replace(/^\/redirect\/?/, '/');
    history.replace(`${target || '/'}${location.search || ''}`);
  }, [location.pathname, location.search]);

  return null;
}
