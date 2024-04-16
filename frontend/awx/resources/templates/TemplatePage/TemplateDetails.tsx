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
      <PageDetail label={t('Job type')}>{template.job_type}</PageDetail>
      <PageDetail label={t('Organization')}>
        {summaryFields.organization ? (
          <Link
            to={getPageUrl(AwxRoute.OrganizationPage, {
              params: { id: template.summary_fields?.organization?.id },
            })}
          >
            {summaryFields.organization?.name}
          </Link>
        ) : (
          <DeletedDetail />
        )}
      </PageDetail>
      <PageDetail label={t('Inventory')} isEmpty={!summaryFields.inventory && askInventoryOnLaunch}>
        {summaryFields.inventory ? (
          <Link
            to={getPageUrl(AwxRoute.InventoryPage, {
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
      <PageDetail label={t`Project`}>
        {summaryFields.project ? (
          <Link
            to={getPageUrl(AwxRoute.ProjectPage, { params: { id: summaryFields.project?.id } })}
          >
            {summaryFields.project?.name}
          </Link>
        ) : (
          <DeletedDetail />
        )}
      </PageDetail>
      {/* TODO: more flushed out ExecutionEnvironmentDetail ? */}
      <PageDetail label={t`Execution environment`} isEmpty={!summaryFields.resolved_environment}>
        <Link
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: { id: summaryFields.resolved_environment?.id },
          })}
        >
          {summaryFields.resolved_environment?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{template.scm_branch}</PageDetail>
      <PageDetail label={t('Playbook')}>{template.playbook}</PageDetail>
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
                  params: { id: ig.id },
                })}
              >
                {ig.name}
              </Link>
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Forks')}>{template.forks || 0}</PageDetail>
      <PageDetail label={t('Limit')}>{template.limit}</PageDetail>
      <PageDetail label={t('Verbosity')}>{verbosity}</PageDetail>
      <PageDetail label={t('Timeout')}>{template.timeout || 0}</PageDetail>
      <PageDetail label={t('Show changes')}>{template.diff_mode ? t`On` : t`Off`}</PageDetail>
      <PageDetail label={t('Job slicing')}>{template.job_slice_count}</PageDetail>
      <PageDetail label={t('Host config key')}>{template.host_config_key}</PageDetail>
      <PageDetail label={t('Provisioning callback URL')} isEmpty={!template.host_config_key}>
        {`${window.location.origin} ${template.url}callback/`}
      </PageDetail>
      <PageDetail label={t('Webhook service')} isEmpty={!template.webhook_service}>
        {template.webhook_service === 'github' ? t('GitHub') : t('GitLab')}
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
      <PageDetailCodeEditor label={t('Extra vars')} value={template.extra_vars} />
      <PageDetail label={t('Enabled options')} isEmpty={!showOptionsField}>
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
