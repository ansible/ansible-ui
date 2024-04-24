import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, usePageDialog, useSelectDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsColumns } from './useCredentialsColumns';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';

const useToolbarFilters = () => {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [createdByToolbarFilter, descriptionToolbarFilter, modifiedByToolbarFilter, nameToolbarFilter]
  );
  return toolbarFilters;
};

export function useMultiSelectCredential(
  isLookup: boolean,
  credentialType?: number,
  acceptableCredentialKinds?: string[]
) {
  const { t } = useTranslation();
  const tableColumns = useCredentialsColumns({ disableLinks: true });
  const toolbarFilters = useToolbarFilters();
  const columns = useMemo(
    () =>
      isLookup
        ? tableColumns.filter((item) => item?.id && ['name', 'credential_type'].includes(item?.id))
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
    ...(acceptableCredentialKinds &&
      acceptableCredentialKinds?.length > 0 && {
        queryParams: {
          credential_type__kind__in:
            acceptableCredentialKinds.length === 1
              ? acceptableCredentialKinds[0]
              : acceptableCredentialKinds.join(','),
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
          title={title ? title : t('Select credential')}
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
  const tableColumns = useCredentialsColumns({ disableLinks: true });
  const toolbarFilters = useToolbarFilters();
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
