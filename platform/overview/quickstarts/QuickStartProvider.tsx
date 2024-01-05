import { AllQuickStartStates, QuickStart, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, useMemo, useState } from 'react';
import { useFindingContentQuickStart } from './useFindingContentQuickStart';

export function QuickStartProvider(props: { children: ReactNode }) {
  const [activeQuickStartID, setActiveQuickStartID] = useState('');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});
  const findingContentQuickStart = useFindingContentQuickStart();
  const quickStarts = useMemo<QuickStart[]>(
    () => [findingContentQuickStart],
    [findingContentQuickStart]
  );
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
