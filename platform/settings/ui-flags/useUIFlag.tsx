import { IUIFlag, UIFlag } from './IUIFlag';
import { useUIFlags } from './useUIFlags';

export function useUIFlag(id: UIFlag): IUIFlag | undefined {
  const { flags } = useUIFlags();
  return flags.find((flag) => flag.id === id);
}
