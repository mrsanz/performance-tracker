import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with conflict resolution
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 * @example
 * ```typescript
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-4 wins)
 * cn('text-red-500', { 'text-blue-500': isBlue }) // Conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
