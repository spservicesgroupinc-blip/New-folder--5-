import { useEffect } from 'react';

/**
 * Locks / unlocks `document.body` scroll.  Restores the previous
 * `overflow` value when `locked` becomes `false` or the component unmounts.
 */
function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}

export default useScrollLock;
