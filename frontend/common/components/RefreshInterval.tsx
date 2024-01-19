import { Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { ReactNode, createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRConfig } from 'swr';
import { PageSingleSelect } from '../../../framework/PageInputs/PageSingleSelect';
import { PageRefreshIcon } from '../PageRefreshIcon';

export function RefreshInterval() {
  const { t } = useTranslation();
  return (
    <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsXs' }}>
      <FlexItem>
        <Tooltip content={t('Refresh')}>
          <PageRefreshIcon />
        </Tooltip>
      </FlexItem>
      <FlexItem>
        <RefreshIntervalSelect />
      </FlexItem>
    </Flex>
  );
}

export function RefreshIntervalSelect() {
  const { t } = useTranslation();
  const [interval, setInterval] = useRefreshInterval();
  return (
    <Tooltip content={t('Refresh interval')}>
      <PageSingleSelect
        placeholder={t('Select interval')}
        value={interval}
        onSelect={(value) => setInterval(value)}
        options={[
          { label: t('1 second'), value: 1 },
          { label: t('5 seconds'), value: 5 },
          { label: t('10 seconds'), value: 10 },
          { label: t('30 seconds'), value: 30 },
          { label: t('1 minute'), value: 60 },
          { label: t('5 minutes'), value: 300 },
          { label: t('10 minutes'), value: 600 },
          { label: t('30 minutes'), value: 1800 },
          { label: t('1 hour'), value: 3600 },
          { label: t('Never'), value: 0 },
        ]}
      />
    </Tooltip>
  );
}

const RefreshIntervalContext = createContext<[number, (interval: number) => void]>([
  60,
  () => {
    throw new Error('RefreshIntervalContext not implemented');
  },
]);

export function useRefreshInterval() {
  return useContext(RefreshIntervalContext);
}

export function RefreshIntervalProvider(props: { children: ReactNode; default?: number }) {
  const state = useState(props.default ?? 60);
  return (
    <SWRConfig value={{ refreshInterval: state[0] * 1000 }}>
      <RefreshIntervalContext.Provider value={state}>
        {props.children}
      </RefreshIntervalContext.Provider>
    </SWRConfig>
  );
}
