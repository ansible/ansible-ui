import { IToolbarFilter, usePageDialog } from '@ansible/ansible-ui-framework';
import { SingleSelectDialog } from '@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useAwxView } from '../../../common/useAwxView';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsColumns } from './useCredentialsColumns';

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
  const typeParams: { [key: string]: string } = {};

  if (props.credentialType) {
    typeParams.credential_type = props.credentialType.toString();
  }
  if (props.sourceType) {
    if (props.sourceType === 'scm') typeParams.credential_type__kind = 'cloud';
    else typeParams.credential_type__namespace = props.sourceType;
  }

  const view = useAwxView<Credential>({
    url: awxAPI`/credentials/`,
    toolbarFilters,
    tableColumns: tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultCredential ? [props.defaultCredential] : undefined,
    queryParams: { ...typeParams },
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
