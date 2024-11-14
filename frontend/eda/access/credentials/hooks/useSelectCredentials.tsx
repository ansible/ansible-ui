import { MultiSelectDialog, usePageDialog } from '@ansible/ansible-ui-framework';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaView } from '../../../common/useEventDrivenView';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCredentialColumns } from './useCredentialColumns';
import { useCredentialFilters } from './useCredentialFilters';

export function useSelectCredentials(credentialKinds?: string[], title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectCredentials = useCallback(
    (onSelect: (credentials: EdaCredential[]) => void) => {
      setDialog(
        <SelectEdaCredentials
          title={t(title ? title : 'Select credential')}
          onSelect={onSelect}
          credentialKinds={credentialKinds}
        />
      );
    },
    [credentialKinds, setDialog, t, title]
  );
  return openSelectCredentials;
}

function SelectEdaCredentials(props: {
  title: string;
  onSelect: (credentials: EdaCredential[]) => void;
  defaultEdaCredential?: EdaCredential;
  credentialKinds?: string[];
}) {
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns({ disableLinks: true });
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/eda-credentials/`,
    toolbarFilters,
    viewPerPage: 300,
    ...(props.credentialKinds &&
      props.credentialKinds?.length > 0 && {
        queryParams: {
          credential_type__kind__in:
            props.credentialKinds.length === 1
              ? props.credentialKinds[0]
              : props.credentialKinds.join(','),
        },
      }),
    tableColumns: tableColumns,
    disableQueryString: true,
  });
  return (
    <MultiSelectDialog<EdaCredential>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
