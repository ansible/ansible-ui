import React from 'react';
import { Tab, TabTitleText } from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { getPersistentFilters } from './PersistentFilters';

export function PageBackTab(props: {
  label: React.ReactNode;
  url: string;
  persistentFilterKey?: string;
  eventKey?: number;
}) {
  const { label, url, persistentFilterKey, eventKey } = props;
  const qs = getPersistentFilters(persistentFilterKey);

  return (
    <Tab
      title={
        <TabTitleText>
          <CaretLeftIcon />
          {label}
        </TabTitleText>
      }
      href={`${url}${qs}`}
      eventKey={eventKey ?? 99}
    />
  );
}
