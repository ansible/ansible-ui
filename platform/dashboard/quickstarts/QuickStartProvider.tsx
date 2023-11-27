// this is a react context provider for the quickstarts

import { AllQuickStartStates, QuickStart, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, createContext, useContext, useState } from 'react';
import FindingContent from './finding-content.json';

export interface IQuickStarts {
  quickStarts: IPlatformQuickStart[];
  setActiveQuickStartID: (id: string) => void;
}

const QuickStartContext = createContext<IQuickStarts>({
  quickStarts: [],
  setActiveQuickStartID: () => {},
});

export const useQuickStarts = () => useContext(QuickStartContext);

export function QuickStartProvider(props: { children: ReactNode }) {
  const [activeQuickStartID, setActiveQuickStartID] = useState('add-healthchecks');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});

  return (
    <QuickStartContext.Provider value={{ quickStarts, setActiveQuickStartID }}>
      <QuickStartContainer
        quickStarts={quickStarts}
        activeQuickStartID={activeQuickStartID}
        setActiveQuickStartID={setActiveQuickStartID}
        allQuickStartStates={allQuickStartStates}
        setAllQuickStartStates={setAllQuickStartStates}
      >
        {props.children}
      </QuickStartContainer>
    </QuickStartContext.Provider>
  );
}

export const quickStarts: IPlatformQuickStart[] = [FindingContent];

export interface IPlatformQuickStart extends QuickStart {
  subtitle: string;
}
