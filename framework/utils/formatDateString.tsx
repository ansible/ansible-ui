// TODO: Import/adapt this from AWX using the new transaltion library

export function formatDateString(dateObj: string | Date | undefined): string {
  if (!dateObj) {
    return '';
  }

  if (typeof dateObj === 'string') {
    dateObj = new Date(dateObj);
  }
  return dateObj.toLocaleString();
}
