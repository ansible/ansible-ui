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
import { EditIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { useItem } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { handleLaunch } from '../../common/util/launchHandlers';
import { UserDateDetail } from '../../common/UserDateDetail';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { useDeleteTemplates } from './hooks/useDeleteTemplates';

export function TemplateDetail() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const template = useItem<JobTemplate>('/api/v2/job_templates', params.id ?? '0');
  const navigate = useNavigate();

  const deleteTemplates = useDeleteTemplates((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteE.Templates);
    }
  });
  // async function launchJob(type: string, id: number) {
  //   try {
  //     const launchedJob = await handleLaunch(template?.type as string, template?.id as number);
  //     navigate(
  //       RouteE.JobOutput.replace(':job_type', launchedJob?.type as string).replace(
  //         ':id',
  //         launchedJob?.id.toString() as string
  //       )
  //     );
  //   } catch {
  //     // handle error
  //   }
  // }

  const itemActions: IPageAction<JobTemplate>[] = useMemo(() => {
    const itemActions: IPageAction<JobTemplate>[] = [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit template'),
        ouiaId: 'job-template-detail-edit-button',
        onClick: () => navigate(RouteE.EditTemplate.replace(':id', template?.id.toString() ?? '')),
      },
      {
        type: PageActionType.button,
        icon: TrashIcon,
        label: t('Delete template'),
        onClick: () => {
          if (!template) return;
          deleteTemplates([template]);
        },
        ouiaId: 'job-template-detail-delete-button',
        isDanger: true,
      },
      {
        type: PageActionType.button,
        icon: RocketIcon,
        label: t('Launch template'),
        onClick: async () => {
          try {
            const data = await handleLaunch(template?.type as string, template?.id as number);
            navigate(
              `/controller/jobs/${data?.type as string}/output/${data?.id.toString() as string}`
            );
          } catch {
            // handle error
          }
        },
        ouiaId: 'job-template-detail-launch-button',
        isDanger: false,
      },
    ];
    return itemActions;
  }, [deleteTemplates, navigate, template, t]);

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[{ label: t('Templates'), to: RouteE.Templates }, { label: template?.name }]}
        headerActions={
          <PageActions<JobTemplate> actions={itemActions} position={DropdownPosition.right} />
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

// TODO centralize this utility somewhere
const VERBOSITY = (t: (arg0: string) => string, value: number): string => {
  switch (value) {
    case 0:
      return t('0 (Normal)');
    case 1:
      return t('1 (Verbose)');
    case 2:
      return t('2 (More Verbose)');
    case 3:
      return t('3 (Debug)');
    case 4:
      return t('4 (Connection Debug)');
    case 5:
      return t('5 (WinRM Debug)');
    default:
      return '';
  }
};

function TemplateDetailsTab(props: { template: JobTemplate }) {
  const { t } = useTranslation();
  const { template } = props;
  const { summary_fields: summaryFields } = template;

  const showOptionsField =
    template.become_enabled ||
    template.host_config_key ||
    template.allow_simultaneous ||
    template.use_fact_cache ||
    template.webhook_service ||
    template.prevent_instance_group_fallback;

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{template.name}</PageDetail>
      <PageDetail label={t('Description')}>{template.description}</PageDetail>
      <PageDetail label={t('Job type')}>{template.job_type}</PageDetail>
      <PageDetail label={t('Organization')} isEmpty={!summaryFields.organization}>
        <Link
          to={RouteE.OrganizationDetails.replace(
            ':id',
            summaryFields.organization?.id.toString() ?? ''
          )}
        >
          {summaryFields.organization?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Inventory')} isEmpty={!summaryFields.inventory}>
        <Link
          to={RouteE.InventoryDetails.replace(':id', summaryFields.inventory?.id.toString() ?? '')}
        >
          {summaryFields.inventory?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t`Project`} isEmpty={!summaryFields.project}>
        <Link to={RouteE.ProjectDetails.replace(':id', summaryFields.project?.id.toString() ?? '')}>
          {summaryFields.project?.name}
        </Link>
      </PageDetail>
      {/* TODO: more flushed out ExecutionEnvironmentDetail ? */}
      <PageDetail label={t`Execution environment`} isEmpty={!summaryFields.resolved_environment}>
        <Link
          to={RouteE.ExecutionEnvironmentDetails.replace(
            ':id',
            summaryFields.resolved_environment?.id.toString() ?? ''
          )}
        >
          {summaryFields.resolved_environment?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Source control branch')}>{template.scm_branch}</PageDetail>
      <PageDetail label={t('Playbook')}>{template.playbook}</PageDetail>
      <PageDetail label={t('Forks')}>{template.forks || 0}</PageDetail>
      <PageDetail label={t('Limit')}>{template.limit}</PageDetail>
      <PageDetail label={t('Verbosity')}>{VERBOSITY(t, template.verbosity)}</PageDetail>
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
      <PageDetail label={t('Webhook credential')} isEmpty={!summaryFields.webhook_credential}>
        <Link
          to={RouteE.CredentialDetails.replace(
            ':id',
            summaryFields.webhook_credential?.id.toString()
          )}
        >
          {summaryFields.webhook_credential?.name}
        </Link>
      </PageDetail>
      <PageDetail label={t('Prevent instance group fallback')}>
        {template.prevent_instance_group_fallback ? t`On` : ''}
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
            <TextListItem component={TextListItemVariants.li}>{t`Concurrent Jobs`}</TextListItem>
          )}
          {template.use_fact_cache && (
            <TextListItem component={TextListItemVariants.li}>{t`Fact Storage`}</TextListItem>
          )}
          {template.webhook_service && (
            <TextListItem component={TextListItemVariants.li}>{t`Webhooks`}</TextListItem>
          )}
          {template.prevent_instance_group_fallback && (
            <TextListItem component={TextListItemVariants.li}>
              {t`Prevent Instance Group Fallback`}
            </TextListItem>
          )}
        </TextList>
      </PageDetail>
    </PageDetails>
  );
}

function TemplateAccessTab(props: { template: JobTemplate }) {
  return <div>{props.template.name}</div>;
}
