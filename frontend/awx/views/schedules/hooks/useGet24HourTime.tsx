import { useCallback } from 'react';

export function useGet24HourTime() {
  return useCallback((time: string): { hour: number; minute: number } => {
    const [hour, minute] = time.split(':');
    const isPM = time.includes('PM');

    return {
      hour: isPM ? parseInt(hour, 10) + 12 : parseInt(`${hour}`, 10),
      minute: parseInt(minute, 10),
    };
  }, []);
}
