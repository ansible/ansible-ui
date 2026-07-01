import { AllQuickStartStates, QuickStartContainer } from '@patternfly/quickstarts';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuickStarts } from './useQuickStarts';

export function QuickStartProvider(props: Readonly<{ children: ReactNode }>) {
  const { t, i18n } = useTranslation();
  const [activeQuickStartID, setActiveQuickStartID] = useState('');
  const [allQuickStartStates, setAllQuickStartStates] = useState<AllQuickStartStates>({});
  const quickStarts = useQuickStarts();

  const resourceBundle = {
    Start: t('Start'),
    Continue: t('Continue'),
    Restart: t('Restart'),
    Close: t('Close'),
    'View all quick starts': t('View all quick starts'),
    '{{count}} item': t('{{count}} item'),
    '{{count}} item_plural': t('{{count}} items'),
  };

  return (
    <QuickStartContainer
      quickStarts={quickStarts}
      activeQuickStartID={activeQuickStartID}
      setActiveQuickStartID={setActiveQuickStartID}
      allQuickStartStates={allQuickStartStates}
      setAllQuickStartStates={setAllQuickStartStates}
      resourceBundle={resourceBundle}
      language={i18n.language || 'en'}
    >
      {props.children}
    </QuickStartContainer>
  );
}
