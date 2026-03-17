import { useState, useEffect } from 'react';

/**
 * Returns `true` while the given CSS media query matches, updating whenever
 * the viewport changes.
 *
 * @example
 *   const isMobile = useMediaQuery('(max-width: 767px)');
 */
function useMediaQuery(query: string): boolean {
  const getMatches = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Align with current value in case the query changed between render and
    // this effect running.
    setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
