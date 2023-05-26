import { useMemo } from 'react';
import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageToolbarFilters } from '../../../../../framework/PageTable/PageToolbarFilter';
import { IToolbarFilter } from '../../../../../framework';
import { Job } from '../../../interfaces/Job';

export function JobOutputToolbar(props: { job: Job }) {
  const { job } = props;
  const toolbarFilters = useOutputFilters();

  return (
    <Toolbar>
      <ToolbarContent>
        <PageToolbarFilters
          toolbarFilters={toolbarFilters}
          // filters={filters}
          // setFilters={setFilters}
        />
      </ToolbarContent>
    </Toolbar>
  );
}

function useOutputFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'stdout',
        label: t('the label'),
        type: 'string',
        query: 'stdout__icontains',
        placeholder: t('Filter by keyword'),
      },
    ],
    [t]
  );
}
