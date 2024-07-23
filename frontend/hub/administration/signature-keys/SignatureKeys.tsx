import { ButtonVariant } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CopyCell,
  DateTimeCell,
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  ToolbarFilterType,
} from '../../../../framework';
import { downloadTextFile } from '../../../../framework/utils/download-file';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { SignatureKey } from './SignatureKey';

export function SignatureKeys() {
  const { t } = useTranslation();
  const toolbarFilters = useSignatureKeyFilters();
  const tableColumns = useSignatureKeysColumns();
  const view = useHubView<SignatureKey>({
    url: pulpAPI`/signing-services/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const rowActions = useMemo<IPageAction<SignatureKey>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: DownloadIcon,
        label: t('Download key'),
        onClick: (signatureKey) => downloadTextFile('key', signatureKey?.public_key ?? ''),
      },
    ],
    [t]
  );
  return (
    <PageLayout>
      <PageHeader
        title={t('Signature Keys')}
        description={t(
          'Signature keys are cryptographic keys used to verify the authenticity and integrity of content published on Ansible Galaxy.'
        )}
        titleHelpTitle={t('Signature Keys')}
        titleHelp={t(
          'Signature keys are cryptographic keys used to verify the authenticity and integrity of content published on Ansible Galaxy.'
        )}
      />
      <PageTable<SignatureKey>
        id="hub-signature-keys-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading signature keys')}
        emptyStateTitle={t('No signature keys yet')}
        {...view}
      />
    </PageLayout>
  );
}

export function useSignatureKeysColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<SignatureKey>[]>(
    () => [
      {
        header: t('Name'),
        cell: (signatureKey) => <TextCell text={signatureKey.name} />,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Fingerprint'),
        cell: (signatureKey) => <CopyCell text={signatureKey.pubkey_fingerprint} />,
      },
      {
        header: t('Public key'),
        cell: (signatureKey) => <CopyCell text={signatureKey.public_key} />,
      },
      {
        header: t('Created'),
        cell: (signatureKey) => <DateTimeCell value={signatureKey.pulp_created} />,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
  return tableColumns;
}

export function useSignatureKeyFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        query: 'name',
        comparison: 'equals',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
