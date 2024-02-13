import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../../eda/common/eda-utils';
import { useCredentialFilters } from './useCredentialFilters';
import { useCredentialColumns } from './useCredentialColumns';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useEdaView } from '../../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialog } from '../../../../../framework';

export function useSelectCredentials(credentialType?: number, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectCredentials = useCallback(
    (onSelect: (credentials: EdaCredential[]) => void) => {
      setDialog(
        <SelectEdaCredentials
          title={t(title ? title : 'Select credential')}
          onSelect={onSelect}
          credentialType={credentialType}
        />
      );
    },
    [credentialType, setDialog, t, title]
  );
  return openSelectCredentials;
}

function SelectEdaCredentials(props: {
  title: string;
  onSelect: (credentials: EdaCredential[]) => void;
  defaultEdaCredential?: EdaCredential;
  credentialType?: number;
}) {
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/credentials/`,
    toolbarFilters,
    tableColumns: tableColumns,
    disableQueryString: true,
    ...(props.credentialType && {
      queryParams: {
        credential_type: props.credentialType.toString(),
      },
    }),
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
