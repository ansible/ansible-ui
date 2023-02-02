/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { useGet2 } from '../../../../Data';
import { RouteE } from '../../../../Routes';
import { Job } from '../../../interfaces/Job';
import { JobOutput } from './JobOutput';

export function JobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: job } = useGet2<Job>({ url: `/api/v2/jobs/${params.id}/` });
  return (
    <PageLayout>
      <PageHeader
        title={job?.name}
        breadcrumbs={[{ label: t('Jobs'), to: RouteE.Jobs }, { label: job?.name }]}
      />
      <PageTabs loading={!job}>
        <PageTab label={t('Output')}>
          <JobOutput job={job} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
