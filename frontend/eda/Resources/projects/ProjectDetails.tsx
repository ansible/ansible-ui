import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Detail,
  DetailsList,
  PageActions,
  PageBody,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { Scrollable } from '../../../../framework';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { useProjectActions } from './hooks/useProjectActions';
import { EdaProject } from '../../interfaces/EdaProject';

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
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format(
                new Date(project?.created_at || 0)
              )}
            </Detail>
            <Detail label={t('Modified')}>
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format(
                new Date(project?.modified_at || 0)
              )}
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
      <Scrollable>
        <PageBody>
          {project ? (
            <PageTabs>
              <PageTab title={t('Details')}>{renderProjectDetailsTab(project)}</PageTab>
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
        </PageBody>
      </Scrollable>
    </PageLayout>
  );
}
