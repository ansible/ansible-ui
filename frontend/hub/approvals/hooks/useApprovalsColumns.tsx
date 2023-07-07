import { ExclamationTriangleIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, PFColorE, TextCell } from '../../../../framework';
import { CollectionVersionSearch } from '../Approval';

export function useApprovalsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Namespace'),
        cell: (approval) => <TextCell text={approval.namespace_metadata?.name} />,
        sort: 'namespace',
      },
      {
        header: t('Collection'),
        cell: (approval) => <TextCell text={approval.collection_version.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Version'),
        cell: (approval) => <TextCell text={approval.collection_version.version} />,
        list: 'secondary',
        sort: 'version',
      },
      {
        header: t('Repository'),
        cell: (approval) => <TextCell text={approval.repository.name} />,
      },
      {
        header: t('Status'),
        cell: (approval) => {
          if (approval.repository.pulp_labels.pipeline == 'staging') {
            return (
              <TextCell
                icon={<ExclamationTriangleIcon />}
                text={t('Needs review')}
                color={PFColorE.Warning}
              />
            );
          }

          if (approval.repository.pulp_labels.pipeline == 'approved') {
            return (
              <TextCell icon={<ThumbsUpIcon />} text={t('Approved')} color={PFColorE.Success} />
            );
          }

          if (approval.repository.pulp_labels.pipeline == 'rejected') {
            return <TextCell icon={<ThumbsUpIcon />} text={t('Rejected')} color={PFColorE.Red} />;
          }
        },
      },
      {
        header: t('Created'),
        cell: (approval) => (
          <DateTimeCell format="since" value={approval.collection_version.pulp_created} />
        ),
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
  return tableColumns;
}
