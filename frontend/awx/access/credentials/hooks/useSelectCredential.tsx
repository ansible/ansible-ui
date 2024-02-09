import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelectDialog, usePageDialog } from '../../../../../framework';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsColumns } from './useCredentialsColumns';
import { useCredentialsFilters } from './useCredentialsFilters';

export function useMultiSelectCredential(credentialType?: number, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectCredential = useCallback(
    (onSelect: (credentials: Credential[]) => void) => {
      setDialog(
        <MultiSelectCredential
          title={t(title ? title : 'Select credentials')}
          onSelect={onSelect}
          credentialType={credentialType}
        />
      );
    },
    [credentialType, setDialog, t, title]
  );
  return openSelectCredential;
}

function MultiSelectCredential(props: {
  title: string;
  onSelect: (credentials: Credential[]) => void;
  defaultCredential?: Credential;
  credentialType?: number;
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
  });
  return (
    <MultiSelectDialog<Credential>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
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
