import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { DateTimeCell, LoadingPage, PageDetail, PageDetails } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { CollectionVersion } from '../../../collections/Collection';
import { HubError } from '../../../common/HubError';
import { pulpAPI } from '../../../common/api/formatPath';
import { PulpItemsResponse } from '../../../common/useHubView';

export function RepositoryVersionDetails() {
  const { t } = useTranslation();
  const { repo_id } = useOutletContext<{ repo_id: string }>();
  const params = useParams<{ id: string; version: string }>();
  const { data, error, refresh } = useGet<PulpItemsResponse<CollectionVersion>>(
    params.id
      ? pulpAPI`/repositories/ansible/ansible/${repo_id}/versions/?number=${params.version}`
      : ''
  );
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;
  const allInfo = data.results[0];
  let numberAdded = 0;
  let numberRemoved = 0;
  let numberCurrent = 0;
  Object.keys(allInfo.content_summary.added).forEach(
    (key) => (numberAdded += allInfo.content_summary.added[key].count)
  );
  Object.keys(allInfo.content_summary.removed).forEach(
    (key) => (numberRemoved += allInfo.content_summary.removed[key].count)
  );
  Object.keys(allInfo.content_summary.present).forEach(
    (key) => (numberCurrent += allInfo.content_summary.present[key].count)
  );

  const getLabels = (labels: Record<string, { count: number }>) => {
    return (
      <LabelGroup>
        {Object.keys(labels).map((key) => {
          return <Label key={key}>{`${key}: ${labels[key].count}`}</Label>;
        })}
      </LabelGroup>
    );
  };

  return (
    <PageDetails>
      <PageDetail label={t('Version number')}>{allInfo.number}</PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={allInfo.pulp_created} />
      </PageDetail>
      <PageDetail label={t('Number of content added')}>{numberAdded}</PageDetail>
      <PageDetail label={t('Content added')}>
        {numberAdded === 0 ? t('None') : getLabels(allInfo.content_summary.added)}
      </PageDetail>
      <PageDetail label={t('Number of content removed')}>{numberRemoved}</PageDetail>
      <PageDetail label={t('Content removed')}>
        {numberRemoved === 0 ? t('None') : getLabels(allInfo.content_summary.removed)}
      </PageDetail>
      <PageDetail label={t('Number of current content')}>{numberCurrent}</PageDetail>
      <PageDetail label={t('Current content')}>
        {numberCurrent === 0 ? t('None') : getLabels(allInfo.content_summary.present)}
      </PageDetail>
    </PageDetails>
  );
}
