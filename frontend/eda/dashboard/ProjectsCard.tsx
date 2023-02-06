import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../framework';
import { useInMemoryView } from '../../../framework';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaProject } from '../interfaces/EdaProject';
import { useProjectColumns } from './hooks/useProjectColumns';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Level,
  LevelItem,
  Title,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function ProjectsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: projects } = useGet<EdaProject[]>('/api/projects');
  const tableColumns = useProjectColumns();
  const view = useInMemoryView<EdaProject>({
    items: projects?.slice(-4),
    tableColumns,
    keyFn: (project: EdaProject) => project.id,
  });
  return (
    <Card style={{ transition: 'box-shadow 0.25s', minHeight: 500 }}>
      <CardTitle>
        <Level>
          <LevelItem>
            <Title headingLevel="h2">{t('Projects')}</Title>
          </LevelItem>
          <LevelItem>
            <Button variant="link" onClick={() => navigate(RouteE.EdaProjects)}>
              {t('Go to Projects')}
            </Button>
          </LevelItem>
        </Level>
      </CardTitle>
      <CardBody>
        <PageTable
          tableColumns={tableColumns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading projects')}
          emptyStateTitle={t('No projects yet')}
          {...view}
          defaultSubtitle={t('Project')}
        />
      </CardBody>
      <CardFooter>
        <Button
          variant="link"
          icon={<PlusCircleIcon />}
          onClick={() => navigate(RouteE.CreateEdaProject)}
        >
          {t('Create project')}
        </Button>
      </CardFooter>
    </Card>
  );
}
