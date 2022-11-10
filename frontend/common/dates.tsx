import { DateTime } from 'luxon'

export function formatDateString(dateObj: string, tz = null) {
  if (dateObj === null) {
    return undefined
  }

  return tz !== null
    ? DateTime.fromISO(dateObj, { zone: tz }).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
    : DateTime.fromISO(dateObj).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
}
