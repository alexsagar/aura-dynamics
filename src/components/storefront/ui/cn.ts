/** Joins conditional class names. ponytail: no clsx dependency for six lines. */
export function cn(...parts: Array<false | null | string | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
