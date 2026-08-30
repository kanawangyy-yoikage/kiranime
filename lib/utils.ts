// lib/utils.ts
// Utility class-name joiner (dependency-free `cn`).
// Tolerates falsy values, flattens arrays, and de-duplicates identical classes.

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  const seen = new Set<string>()
  const out: string[] = []

  const flatten = (list: ClassValue[]): void => {
    for (const item of list) {
      if (!item && item !== 0) continue
      if (Array.isArray(item)) {
        flatten(item as ClassValue[])
      } else if (typeof item === 'string' && item.trim()) {
        for (const cls of item.split(/\s+/)) {
          if (cls && !seen.has(cls)) {
            seen.add(cls)
            out.push(cls)
          }
        }
      }
    }
  }

  flatten(inputs)
  return out.join(' ')
}