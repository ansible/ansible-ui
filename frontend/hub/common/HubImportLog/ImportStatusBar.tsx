import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { PageDetail, PageDetails } from '../../../../framework';
import { StatusCell, StatusLabel } from '../../../common/Status';
import { useTranslation } from 'react-i18next';

export interface ImportStatusBarProps {
  collection?: CollectionVersionSearch;
  collectionImport?: CollectionImport;
}

export function ImportStatusBar({ collection, collectionImport }: ImportStatusBarProps) {
  const { t } = useTranslation();
  const collectionPipeline = collection?.repository?.pulp_labels?.pipeline ?? 'unknown';

  const customPipelineStates: Record<string, string> = {
    staging: t`waiting for approval`,
    unknown: t`could not be determined yet`,
  };

  return (
    <PageDetails disablePadding>
      <PageDetail label={t('Status')}>
        <StatusLabel status={collectionImport?.state} />
      </PageDetail>
      <PageDetail label={t('Approval status')}>
        {collection ? (
          <>
            {collectionImport?.state === 'running' ? (
              t('waiting for import to finish')
            ) : (
              <StatusCell status={customPipelineStates[collectionPipeline] ?? collectionPipeline} />
            )}
          </>
        ) : (
          '---'
        )}
      </PageDetail>
      <PageDetail label={t('Version')}>{collectionImport?.version}</PageDetail>
    </PageDetails>
  );
}
