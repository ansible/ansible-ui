import { AllQuickStartStates, QuickStart, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, useMemo, useState } from 'react';
import { useHubService } from '../../main/GatewayServices';
import { useFindingContentQuickStart } from './useFindingContentQuickStart';

export function QuickStartProvider(props: { children: ReactNode }) {
  // const awxService = useAwxService();
  // const edaService = useEdaService();
  const hubService = useHubService();

  const [activeQuickStartID, setActiveQuickStartID] = useState('');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});
  const findingContentQuickStart: QuickStart | undefined = useFindingContentQuickStart();
  const quickStarts = useMemo<QuickStart[]>(() => {
    const quickStarts: QuickStart[] = [];
    if (hubService) {
      quickStarts.push(findingContentQuickStart);
    }
    return quickStarts;
  }, [findingContentQuickStart, hubService]);
  return (
    <QuickStartContainer
      quickStarts={quickStarts}
      activeQuickStartID={activeQuickStartID}
      setActiveQuickStartID={setActiveQuickStartID}
      allQuickStartStates={allQuickStartStates}
      setAllQuickStartStates={setAllQuickStartStates}
    >
      {props.children}
    </QuickStartContainer>
  );
}
