import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PageActions, PageHeader, useGetPageUrl, usePageNavigate } from '../../../../framework';
import { useJobHeaderActions } from './hooks/useJobHeaderActions';
import { Job } from '../../interfaces/Job';
import { AwxRoute } from '../../main/AwxRoutes';
import { useTranslation } from 'react-i18next';
import { useGetJob } from './JobPage';
import { useParams } from 'react-router-dom';

export function JobHeader() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; job_type: string }>();
  const { job } = useGetJob(params.id, params.job_type);

  const actions = useJobHeaderActions(() => pageNavigate(AwxRoute.Jobs));
  return (
    <PageHeader
      title={job?.name}
      breadcrumbs={[{ label: t('Jobs'), to: getPageUrl(AwxRoute.Jobs) }, { label: job?.name }]}
      headerActions={
        <PageActions<Job> actions={actions} position={DropdownPosition.right} selectedItem={job} />
      }
    />
  );
}
