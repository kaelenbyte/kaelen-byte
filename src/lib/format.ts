export const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const delta = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (delta < minute) {
    return 'now'
  }
  if (delta < hour) {
    const value = Math.max(1, Math.round(delta / minute))
    return `${value}m`
  }
  if (delta < day) {
    const value = Math.max(1, Math.round(delta / hour))
    return `${value}h`
  }
  if (delta < week) {
    const value = Math.max(1, Math.round(delta / day))
    return `${value}d`
  }
  if (delta < month) {
    const value = Math.max(1, Math.round(delta / week))
    return `${value}w`
  }
  if (delta < year) {
    const value = Math.max(1, Math.round(delta / month))
    return `${value}mo`
  }
  const value = Math.max(1, Math.round(delta / year))
  return `${value}y`
}

export const formatExactTime = (isoDate: string): string => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleString()
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}
