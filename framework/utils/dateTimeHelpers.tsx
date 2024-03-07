import { DateTime, Duration } from 'luxon';

export function formatDateString(dateObj: string, tz?: string) {
  return tz !== null
    ? DateTime.fromISO(dateObj, { zone: tz }).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
    : DateTime.fromISO(dateObj).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
}

export function dateToInputDateTime(dt: string, tz?: string | null) {
  let dateTime;
  if (tz) {
    dateTime = DateTime.fromISO(dt, { zone: tz });
  } else {
    dateTime = DateTime.fromISO(dt);
  }
  return [dateTime.toFormat('yyyy-LL-dd'), dateTime.toFormat('h:mm a')];
}
export function secondsToHHMMSS(seconds: number): string {
  return Duration.fromObject({ seconds }).toFormat('hh:mm:ss');
}
