import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(date: string | Date) {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date) {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, 'MMM d, yyyy h:mm a')
}

export function formatRelative(date: string | Date) {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsed, { addSuffix: true })
}
