import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails } from '../../../../framework';
import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { ImportStatusIndicator } from '../ImportStatusIndicator';

export interface ImportStatusBarProps {
  collection?: CollectionVersionSearch;
  collectionImport?: CollectionImport;
}

export function ImportStatusBar({ collection, collectionImport }: ImportStatusBarProps) {
  const { t } = useTranslation();
  const collectionPipeline = collection?.repository?.pulp_labels?.pipeline ?? 'unknown';

  const pipelineStates: Record<string, string> = {
    rejected: t`rejected`,
    staging: t`waiting for approval`,
    approved: t`approved`,
    unknown: t`could not be determined yet`,
  };

  return (
    <PageDetails disablePadding>
      <PageDetail label={t('Status')}>
        <ImportStatusIndicator type="secondary" status={collectionImport?.state} />
      </PageDetail>
      <PageDetail label={t('Version')}>{collectionImport?.version}</PageDetail>
      <PageDetail label={t('Approval status')}>
        {collection ? (
          <>
            {collectionImport?.state === 'running'
              ? t('waiting for import to finish')
              : pipelineStates[collectionPipeline]}
          </>
        ) : (
          '---'
        )}
      </PageDetail>
    </PageDetails>
  );
}
