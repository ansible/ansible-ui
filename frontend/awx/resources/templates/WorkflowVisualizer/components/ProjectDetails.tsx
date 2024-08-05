import { useTranslation } from 'react-i18next';
import { PageDetail, CopyCell, TextCell, useGetPageUrl } from '../../../../../../framework';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { Project } from '../../../../interfaces/Project';
import { ScmType } from '../../../../../common/scm';

export function ProjectDetails({ project }: { project: Project }) {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const getPageUrl = useGetPageUrl();

  return (
    <>
      <PageDetail label={t('Organization')} isEmpty={!project.summary_fields.organization}>
        <TextCell
          text={project.summary_fields.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: project.summary_fields.organization?.id },
          })}
        />
      </PageDetail>
      <PageDetail label={t('Source control type')}>
        <ScmType scmType={project.scm_type} />
      </PageDetail>
      {project.scm_revision && (
        <PageDetail label={t('Source control revision')}>
          <CopyCell text={project.scm_revision} />
        </PageDetail>
      )}
      <PageDetail label={t('Source control URL')}>{project.scm_url}</PageDetail>
      <PageDetail label={t('Source control branch')}>{project.scm_branch}</PageDetail>
      <PageDetail label={t('Source control refspec')}>{project.scm_refspec}</PageDetail>
      <PageDetail label={t('Cache timeout')}>
        {`${project.scm_update_cache_timeout} seconds`}
      </PageDetail>
      <PageDetail label={t('Project Base Path')}>{config?.project_base_dir}</PageDetail>
      <PageDetail label={t('Playbook directory')}>{project.local_path}</PageDetail>
    </>
  );
}
