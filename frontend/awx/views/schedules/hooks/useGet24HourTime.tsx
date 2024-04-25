import { DateTime } from 'luxon';
import { useCallback } from 'react';

export function useGet24HourTime() {
  return useCallback((time: string): { hour: number; minute: number } => {
    return {
      hour: DateTime.fromFormat(time, 'h:mm a').hour,
      minute: DateTime.fromFormat(time, 'h:mm a').minute,
    };
  }, []);
}
