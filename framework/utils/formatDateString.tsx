// TODO: Import/adapt this from AWX using the new transaltion library

export function formatDateString(dateObj: string | Date): string {
  if (typeof dateObj === 'string') {
    dateObj = new Date(dateObj);
  }
  return dateObj.toLocaleString();
}
