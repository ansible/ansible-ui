import { QuickStart } from '@patternfly/quickstarts';
import { useMemo } from 'react';
import { useHasHubService } from '../../main/GatewayServices';
import { useFindingContentQuickStart } from './useFindingContentQuickStart';

export function useQuickStarts() {
  const hubService = useHasHubService();
  const findingContentQuickStart: QuickStart | undefined = useFindingContentQuickStart();
  const quickStarts = useMemo<QuickStart[]>(() => {
    const quickStarts: QuickStart[] = [];
    if (hubService) {
      quickStarts.push(findingContentQuickStart);
    }
    return quickStarts;
  }, [findingContentQuickStart, hubService]);
  return quickStarts;
}
