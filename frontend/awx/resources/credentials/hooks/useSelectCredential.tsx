import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog, useSelectDialog } from '../../../../../framework';
import { Credential } from '../../../interfaces/Credential';
import { useAwxView } from '../../../useAwxView';
import { useCredentialsColumns } from './useCredentialsColumns';
import { useCredentialsFilters } from './useCredentialsFilters';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';

export function useMultiSelectCredential(isLookup: boolean, credentialType?: number) {
  const { t } = useTranslation();
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns({ disableLinks: true });
  const columns = useMemo(
    () =>
      isLookup
        ? tableColumns.filter((item) => ['Name', 'Credential type'].includes(item.header))
        : tableColumns,
    [isLookup, tableColumns]
  );
  const view = useAwxView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns: columns,
    disableQueryString: true,
    ...(credentialType && {
      queryParams: {
        credential_type: credentialType.toString(),
      },
    }),
  });
  return useSelectDialog<Credential, true>({
    toolbarFilters,
    tableColumns: columns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}

export function useSingleSelectCredential(credentialType?: number, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectCredential = useCallback(
    (onSelect: (credential: Credential) => void) => {
      setDialog(
        <SelectCredential
          title={t(title ? title : 'Select credential')}
          onSelect={onSelect}
          credentialType={credentialType}
        />
      );
    },
    [credentialType, setDialog, t, title]
  );
  return openSelectCredential;
}

function SelectCredential(props: {
  title: string;
  onSelect: (organization: Credential) => void;
  defaultCredential?: Credential;
  credentialType?: number;
}) {
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns({ disableLinks: true });
  const view = useAwxView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns: tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultCredential ? [props.defaultCredential] : undefined,
    ...(props.credentialType && {
      queryParams: {
        credential_type: props.credentialType.toString(),
      },
    }),
  });
  return (
    <SelectSingleDialog<Credential>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
