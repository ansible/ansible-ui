/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CopyCell, PageDetail, PageDetails, SinceCell, TextCell } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';
import { ScmType } from '../../../../common/scm';
import { StatusCell } from '../../../../common/StatusCell';

export function ProjectDetails(props: { project: Project }) {
  const { t } = useTranslation();
  const { project } = props;
  const history = useNavigate();
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{project.name}</PageDetail>
      <PageDetail label={t('Description')}>{project.description}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={project.summary_fields?.organization?.name}
          to={RouteE.OrganizationDetails.replace(
            ':id',
            (project.summary_fields?.organization?.id ?? '').toString()
          )}
        />
      </PageDetail>
      <PageDetail label={t('Last Job Status')}>
        <StatusCell status={project.status} />
      </PageDetail>
      <PageDetail label={t('Source Control Type')}>
        <ScmType scmType={project.scm_type} />
      </PageDetail>
      <PageDetail label={t('Source Control Revision')}>
        <CopyCell text={project.scm_revision} />
      </PageDetail>
      <PageDetail label={t('Source Control URL')}>{project.scm_url}</PageDetail>
      <PageDetail label={t('Cache Timeout')}>{project.scm_update_cache_timeout}</PageDetail>
      {/* TODO config provider */}
      {/* <PageDetail label={t('Project Base Path')}>{config.project_base_dir}</PageDetail> */}
      <PageDetail label={t('Playbook Directory')}>{project.local_path}</PageDetail>
      <PageDetail label={t('Created')}>
        <SinceCell
          value={project.created}
          author={project.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteE.UserDetails.replace(
                ':id',
                (project.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <SinceCell
          value={project.modified}
          author={project.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteE.UserDetails.replace(
                ':id',
                (project.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
