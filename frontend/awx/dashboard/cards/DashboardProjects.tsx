import { useTranslation } from 'react-i18next';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';
import { Project } from '../../interfaces/Project';

export function DashboardProjects(props: {
  projects: { results?: Project[] | undefined } | undefined;
}) {
  const { t } = useTranslation();
  const { projects } = props;

  if (!projects?.results) {
    return <></>;
  }

  return (
    <PageDashboardDonutCard
      title={t('Projects')}
      to={RouteObj.Projects}
      items={[
        {
          label: t('Ready'),
          count: projects?.results?.filter((i) => i.status === 'successful').length ?? 0,
          color: pfSuccess,
        },
        {
          label: t('Sync failures'),
          count: projects?.results?.filter((i) => i.status !== 'successful').length ?? 0,
          color: pfDanger,
        },
      ]}
    />
  );
}
