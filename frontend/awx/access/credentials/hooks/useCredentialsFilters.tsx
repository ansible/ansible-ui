import { useDynamicToolbarFilters } from '../../common/useDynamicFilters';
import { Credential } from '../../../interfaces/Credential';

export function useCredentialsFilters() {
  const toolBarFilters = useDynamicToolbarFilters<Credential>({
    optionsPath: 'credentials',
    preSortedKeys: ['name'],
    preFilledValueKeys: ['name'],
  });

  return toolBarFilters;
}
