import { ExclamationTriangleIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, PFColorE, TextCell } from '../../../../framework';
import { Approval } from '../Approval';

export function useApprovalsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<Approval>[]>(
    () => [
      {
        header: t('Collection'),
        cell: (approval) => <TextCell text={approval.name} />,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (approval) => {
          if (approval.repository_list.includes('staging')) {
            return (
              <TextCell
                icon={<ExclamationTriangleIcon />}
                text={t('Needs review')}
                color={PFColorE.Warning}
              />
            );
          } else {
            return (
              <TextCell icon={<ThumbsUpIcon />} text={t('Approved')} color={PFColorE.Success} />
            );
          }
        },
      },
      {
        header: t('Namespace'),
        cell: (approval) => <TextCell text={approval.namespace} />,
      },
      {
        header: t('Version'),
        cell: (approval) => <TextCell text={approval.version} />,
        list: 'secondary',
      },
      {
        header: t('Created'),
        cell: (approval) => <DateTimeCell format="since" value={approval.created_at} />,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
  return tableColumns;
}
