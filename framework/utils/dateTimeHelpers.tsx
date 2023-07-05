import { DateTime } from 'luxon';

export function formatDateString(dateObj: string | Date): string {
  if (typeof dateObj === 'string') {
    dateObj = new Date(dateObj);
  }
  return dateObj.toLocaleString();
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
