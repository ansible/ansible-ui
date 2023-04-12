import {
  ButtonVariant,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../Routes';
import { useGetItem } from '../../../common/crud/useGetItem';
import { AwxError } from '../../common/AwxError';
import { UserDateDetail } from '../../common/UserDateDetail';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { VisualizerTab } from './components/WorkflowJobTemplateVisualizer/VisualizerTab';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';

export function WorkflowJobTemplateDetail() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: template,
    refresh,
  } = useGetItem<WorkflowJobTemplate>('/api/v2/workflow_job_templates', params.id);
  const history = useNavigate();

  const deleteTemplates = useDeleteTemplates((deleted) => {
    if (deleted.length > 0) {
      history(RouteObj.Templates);
    }
  });

  const itemActions: IPageAction<WorkflowJobTemplate>[] = useMemo(() => {
    const itemActions: IPageAction<WorkflowJobTemplate>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit workflow template'),
        onClick: (template) =>
          history(RouteObj.EditTemplate.replace(':id', template?.id.toString() ?? '')),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete workflow template'),
        onClick: (template) => {
          if (!template) return;
          deleteTemplates([template]);
        },
      },
    ];
    return itemActions;
  }, [deleteTemplates, history, t]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[{ label: t('Templates'), to: RouteObj.Templates }, { label: template?.name }]}
        headerActions={
          <PageActions<WorkflowJobTemplate>
            actions={itemActions}
            position={DropdownPosition.right}
          />
        }
      />
      {template ? (
        <PageTabs>
          <PageTab label={t('Details')}>
            <TemplateDetailsTab template={template} />
          </PageTab>
          <PageTab label={t('Access')}>
            <TemplateAccessTab template={template} />
          </PageTab>
          <PageTab label={t('Visualizer')}>
            <WorkflowVisualizer template={template} />
          </PageTab>
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

function TemplateDetailsTab(props: { template: WorkflowJobTemplate }) {
  const { t } = useTranslation();
  const { template } = props;
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
      <PageDetail label={t('Job type')}>{template.job_type}</PageDetail>
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
        <Link
          to={RouteObj.InventoryDetails.replace(
            ':inventory_type',
            inventoryUrlPaths[summaryFields.inventory?.kind || '']
          ).replace(':id', summaryFields.inventory?.id.toString() ?? '')}
        >
          {summaryFields.inventory?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{template.scm_branch}</PageDetail>
      <PageDetail label={t('Limit')}>{template.limit}</PageDetail>
      <PageDetail label={t('Webhook service')} isEmpty={!template.webhook_service}>
        {template.webhook_service === 'github' ? t('GitHub') : t('GitLab')}
      </PageDetail>
      <PageDetail label={t('Webhook credential')} isEmpty={!summaryFields.webhook_credential}>
        <Link
          to={RouteObj.CredentialDetails.replace(':id', template.webhook_credential?.toString())}
        >
          {summaryFields.webhook_credential?.name}
        </Link>
      </PageDetail>
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
      <PageDetail label={t('Enabled options')} isEmpty={!showOptionsField}>
        <TextList component={TextListVariants.ul}>
          {template.allow_simultaneous && (
            <TextListItem component={TextListItemVariants.li}>{t`Concurrent Jobs`}</TextListItem>
          )}
          {template.webhook_service && (
            <TextListItem component={TextListItemVariants.li}>{t`Webhooks`}</TextListItem>
          )}
        </TextList>
      </PageDetail>
    </PageDetails>
  );
}

function TemplateAccessTab(props: { template: WorkflowJobTemplate }) {
  return <div>{props.template.name}</div>;
}

function WorkflowVisualizer(props: { template: WorkflowJobTemplate }) {
  return <VisualizerTab template={props.template} />;
}
