import { LoadingPage, PageDetail, PageDetails, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Content, ContentVariants, Label, LabelGroup } from '@patternfly/react-core';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { toTitleCase } from '../../../common/util/strings';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { Sparkline } from '../components/Sparkline';
import { WebhookService } from '../components/WebhookService';

export function WorkflowJobTemplateDetails(props: {
  templateId?: string;
  disableScroll?: boolean;
}) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const urlId = props?.templateId ? props.templateId : params.id;
  const {
    data: template,
    error,
    refresh,
  } = useGetItem<WorkflowJobTemplate>(awxAPI`/workflow_job_templates/`, urlId);
  const { data: webhookKey } = useGet<{ webhook_key: string }>(template?.related?.webhook_key);
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!template) return <LoadingPage breadcrumbs tabs />;

  const { summary_fields: summaryFields } = template;

  const showOptionsField = template.allow_simultaneous || template.webhook_service;

  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };

  return (
    <PageDetails disableScroll={props.disableScroll}>
      <PageDetail label={t('Name')}>
        {props.templateId ? (
          <Link
            to={getPageUrl(AwxRoute.WorkflowJobTemplateDetails, {
              params: { id: props.templateId },
            })}
          >
            {template.name}
          </Link>
        ) : (
          template.name
        )}
      </PageDetail>
      <PageDetail label={t('Description')}>{template.description}</PageDetail>
      <PageDetail label={t('Type')}>{toTitleCase(template.type)}</PageDetail>
      <PageDetail
        label={t('Activity')}
        isEmpty={!summaryFields.recent_jobs?.length}
        helpText={t('Recent job runs for this workflow job template.')}
      >
        <Sparkline jobs={summaryFields.recent_jobs} />
      </PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!summaryFields.organization}>
        <Link
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: summaryFields.organization?.id },
          })}
        >
          {summaryFields.organization?.name}
        </Link>
      </PageDetail>
      <PageDetail
        label={t('Inventory')}
        helpText={t(
          'Select an inventory for the workflow. This inventory is applied to all workflow nodes that prompt for an inventory.'
        )}
        isEmpty={!summaryFields?.inventory}
      >
        {summaryFields?.inventory ? (
          <Link
            to={getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: summaryFields.inventory?.id,
                inventory_type: inventoryUrlPaths[summaryFields.inventory.kind],
              },
            })}
          >
            {summaryFields?.inventory?.name}
          </Link>
        ) : null}
      </PageDetail>
      <PageDetail
        label={t('Source control branch')}
        helpText={t(
          'Select a branch for the workflow. This branch is applied to all job template nodes that prompt for a branch.'
        )}
        isEmpty={!template.scm_branch}
      >
        {template.scm_branch}
      </PageDetail>
      <PageDetail
        label={t('Limit')}
        helpText={t(
          'Provide a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. Multiple patterns are allowed. Refer to Ansible documentation for more information and examples on patterns.'
        )}
        isEmpty={!template.limit}
      >
        {template.limit}
      </PageDetail>
      <PageDetail
        label={t('Webhook service')}
        helpText={t('Select a webhook service.')}
        isEmpty={!template.webhook_service}
      >
        <WebhookService service={template.webhook_service} />
      </PageDetail>
      <PageDetail
        label={t('Webhook URL')}
        helpText={t(
          'Webhook services can launch jobs with this workflow job template by making a POST request to this URL.'
        )}
        isEmpty={!webhookKey?.webhook_key}
      >
        {`${window.location.origin}${template.related.webhook_receiver}`}
      </PageDetail>
      <PageDetail
        label={t('Webhook key')}
        helpText={t('Webhook services can use this as a shared secret.')}
        isEmpty={!webhookKey?.webhook_key}
      >
        {webhookKey?.webhook_key}
      </PageDetail>
      {summaryFields.webhook_credential && (
        <PageDetail
          label={t('Webhook credential')}
          helpText={t(
            'Optionally select the credential to use to send status updates back to the webhook service.'
          )}
          isEmpty={!summaryFields.webhook_credential}
        >
          <CredentialLabel credential={summaryFields?.webhook_credential} />
        </PageDetail>
      )}
      <UserDateDetail
        label={t('Created')}
        date={template.created}
        user={template.summary_fields?.created_by}
      />
      <LastModifiedPageDetail
        value={template.modified}
        author={template.summary_fields.modified_by?.username}
        onClick={() => {
          Promise.resolve(
            navigate(
              getPageUrl(AwxRoute.UserDetails, {
                params: { id: (template.summary_fields?.modified_by?.id ?? 0).toString() },
              })
            )
          ).catch(() => {});
        }}
      />
      <PageDetail
        label={t('Labels')}
        helpText={t(
          "Optional labels that describe this workflow job template, such as 'dev' or 'test'. Labels can be used to group and filter workflow job templates and completed jobs."
        )}
        isEmpty={!summaryFields.labels?.results?.length}
      >
        <LabelGroup>
          {summaryFields.labels.results.map((label) => (
            <Label key={label.id}>{label.name}</Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t('Job tags')}
        helpText={t(
          'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        isEmpty={!template.job_tags}
      >
        <LabelGroup>
          {template.job_tags?.split(',').map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t('Skip tags')}
        helpText={t(
          'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        isEmpty={!template.skip_tags}
      >
        <LabelGroup>
          {template.skip_tags?.split(',').map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetailCodeEditor
        label={t('Variables')}
        value={template.extra_vars}
        helpText={t(
          'Pass extra command line variables to the playbook. This is the -e or --extra-vars command line parameter for ansible-playbook. Provide key/value pairs using either YAML or JSON. Refer to the Ansible Controller documentation for example syntax.'
        )}
      />
      <PageDetail
        label={t('Enabled options')}
        helpText={
          <Trans>
            <p>
              Concurrent jobs: If enabled, simultaneous runs of this workflow job template will be
              allowed.
            </p>
            <p>Webhooks: Enable Webhook for this workflow job template.</p>
          </Trans>
        }
        isEmpty={!showOptionsField}
      >
        <Content component={ContentVariants.ul}>
          {template.allow_simultaneous && (
            <Content component={ContentVariants.li}>{t`Concurrent jobs`}</Content>
          )}
          {template.webhook_service && (
            <Content component={ContentVariants.li}>{t`Webhooks`}</Content>
          )}
        </Content>
      </PageDetail>
    </PageDetails>
  );
}
