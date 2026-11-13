import { DateTime } from 'luxon';
import { useCallback } from 'react';

export function useGet24HourTime() {
  return useCallback((time: string): { hour: number; minute: number } => {
    const trimmed = time.trim();
    const parsed = DateTime.fromFormat(trimmed, 'h:mm a');
    if (!parsed.isValid) {
      const exampleTime = trimmed || '3:15';
      throw new Error(
        `Start time must include AM or PM (for example, ${exampleTime} AM or ${exampleTime} PM).`
      );
    }
    return { hour: parsed.hour, minute: parsed.minute };
  }, []);
}
