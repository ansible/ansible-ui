import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DateTimeCell,
  ITableColumn,
  PFColorE,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { useHubContext } from '../../../common/useHubContext';
import { HubRoute } from '../../../main/HubRoutes';
import { CollectionVersionSearch } from '../Approval';

export function useApprovalsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const { featureFlags } = useHubContext();
  const { can_upload_signatures, require_upload_signatures, display_signatures } = featureFlags;
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Namespace'),
        cell: (approval) => (
          <TextCell
            text={approval.collection_version?.namespace}
            to={getPageUrl(HubRoute.NamespaceDetails, {
              params: {
                id: approval.collection_version?.namespace,
              },
            })}
          />
        ),
        sort: 'namespace',
      },
      {
        header: t('Collection'),
        cell: (approval) => (
          <TextCell
            text={approval.collection_version?.name}
            to={getPageUrl(HubRoute.CollectionDetails, {
              params: {
                repository: approval.repository?.name || '',
                namespace: approval.collection_version?.namespace || '',
                name: approval.collection_version?.name || '',
              },
              query: {
                version: approval.collection_version?.version,
              },
            })}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Version'),
        cell: (approval) => (
          <TextCell
            text={approval.collection_version?.version}
            to={getPageUrl(HubRoute.CollectionDetails, {
              params: {
                repository: approval.repository?.name || '',
                namespace: approval.collection_version?.namespace || '',
                name: approval.collection_version?.name || '',
              },
              query: {
                version: approval.collection_version?.version,
              },
            })}
          />
        ),
        list: 'secondary',
        sort: 'version',
      },
      {
        header: t('Repository'),
        cell: (approval) => (
          <TextCell
            text={approval.repository?.name}
            to={getPageUrl(HubRoute.RepositoryDetails, {
              params: {
                id: approval.repository?.name,
              },
            })}
          />
        ),
      },
      {
        header: t('Status'),
        cell: (approval) => {
          if (approval.repository?.pulp_labels?.pipeline === 'staging') {
            return (
              <TextCell
                icon={<ExclamationTriangleIcon />}
                text={
                  approval.is_signed === false && can_upload_signatures && require_upload_signatures
                    ? t`Needs signature and review`
                    : t`Needs review`
                }
                color={PFColorE.Warning}
              />
            );
          }

          if (approval.repository?.pulp_labels?.pipeline === 'approved') {
            if (approval.is_signed && display_signatures) {
              return (
                <TextCell
                  icon={<CheckCircleIcon />}
                  text={t('Signed and Approved')}
                  color={PFColorE.Success}
                />
              );
            } else {
              return (
                <TextCell
                  icon={<CheckCircleIcon />}
                  text={t('Approved')}
                  color={PFColorE.Success}
                />
              );
            }
          }

          if (approval.repository?.pulp_labels?.pipeline === 'rejected') {
            return (
              <TextCell
                icon={<ExclamationCircleIcon />}
                text={t('Rejected')}
                color={PFColorE.Red}
              />
            );
          }
        },
      },
      {
        header: t('Created'),
        cell: (approval) => <DateTimeCell value={approval.collection_version?.pulp_created} />,
        card: 'hidden',
        list: 'secondary',
        sort: 'pulp_created',
      },
    ],
    [t, can_upload_signatures, require_upload_signatures, display_signatures, getPageUrl]
  );
  return tableColumns;
}
