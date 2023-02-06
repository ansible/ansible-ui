import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaProject } from '../../interfaces/EdaProject';
import { useProjectActions } from './hooks/useProjectActions';

export function ProjectDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: project, mutate: refresh } = useGet<EdaProject>(
    `/eda/api/v1/projects/${params.id ?? ''}`
  );
  const itemActions = useProjectActions(refresh);

  const renderProjectDetailsTab = (project: EdaProject | undefined): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{project?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{project?.description || ''}</PageDetail>
        <PageDetail label={t('SCM type')}>{project?.type || 'Git'}</PageDetail>
        <PageDetail label={t('SCM URL')}>{project?.type || ''}</PageDetail>
        <PageDetail label={t('SCM token')}>{project?.token || ''}</PageDetail>
        <PageDetail label={t('Git hash')}>{project?.git_hash || ''}</PageDetail>
        <PageDetail label={t('Created')}>
          {project?.created_at ? formatDateString(project.created_at) : ''}
        </PageDetail>
        <PageDetail label={t('Modified')}>
          {project?.modified_at ? formatDateString(project.modified_at) : ''}
        </PageDetail>
      </PageDetails>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={project?.name}
        breadcrumbs={[{ label: t('Projects'), to: RouteE.EdaProjects }, { label: project?.name }]}
        headerActions={
          <PageActions<EdaProject>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={project}
          />
        }
      />
      {project ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderProjectDetailsTab(project)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
