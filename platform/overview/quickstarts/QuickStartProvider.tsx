import { AllQuickStartStates, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, useState } from 'react';
import { useQuickStarts } from './useQuickStarts';

export function QuickStartProvider(props: { children: ReactNode }) {
  const [activeQuickStartID, setActiveQuickStartID] = useState('');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});
  const quickStarts = useQuickStarts();
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
