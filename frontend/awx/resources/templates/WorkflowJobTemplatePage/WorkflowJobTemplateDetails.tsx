import {
  Label,
  LabelGroup,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { RouteObj } from '../../../../common/Routes';

import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function WorkflowJobTemplateDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: template,
    error,
    refresh,
  } = useGetItem<WorkflowJobTemplate>('/api/v2/workflow_job_templates/', params.id);
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
    <PageDetails>
      <PageDetail label={t('Name')}>{template.name}</PageDetail>
      <PageDetail label={t('Description')}>{template.description}</PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!summaryFields.organization}>
        <Link
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            summaryFields.organization?.id.toString() ?? ''
          )}
        >
          {summaryFields.organization?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Inventory')} isEmpty={!summaryFields.inventory}>
        {summaryFields.inventory ? (
          <Link
            to={RouteObj.InventoryDetails.replace(
              ':inventory_type',
              inventoryUrlPaths[summaryFields.inventory.kind]
            ).replace(':id', summaryFields.inventory?.id.toString() ?? '')}
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
      <UserDateDetail
        label={t('Last modified')}
        date={template.modified}
        user={template.summary_fields.modified_by}
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
