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
import { LoadingPage, PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';

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
  const getPageUrl = useGetPageUrl();
  const history = useNavigate();
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
      <PageDetail label={t('Organization')} isEmpty={!summaryFields.organization}>
        <Link
          to={getPageUrl(AwxRoute.OrganizationPage, {
            params: { id: summaryFields.organization?.id },
          })}
        >
          {summaryFields.organization?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Inventory')} isEmpty={!summaryFields.inventory}>
        {summaryFields.inventory ? (
          <Link
            to={getPageUrl(AwxRoute.InventoryPage, {
              params: {
                id: summaryFields.inventory?.id,
                inventory_type: inventoryUrlPaths[summaryFields.inventory.kind],
              },
            })}
          >
            {summaryFields.inventory?.name}
          </Link>
        ) : null}
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
          {summaryFields.labels.results.map((label) => (
            <Label key={label.id}>{label.name}</Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Job tags')} isEmpty={!template.job_tags}>
        <LabelGroup>
          {template.job_tags?.split(',').map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Skip tags')} isEmpty={!template.skip_tags}>
        <LabelGroup>
          {template.skip_tags?.split(',').map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetailCodeEditor label={t('Extra vars')} value={template.extra_vars} />
      <PageDetail label={t('Enabled options')} isEmpty={!showOptionsField}>
        <TextList component={TextListVariants.ul}>
          {template.allow_simultaneous && (
            <TextListItem component={TextListItemVariants.li}>{t`Concurrent jobs`}</TextListItem>
          )}
          {template.webhook_service && (
            <TextListItem component={TextListItemVariants.li}>{t`Webhooks`}</TextListItem>
          )}
        </TextList>
      </PageDetail>
    </PageDetails>
  );
}
