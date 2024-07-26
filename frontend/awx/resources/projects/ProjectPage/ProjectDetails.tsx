/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  LabelGroup,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CopyCell,
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { StandardPopover } from '../../../../../framework/components/StandardPopover';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { StatusCell } from '../../../../common/Status';
import { useGetItem } from '../../../../common/crud/useGet';
import { ScmType } from '../../../../common/scm';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../common/ExecutionEnvironmentDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxConfig } from '../../../common/useAwxConfig';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';
import { getDocsBaseUrl } from '../../../common/util/getDocsBaseUrl';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ProjectDetails(props: { projectId?: string; disableScroll?: boolean }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const urlId = props?.projectId ? props.projectId : params.id;
  const { error, data: project, refresh } = useGetItem<Project>(awxAPI`/projects`, urlId);
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
  const getPageUrl = useGetPageUrl();

  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
            case 'workflow_job':
            case 'project_update':
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh]
  );
  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  const brand: string = process.env.BRAND ?? 'AWX';
  const product: string = process.env.PRODUCT ?? t('Ansible');
  const signatureValidationHelpText = t`Enable content signing to verify that the content has remained secure when a project is synced. If the content has been tampered with, the job will not run.`;
  const playbookDirectoryHelpText = t`Select from the list of directories found in the Project Base Path. Together the base path and the playbook directory provide the full path used to locate playbooks`;
  const cacheTimeoutHelpText = t`Time in seconds to consider a project
  to be current. During job runs and callbacks the task
  system will evaluate the timestamp of the latest project
  update. If it is older than cache timeout, it is not
  considered current, and a new project update will be
  performed.`;
  const defaultEnvironmentHelpText = t`The execution environment that will be used for jobs
  inside of this organization. This will be used a fallback when
  an execution environment has not been explicitly assigned at the
  project, job template or workflow level.`;
  const sourceControlRefspecHelpBlock = (
    <span>
      {t`A refspec to fetch (passed to the Ansible git
            module). This parameter allows access to references via
            the branch field not otherwise available.`}
      <br />
      <br />
      {t`Note: This field assumes the remote name is "origin".`}
      <br />
      <br />
      {t`Examples include:`}
      <ul style={{ margin: '10px 0 10px 20px' }}>
        <Trans>
          <li>
            <code>refs/*:refs/remotes/origin/*</code>
          </li>
          <li>
            <code>refs/pull/62/head:refs/remotes/origin/pull/62/head</code>
          </li>
        </Trans>
      </ul>
      {t`The first fetches all references. The second
            fetches the Github pull request number 62, in this example
            the branch needs to be "pull/62/head".`}
      <br />
      <br />
      {t`For more information, refer to the`}{' '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`${getDocsBaseUrl(
          config
        )}/html/userguide/projects.html#manage-playbooks-using-source-control`}
      >
        {t`Documentation.`}
      </a>
    </span>
  );
  const basePathHelpBlock = (
    <>
      <p>
        {t(
          'Base path used for locating playbooks. Directories found inside this path will be listed in the playbook directory drop-down. Together the base path and selected playbook directory provide the full path used to locate playbooks.'
        )}
      </p>
      <br></br>
      <p>
        <Trans>
          Change PROJECTS_ROOT when deploying {{ product }} {{ brand }} to change this location.
        </Trans>
      </p>
    </>
  );
  const scmUrlHelpBlock = (
    <>
      <p>{t('Example URLs for GIT Source Control include:')}</p>
      <Trans>
        <code>
          https://github.com/ansible/ansible.git git@github.com:ansible/ansible.git
          git://servername.example.com/ansible.git
        </code>
      </Trans>
      <p>
        {t(
          'Note: When using SSH protocol for GitHub or Bitbucket, enter an SSH key only, do not enter a username (other than git). Additionally, GitHub and Bitbucket do not support password authentication when using SSH. GIT read only protocol (git://) does not use username or password information.'
        )}
      </p>
    </>
  );
  const renderOptions = (options: Project) => (
    <TextList component={TextListVariants.ul}>
      {options.scm_clean && (
        <TextListItem component={TextListItemVariants.li}>
          {t`Discard local changes before syncing`}
          <StandardPopover
            header={''}
            content={t`Remove any local modifications prior to performing an update.`}
          />
        </TextListItem>
      )}
      {options.scm_delete_on_update && (
        <TextListItem component={TextListItemVariants.li}>
          {t`Delete the project before syncing`}
          <StandardPopover
            header={''}
            content={t`Delete the local repository in its entirety prior to
                  performing an update. Depending on the size of the
                  repository this may significantly increase the amount
                  of time required to complete an update.`}
          />
        </TextListItem>
      )}
      {options.scm_track_submodules && (
        <TextListItem component={TextListItemVariants.li}>
          {t`Track submodules latest commit on branch`}
          <StandardPopover
            header={''}
            content={t`Submodules will track the latest commit on
                  their master branch (or other branch specified in
                  .gitmodules). If no, submodules will be kept at
                  the revision specified by the main project.
                  This is equivalent to specifying the --remote
                  flag to git submodule update.`}
          />
        </TextListItem>
      )}
      {options.scm_update_on_launch && (
        <TextListItem component={TextListItemVariants.li}>
          {t`Update revision on job launch`}
          <StandardPopover
            header={''}
            content={t`Each time a job runs using this project, update the
                  revision of the project prior to starting the job.`}
          />
        </TextListItem>
      )}
      {options.allow_override && (
        <TextListItem component={TextListItemVariants.li}>
          {t`Allow branch override`}
          <StandardPopover
            header={''}
            content={t`Allow changing the Source Control branch or revision in a job
                    template that uses this project.`}
          />
        </TextListItem>
      )}
    </TextList>
  );
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!project) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageDetails disableScroll={props.disableScroll}>
      <PageDetail label={t('Name')}>
        {props.projectId ? (
          <Link to={getPageUrl(AwxRoute.ProjectDetails, { params: { id: props.projectId } })}>
            {project.name}
          </Link>
        ) : (
          project.name
        )}
      </PageDetail>
      <PageDetail label={t('Description')}>{project.description}</PageDetail>
      {project.summary_fields?.organization?.name && (
        <PageDetail label={t('Organization')}>
          <TextCell
            text={project.summary_fields?.organization?.name}
            to={getPageUrl(AwxRoute.OrganizationDetails, {
              params: { id: project.summary_fields?.organization?.id },
            })}
          />
        </PageDetail>
      )}
      <PageDetail label={t('Last job status')}>
        {project.summary_fields?.current_job || project.summary_fields?.last_job ? (
          <StatusCell
            status={project.status}
            to={getPageUrl(AwxRoute.JobOutput, {
              params: {
                job_type: project.type,
                id: project.summary_fields?.current_job?.id ?? project.summary_fields?.last_job?.id,
              },
            })}
          />
        ) : (
          <StatusCell status={project.status} />
        )}
      </PageDetail>
      <PageDetail label={t('Source control type')}>
        <ScmType scmType={project.scm_type} />
      </PageDetail>
      {project.scm_revision && (
        <PageDetail label={t('Source control revision')}>
          <CopyCell text={project.scm_revision} />
        </PageDetail>
      )}
      <PageDetail label={t('Source control URL')} helpText={scmUrlHelpBlock}>
        {project.scm_url}
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{project.scm_branch}</PageDetail>
      <PageDetail label={t('Source control refspec')} helpText={sourceControlRefspecHelpBlock}>
        {project.scm_refspec}
      </PageDetail>
      {project.summary_fields.signature_validation_credential && (
        <PageDetail
          label={t('Content signature validation credential')}
          helpText={signatureValidationHelpText}
        >
          <LabelGroup>
            <CredentialLabel
              credential={project.summary_fields.signature_validation_credential}
              key={project.summary_fields.signature_validation_credential.id}
            />
          </LabelGroup>
        </PageDetail>
      )}
      {project.summary_fields.credential && (
        <PageDetail label={t('Source control credential')}>
          <LabelGroup>
            <CredentialLabel
              credential={project.summary_fields.credential}
              key={project.summary_fields.credential.id}
            />
          </LabelGroup>
        </PageDetail>
      )}
      <PageDetail label={t('Cache timeout')} helpText={cacheTimeoutHelpText}>
        {`${project.scm_update_cache_timeout} seconds`}
      </PageDetail>
      {project.summary_fields.default_environment && (
        <ExecutionEnvironmentDetail
          virtualEnvironment={project.custom_virtualenv || undefined}
          executionEnvironment={project.summary_fields.default_environment}
          isDefaultEnvironment
          helpText={defaultEnvironmentHelpText}
        />
      )}
      <PageDetail label={t('Project base path')} helpText={basePathHelpBlock}>
        {config?.project_base_dir}
      </PageDetail>
      <PageDetail label={t('Playbook directory')} helpText={playbookDirectoryHelpText}>
        {project.local_path}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell
          value={project.created}
          author={project.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: project.summary_fields?.created_by?.id },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        value={project.modified}
        author={project.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: project.summary_fields?.modified_by?.id },
          })
        }
      />
      {(project.scm_clean ||
        project.scm_delete_on_update ||
        project.scm_track_submodules ||
        project.scm_update_on_launch ||
        project.allow_override) && (
        <PageDetail label={t('Enabled options')}>{renderOptions(project)}</PageDetail>
      )}
    </PageDetails>
  );
}
