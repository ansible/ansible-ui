
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { SelectSingleDialog } from '../../../../framework/PageDialogs/SelectSingleDialog';

import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';
import { usePulpView } from '../../usePulpView';

export interface Repository
{
    name : string,
    description : string,
}

function SelectRepository(props: {
    title: string;
    onSelect: (repository: Repository) => void;
    defaultRepository?: Repository;
  }) {
    const toolbarFilters = useOrganizationsFilters();
    const tableColumns = useOrganizationsColumns({ disableLinks: true });
    const view = usePulpView<Repository>({
      url: '/api/v2/organizations/',
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      keyFn : (item) => item.name,
    });
    return (
      <SelectSingleDialog<Repository>
        {...props}
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        view={view}
      />
    );
  }
  
  export function useSelectRepository() {
    const [_, setDialog] = usePageDialog();
    const { t } = useTranslation();
    const onSelectRepository = useCallback(
      (onSelect: (repository: Repository) => void, defaultRepository: Repository) => {
        setDialog(
          <SelectRepository
            title={t('Select organization')}
            onSelect={onSelect}
            defaultRepository={defaultRepository}
          />
        );
      },
      [setDialog, t]
    );
    return onSelectRepository;
  }