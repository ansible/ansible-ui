import {
  Label,
  LabelGroup,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
  getPatternflyColor,
} from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { useVerbosityString } from '../../../common/useVerbosityString';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { WebhookService } from '../components/WebhookService';
import styled from 'styled-components';

const DangerText = styled.span`
  color: ${getPatternflyColor('danger')};
`;

const DeletedDetail = () => {
  const { t } = useTranslation();
  return <DangerText>{t`Deleted`}</DangerText>;
};

function useInstanceGroups(templateId: string) {
  const { data } = useGet<{ results: InstanceGroup[] }>(
    awxAPI`/job_templates/${templateId}/instance_groups/`
  );
  return data?.results ?? [];
}

export function TemplateDetails(props: { templateId?: string; disableScroll?: boolean }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const urlId = props?.templateId ? props.templateId : params.id;
  const { error, data: template, refresh } = useGetItem<JobTemplate>(awxAPI`/job_templates`, urlId);
  const instanceGroups = useInstanceGroups(urlId || '0');
  const getPageUrl = useGetPageUrl();
  const history = useNavigate();

  const verbosity: string = useVerbosityString(template?.verbosity);
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!template) return <LoadingPage breadcrumbs tabs />;
  const { summary_fields: summaryFields, ask_inventory_on_launch: askInventoryOnLaunch } = template;

  const showOptionsField =
    template.become_enabled ||
    template.host_config_key ||
    template.allow_simultaneous ||
    template.use_fact_cache ||
    template.webhook_service ||
    template.prevent_instance_group_fallback;

  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };

  return (
    <PageDetails disableScroll={props.disableScroll}>
      <PageDetail label={t('Name')}>
        {props.templateId ? (
          <Link to={getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: props.templateId } })}>
            {template.name}
          </Link>
        ) : (
          template.name
        )}
      </PageDetail>
      <PageDetail label={t('Description')}>{template.description}</PageDetail>
      <PageDetail
        label={t('Job type')}
        helpText={t(
          'For job templates, select run to execute the playbook. Select check to only check playbook syntax, test environment setup, and report problems without executing the playbook.'
        )}
      >
        {template.job_type}
      </PageDetail>
      <PageDetail label={t('Organization')}>
        {summaryFields.organization ? (
          <Link
            to={getPageUrl(AwxRoute.OrganizationDetails, {
              params: { id: template.summary_fields?.organization?.id },
            })}
          >
            {summaryFields.organization?.name}
          </Link>
        ) : (
          <DeletedDetail />
        )}
      </PageDetail>
      <PageDetail
        label={t('Inventory')}
        isEmpty={!summaryFields.inventory && askInventoryOnLaunch}
        helpText={t('Select the inventory containing the hosts you want this job to manage.')}
      >
        {summaryFields.inventory ? (
          <Link
            to={getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: summaryFields.inventory?.id,
                inventory_type: inventoryUrlPaths[summaryFields.inventory?.kind],
              },
            })}
          >
            {summaryFields.inventory?.name}
          </Link>
        ) : (
          <DeletedDetail />
        )}
      </PageDetail>
      <PageDetail
        label={t`Project`}
        helpText={t('Select the project containing the playbook you want this job to execute.')}
      >
        {summaryFields.project ? (
          <Link
            to={getPageUrl(AwxRoute.ProjectDetails, { params: { id: summaryFields.project?.id } })}
          >
            {summaryFields.project?.name}
          </Link>
        ) : (
          <DeletedDetail />
        )}
      </PageDetail>
      <PageDetail
        label={t`Execution environment`}
        isEmpty={!summaryFields.resolved_environment}
        helpText={t(
          'The execution environment that will be used when launching this job template. The resolved execution environment can be overridden by explicitly assigning a different one to this job template.'
        )}
      >
        <Link
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: { id: summaryFields.resolved_environment?.id },
          })}
        >
          {summaryFields.resolved_environment?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{template.scm_branch}</PageDetail>
      <PageDetail
        label={t('Playbook')}
        helpText={t('Select the playbook to be executed by this job.')}
      >
        {template.playbook}
      </PageDetail>
      <PageDetail label={t('Credentials')} isEmpty={!summaryFields.credentials?.length}>
        <LabelGroup>
          {summaryFields.credentials?.map((credential) => (
            <CredentialLabel credential={credential} key={credential.id} />
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t`Instance groups`}
        helpText={t`The instance groups for this job template to run on.`}
        isEmpty={!instanceGroups?.length}
      >
        <LabelGroup>
          {instanceGroups?.map((ig) => (
            <Label color="blue" key={ig.id}>
              <Link
                to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                  params: {
                    id: ig.id,
                  },
                })}
              >
                {ig.name}
              </Link>
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t('Forks')}
        helpText={
          <span>
            {t(
              `The number of parallel or simultaneous processes to use while executing the playbook. An empty value, or a value less than 1 will use the Ansible default which is usually 5. The default number of forks can be overwritten with a change to`
            )}{' '}
            <code>ansible.cfg</code>.{' '}
            {t(`Refer to the Ansible documentation for details about the configuration file.`)}
          </span>
        }
      >
        {template.forks || 0}
      </PageDetail>
      <PageDetail label={t('Limit')}>{template.limit}</PageDetail>
      <PageDetail
        label={t('Verbosity')}
        helpText={t('Control the level of output ansible will produce as the playbook executes.')}
      >
        {verbosity}
      </PageDetail>
      <PageDetail
        label={t('Timeout')}
        helpText={t(
          'The amount of time (in seconds) to run before the job is canceled. Defaults to 0 for no job timeout.'
        )}
      >
        {template.timeout || 0}
      </PageDetail>
      <PageDetail
        label={t('Show changes')}
        helpText={t(
          `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible's --diff mode.`
        )}
      >
        {template.diff_mode ? t`On` : t`Off`}
      </PageDetail>
      <PageDetail
        label={t('Job slicing')}
        helpText={t(
          'Divide the work done by this job template into the specified number of job slices, each running the same tasks against a portion of the inventory.'
        )}
      >
        {template.job_slice_count}
      </PageDetail>
      <PageDetail label={t('Host config key')}>{template.host_config_key}</PageDetail>
      <PageDetail label={t('Provisioning callback URL')} isEmpty={!template.host_config_key}>
        {`${window.location.origin} ${template.url}callback/`}
      </PageDetail>
      <PageDetail label={t('Webhook service')} isEmpty={!template.webhook_service}>
        <WebhookService service={template.webhook_service} />
      </PageDetail>
      {summaryFields.webhook_credential && (
        <PageDetail label={t('Webhook credential')} isEmpty={!summaryFields.webhook_credential}>
          <CredentialLabel credential={summaryFields?.webhook_credential} />
        </PageDetail>
      )}
      <UserDateDetail
        label={t('Created')}
        date={template.created}
        user={template.summary_fields.created_by}
      />
      <LastModifiedPageDetail
        value={template.modified}
        author={template.summary_fields.modified_by?.username}
        onClick={() =>
          history(
            getPageUrl(AwxRoute.UserDetails, {
              params: { id: (template.summary_fields?.modified_by?.id ?? 0).toString() },
            })
          )
        }
      />
      <PageDetail label={t('Labels')} isEmpty={!summaryFields.labels?.results?.length}>
        <LabelGroup>
          {summaryFields.labels?.results?.map((label) => (
            <Label key={label.id}>{label.name}</Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Job tags')} isEmpty={!template.job_tags}>
        <LabelGroup>
          {template.job_tags.split(',')?.map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Skip tags')} isEmpty={!template.skip_tags}>
        <LabelGroup>
          {template.skip_tags.split(',')?.map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetailCodeEditor
        label={t('Extra variables')}
        value={template.extra_vars}
        helpText={t(
          'Pass extra command line variables to the playbook. This is the -e or --extra-vars command line parameter for ansible-playbook. Provide key/value pairs using either YAML or JSON. Refer to the documentation for example syntax.'
        )}
      />
      <PageDetail
        label={t('Enabled options')}
        isEmpty={!showOptionsField}
        helpText={
          <>
            <p>{t`Concurrent jobs: If enabled, simultaneous runs of this job template will be allowed.`}</p>
            <p>{t`Fact storage: If enabled, this will store gathered facts so they can be viewed at the host level. Facts are persisted and injected into the fact cache at runtime.`}</p>
            <p>{t`Privilege escalation: If enabled, run this playbook as an administrator.`}</p>
            <p>{t`Provisioning callbacks: Enables creation of a provisioning callback URL. Using the URL a host can contact Ansible AWX and request a configuration update using this job template.`}</p>
            <p>{t`Webhooks: Enable webhook for this template.`}</p>
            <p>{t`Prevent Instance Group Fallback: If enabled, the job template will prevent adding any inventory or organization instance groups to the list of preferred instances groups to run on.`}</p>
          </>
        }
      >
        <TextList component={TextListVariants.ul}>
          {template.become_enabled && (
            <TextListItem component={TextListItemVariants.li}>
              {t`Privilege Escalation`}
            </TextListItem>
          )}
          {template.host_config_key && (
            <TextListItem component={TextListItemVariants.li}>
              {t`Provisioning Callbacks`}
            </TextListItem>
          )}
          {template.allow_simultaneous && (
            <TextListItem component={TextListItemVariants.li}>{t`Concurrent jobs`}</TextListItem>
          )}
          {template.use_fact_cache && (
            <TextListItem component={TextListItemVariants.li}>{t`Fact storage`}</TextListItem>
          )}
          {template.webhook_service && (
            <TextListItem component={TextListItemVariants.li}>{t`Webhooks`}</TextListItem>
          )}
          {template.prevent_instance_group_fallback && (
            <TextListItem component={TextListItemVariants.li}>
              {t`Prevent instance group fallback`}
            </TextListItem>
          )}
        </TextList>
      </PageDetail>
    </PageDetails>
  );
}
