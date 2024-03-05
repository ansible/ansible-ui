import { Button } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DateTimeCell, LoadingPage, PageDetail, PageDetails } from '../../../../framework';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { ShaLabel, ShaLink, TagLabel, TagLink } from './components/ImageLabels';

interface ContentInfo {
  pulp_id: string;
  pulp_type: string;
  manifest_digest: string;
  tag_name: string;
}

interface HistoryType {
  id: string;
  added: ContentInfo[];
  removed: ContentInfo[];
  number: number;
  created_at: string;
  updated_at: string;
}

interface ActivityType {
  action: JSX.Element;
  created: string;
}

export function ExecutionEnvironmentActivity() {
  const { t } = useTranslation();
  const pageSize = 10;
  const [perPage, setPerPage] = useState(pageSize);
  const [activities, setActivities] = useState<ActivityType[]>();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refresh } = useGet<HubItemsResponse<HistoryType>>(
    id ? hubAPI`/v3/plugin/execution-environments/repositories/${id}/_content/history/` : '',
    {
      limit: perPage,
    }
  );

  const composeActivities = (id: string, data: HubItemsResponse<HistoryType>) => {
    const activities: ActivityType[] = [];
    data?.data.forEach((history) => {
      history.added.forEach((action) => {
        let activityDescription;
        if (action.pulp_type === 'container.tag') {
          const removed = history.removed.find((item) => {
            return item.tag_name === action.tag_name;
          });
          if (removed) {
            activityDescription = (
              <>
                <Trans>
                  <TagLink id={id} tag={action.tag_name} /> was moved to{' '}
                  <ShaLink id={id} digest={action.manifest_digest} /> from{' '}
                  <ShaLink id={id} digest={removed.manifest_digest} />
                </Trans>
              </>
            );
          } else {
            activityDescription = (
              <>
                <Trans>
                  <TagLink id={id} tag={action.tag_name} /> was added to{' '}
                  <ShaLink id={id} digest={action.manifest_digest} />
                </Trans>
              </>
            );
          }
        } else {
          activityDescription = (
            <>
              <Trans>
                <ShaLink id={id} digest={action.manifest_digest} /> was added
              </Trans>
            </>
          );
        }
        activities.push({
          created: history.created_at,
          action: activityDescription,
        });
      });
      history.removed.forEach((action) => {
        let activityDescription;
        if (action.pulp_type === 'container.tag') {
          if (
            !history.added.find((item) => {
              return item.tag_name === action.tag_name;
            })
          ) {
            activityDescription = (
              <>
                <Trans>
                  <TagLabel tag={action.tag_name} /> was removed from{' '}
                  <ShaLink id={id} digest={action.manifest_digest} />
                </Trans>
              </>
            );
          } else {
            // skip one added as moved
            return;
          }
        } else {
          activityDescription = (
            <>
              <Trans>
                <ShaLabel digest={action.manifest_digest} /> was removed
              </Trans>
            </>
          );
        }
        activities.push({
          created: history.created_at,
          action: activityDescription,
        });
      });
    });
    if (data?.links.next) {
      activities.push({
        created: '',
        action: (
          <Button
            variant={'link'}
            onClick={() => {
              setPerPage(perPage + pageSize);
            }}
          >
            {t(`Load more`)}
          </Button>
        ),
      });
    } else {
      const lastActivity = activities[activities.length - 1];
      if (lastActivity) {
        activities.push({
          created: lastActivity.created,
          action: <>{t(`${id} was added`)}</>,
        });
      }
    }

    return activities;
  };

  useEffect(() => {
    if (id && data) {
      setActivities(composeActivities(id, data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading || !id) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!activities?.length)
    return (
      <EmptyStateNoData
        title={t`No activities yet`}
        description={t`Activities will appear once you push something`}
      />
    );

  return (
    <PageDetails numberOfColumns="single">
      <PageDetail>
        <Table data-cy="activities-table">
          <Thead>
            <Tr>
              <Th width={15}>{t('Change')}</Th>
              <Th width={10}>{t('Date')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities?.map((activity, i) => (
              <Tr key={i}>
                <Td>{activity.action}</Td>
                <Td>
                  <DateTimeCell value={activity.created} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageDetail>
    </PageDetails>
  );
}
