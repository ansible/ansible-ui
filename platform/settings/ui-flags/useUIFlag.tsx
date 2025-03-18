import { IUIFlag } from './IUIFlag';
import { useUIFlags } from './useUIFlags';

export function useUIFlag(id: string): IUIFlag | undefined {
  const { flags } = useUIFlags();
  return flags.find((flag) => flag.id === id);
}
