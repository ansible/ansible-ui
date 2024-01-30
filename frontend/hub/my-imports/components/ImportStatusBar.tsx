import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails } from '../../../../framework';
import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { ImportStatusIndicator } from './ImportStatusIndicator';

interface IProps {
  collection?: CollectionVersionSearch;
  collectionImport?: CollectionImport;
}

export function ImportStatusBar({ collection, collectionImport }: IProps) {
  const { t } = useTranslation();
  const collectionPipeline = collection?.repository?.pulp_labels?.pipeline ?? 'unknown';

  return (
    <PageDetails disablePadding>
      <PageDetail label={t('Status')}>
        <ImportStatusIndicator type="secondary" status={collectionImport?.state} />
      </PageDetail>
      <PageDetail label={t('Version')}>{collectionImport?.version}</PageDetail>
      <PageDetail label={t('Approval status')}>
        {collectionImport ? (
          <>
            <div>
              {!collection
                ? t`waiting for import to finish`
                : {
                    rejected: t`rejected`,
                    staging: t`waiting for approval`,
                    approved: t`approved`,
                    unknown: t`could not be determined yet`,
                  }[collectionPipeline]}
            </div>
          </>
        ) : null}
      </PageDetail>
    </PageDetails>
  );
}
