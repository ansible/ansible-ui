import { AllQuickStartStates, QuickStart, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, useMemo, useState } from 'react';
import ExampleQuickStart from './Example.json';

export function QuickStartProvider(props: { children: ReactNode }) {
  const [activeQuickStartID, setActiveQuickStartID] = useState('');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});
  const quickStarts = useMemo<QuickStart[]>(() => [ExampleQuickStart as QuickStart], []);
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
