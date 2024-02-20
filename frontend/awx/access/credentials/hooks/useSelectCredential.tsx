import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog, useSelectDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsColumns } from './useCredentialsColumns';
import { useCredentialsFilters } from './useCredentialsFilters';

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
    url: awxAPI`/credentials/`,
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

export function useSingleSelectCredential(
  credentialType?: number,
  title?: string,
  sourceType?: string
) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectCredential = useCallback(
    (onSelect: (credential: Credential) => void) => {
      setDialog(
        <SelectCredential
          title={t(title ? title : 'Select credential')}
          onSelect={onSelect}
          credentialType={credentialType}
          sourceType={sourceType}
        />
      );
    },
    [credentialType, setDialog, t, title, sourceType]
  );
  return openSelectCredential;
}

function SelectCredential(props: {
  title: string;
  onSelect: (organization: Credential) => void;
  defaultCredential?: Credential;
  credentialType?: number;
  sourceType?: string;
}) {
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns({ disableLinks: true });
  const view = useAwxView<Credential>({
    url: awxAPI`/credentials/`,
    toolbarFilters,
    tableColumns: tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultCredential ? [props.defaultCredential] : undefined,
    ...(props.credentialType && {
      queryParams: {
        credential_type: props.credentialType.toString(),
      },
    }),
    ...(props.sourceType === 'scm'
      ? {
          queryParams: {
            credential_type__kind: 'cloud',
          },
        }
      : {
          queryParams: {
            credential_type__namespace: props.sourceType as string,
          },
        }),
  });
  return (
    <SingleSelectDialog<Credential>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
