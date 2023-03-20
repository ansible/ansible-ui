import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../framework';
import { RouteObj } from '../../Routes';
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
import { PlusCircleIcon, CubesIcon } from '@patternfly/react-icons';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';

export function ProjectsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useProjectColumns();
  const view = useEdaView<EdaProject>({
    url: `${API_PREFIX}/projects/`,
    viewPage: 1,
    viewPerPage: 4,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <Card style={{ transition: 'box-shadow 0.25s', minHeight: 503 }}>
      <CardTitle>
        <Level>
          <LevelItem>
            <Title headingLevel="h2">{t('Projects')}</Title>
          </LevelItem>
          <LevelItem>
            <Button variant="link" onClick={() => navigate(RouteObj.EdaProjects)}>
              {t('Go to Projects')}
            </Button>
          </LevelItem>
        </Level>
      </CardTitle>
      <CardBody>
        <PageTable
          disableBodyPadding={true}
          tableColumns={tableColumns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading projects')}
          emptyStateIcon={CubesIcon}
          emptyStateVariant={'light'}
          emptyStateTitle={t('There are currently no projects')}
          emptyStateDescription={t('Create a project by clicking the button below.')}
          emptyStateButtonText={t('Create project')}
          emptyStateButtonClick={() => navigate(RouteObj.CreateEdaProject)}
          {...view}
          defaultSubtitle={t('Project')}
        />
      </CardBody>
      {view?.itemCount && view.itemCount > 0 ? (
        <CardFooter>
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={() => navigate(RouteObj.CreateEdaProject)}
          >
            {t('Create project')}
          </Button>
        </CardFooter>
      ) : (
        <div />
      )}
    </Card>
  );
}
