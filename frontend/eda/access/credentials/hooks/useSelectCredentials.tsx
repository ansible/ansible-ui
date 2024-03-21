import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../../eda/common/eda-utils';
import { useCredentialFilters } from './useCredentialFilters';
import { useCredentialColumns } from './useCredentialColumns';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useEdaView } from '../../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialog } from '../../../../../framework';

export function useSelectCredentials(credentialKind?: string, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectCredentials = useCallback(
    (onSelect: (credentials: EdaCredential[]) => void) => {
      setDialog(
        <SelectEdaCredentials
          title={t(title ? title : 'Select credential')}
          onSelect={onSelect}
          credentialKind={credentialKind}
        />
      );
    },
    [credentialKind, setDialog, t, title]
  );
  return openSelectCredentials;
}

function SelectEdaCredentials(props: {
  title: string;
  onSelect: (credentials: EdaCredential[]) => void;
  defaultEdaCredential?: EdaCredential;
  credentialKind?: string;
}) {
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/eda-credentials/?credential_type__kind=vault&credential_type__kind=cloud&page_size=300`,
    toolbarFilters,
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
