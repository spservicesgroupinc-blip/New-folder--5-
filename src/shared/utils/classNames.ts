/**
 * classNames.ts
 *
 * Minimal class-name joiner with no external dependencies.
 * Falsy values (false, null, undefined, '') are filtered out automatically.
 *
 * @example cn('base', isActive && 'active', undefined)  // "base active"
 */
export function cn(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(' ');
}
