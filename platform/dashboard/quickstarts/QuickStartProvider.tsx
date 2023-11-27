import { AllQuickStartStates, QuickStart, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { PlatformQuickStart } from './PlatformQuickStart';
import { useFindingContent } from './useFindingContent';

interface IQuickStartContext {
  platformQuickStarts: PlatformQuickStart[];
  quickStarts: QuickStart[];
  setActiveQuickStartID: (id: string) => void;
}

const QuickStartContext = createContext<IQuickStartContext>({
  platformQuickStarts: [],
  quickStarts: [],
  setActiveQuickStartID: () => {},
});

export const useQuickStarts = () => useContext(QuickStartContext);

export function QuickStartProvider(props: { children: ReactNode }) {
  const [activeQuickStartID, setActiveQuickStartID] = useState('');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});

  const findingContent = useFindingContent();
  const platformQuickStarts = useMemo(() => [findingContent], [findingContent]);
  const quickStarts = useMemo(
    () => platformQuickStarts.map(convertQuickStart),
    [platformQuickStarts]
  );
  const value = useMemo(
    () => ({ platformQuickStarts, quickStarts, setActiveQuickStartID }),
    [platformQuickStarts, quickStarts]
  );

  return (
    <QuickStartContext.Provider value={value}>
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

function convertQuickStart(quickStart: PlatformQuickStart): QuickStart {
  return {
    metadata: {
      name: quickStart.id,
    },
    spec: {
      icon: '',
      displayName: quickStart.name,
      description: quickStart.description,
      durationMinutes: quickStart.durationMinutes,
      prerequisites: quickStart.prerequisites,
      introduction: quickStart.introduction,
      conclusion: quickStart.conclusion,
      tasks: quickStart.tasks.map((task) => ({
        ...task,
        id: task.title,
        title: task.title,
        description: [
          '###' + task.description,
          ...task.actions.map((a, i) => `${i + 1}. ${a}`),
        ].join('\n'),
        review: {
          instructions: [task.review.question].join('\n'),
        },
      })),
    },
  };
}
