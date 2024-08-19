import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { Unavailable } from '../../../../../framework/components/Unavailable';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { AwxRoute } from '../../../main/AwxRoutes';

export function InstanceGroupDetails() {
  const params = useParams<{ id: string }>();
  const {
    data: instanceGroup,
    isLoading,
    error,
    refresh,
  } = useGetItem<InstanceGroup>(awxAPI`/instance_groups/`, params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (isLoading && !instanceGroup) return <LoadingPage />;

  return instanceGroup ? <InstanceGroupDetailInner instanceGroup={instanceGroup} /> : null;
}

export function InstanceGroupDetailInner(props: { instanceGroup: InstanceGroup }) {
  const { t } = useTranslation();
  const { instanceGroup } = props;
  const getPageUrl = useGetPageUrl();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{instanceGroup.name}</PageDetail>
      <PageDetail label={t('Type')}>
        {instanceGroup.is_container_group ? t('Container Group') : t('Instance Group')}
      </PageDetail>
      <PageDetail
        label={t('Policy instance minimum')}
        helpText={t(
          'Minimum number of instances that will be automatically assigned to this group when new instances come online.'
        )}
        isEmpty={instanceGroup.is_container_group}
      >
        {instanceGroup.policy_instance_minimum}
      </PageDetail>
      <PageDetail
        label={t('Policy instance percentage')}
        helpText={t(
          'Minimum percentage of all instances that will be automatically assigned to this group when new instances come online.'
        )}
        isEmpty={instanceGroup.is_container_group}
      >
        {instanceGroup.policy_instance_percentage}%
      </PageDetail>
      <PageDetail
        label={t('Max concurrent jobs')}
        helpText={t(
          'Maximum number of jobs to run concurrently on this group. Zero means no limit will be enforced.'
        )}
      >
        {instanceGroup.max_concurrent_jobs}
      </PageDetail>
      <PageDetail
        label={t('Max forks')}
        helpText={t(
          'Maximum number of forks to allow across all jobs running concurrently on this group. Zero means no limit will be enforced.'
        )}
      >
        {instanceGroup.max_forks}
      </PageDetail>
      <PageDetail label={t('Used capacity')} isEmpty={instanceGroup.is_container_group}>
        {instanceGroup.capacity ? (
          `${Math.round(100 - instanceGroup.percent_capacity_remaining)}%`
        ) : (
          <Unavailable>{t('Unavailable')}</Unavailable>
        )}
      </PageDetail>
      <PageDetail
        label={t('Credential')}
        isEmpty={!instanceGroup.is_container_group || !instanceGroup.summary_fields.credential}
      >
        <LabelGroup>
          <Label color="blue">
            <Link
              to={getPageUrl(AwxRoute.CredentialDetails, {
                params: {
                  id: instanceGroup?.summary_fields?.credential?.id,
                },
              })}
            >
              {instanceGroup?.summary_fields?.credential?.name}
            </Link>
          </Label>
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={instanceGroup.created} />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell value={instanceGroup.modified} />
      </PageDetail>
      <PageDetailCodeEditor
        fullWidth
        isEmpty={!instanceGroup.pod_spec_override.length}
        helpText={t('Custom Kubernetes or OpenShift Pod specification.')}
        label={t('Pod spec override')}
        showCopyToClipboard
        value={instanceGroup.pod_spec_override}
      />
    </PageDetails>
  );
}
