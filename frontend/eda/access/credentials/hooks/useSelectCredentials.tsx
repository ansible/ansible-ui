import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../../eda/common/eda-utils';
import { useCredentialFilters } from './useCredentialFilters';
import { useCredentialColumns } from './useCredentialColumns';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useEdaView } from '../../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialogs } from '../../../../../framework';

export function useSelectCredentials(credentialKinds?: string[], title?: string) {
  const { pushDialog } = usePageDialogs();
  const { t } = useTranslation();
  const openSelectCredentials = useCallback(
    (onSelect: (credentials: EdaCredential[]) => void) => {
      pushDialog(
        <SelectEdaCredentials
          title={t(title ? title : 'Select credential')}
          onSelect={onSelect}
          credentialKinds={credentialKinds}
        />
      );
    },
    [credentialKinds, pushDialog, t, title]
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
  const tableColumns = useCredentialColumns();
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
