import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Detail,
  DetailsList,
  PageActions,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  Scrollable,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaProject } from '../../interfaces/EdaProject';
import { useProjectActions } from './hooks/useProjectActions';

export function ProjectDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: project, mutate: refresh } = useGet<EdaProject>(`/api/projects/${params.id ?? ''}`);
  const itemActions = useProjectActions(refresh);

  const renderProjectDetailsTab = (project: EdaProject | undefined): JSX.Element => {
    return (
      <Scrollable>
        <PageSection variant="light">
          <DetailsList>
            <Detail label={t('Name')}>{project?.name || ''}</Detail>
            <Detail label={t('Description')}>{project?.description || ''}</Detail>
            <Detail label={t('SCM type')}>{project?.type || 'Git'}</Detail>
            <Detail label={t('SCM URL')}>{project?.type || ''}</Detail>
            <Detail label={t('SCM token')}>{project?.token || ''}</Detail>
            <Detail label={t('Git hash')}>{project?.git_hash || ''}</Detail>
            <Detail label={t('Created')}>
              {project?.created_at ? formatDateString(project.created_at) : ''}
            </Detail>
            <Detail label={t('Modified')}>
              {project?.modified_at ? formatDateString(project.modified_at) : ''}
            </Detail>
          </DetailsList>
        </PageSection>
      </Scrollable>
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
