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
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Detail,
  DetailsList,
  IPageAction,
  PageActions,
  PageActionType,
  PageBody,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { Scrollable } from '../../../../framework/components/Scrollable';
import { UserDateDetail } from '../../common/UserDateDetail';
import { useItem } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { Template } from '../../interfaces/Template';
import { useDeleteTemplates } from './useDeleteTemplates';

export function TemplateDetail() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const template = useItem<Template>('/api/v2/job_templates', params.id ?? '0');
  const history = useNavigate();

  const deleteTemplates = useDeleteTemplates((deleted: Template[]) => {
    if (deleted.length > 0) {
      history(RouteE.Templates);
    }
  });

  const itemActions: IPageAction<Template>[] = useMemo(() => {
    const itemActions: IPageAction<Template>[] = [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit template'),
        onClick: () => history(RouteE.EditTemplate.replace(':id', template?.id.toString() ?? '')),
      },
      {
        type: PageActionType.button,
        icon: TrashIcon,
        label: t('Delete template'),
        onClick: () => {
          if (!template) return;
          deleteTemplates([template]);
        },
      },
    ];
    return itemActions;
  }, [deleteTemplates, history, template, t]);

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[{ label: t('Templates'), to: RouteE.Templates }, { label: template?.name }]}
        headerActions={
          <PageActions<Template> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      <PageBody>
        {template ? (
          <PageTabs>
            <PageTab title={t('Details')}>
              <TemplateDetailsTab template={template} />
            </PageTab>
            <PageTab title={t('Access')}>
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
      </PageBody>
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

function TemplateDetailsTab(props: { template: Template }) {
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
    <Scrollable>
      <PageSection variant="light">
        <DetailsList>
          <Detail label={t('Name')}>{template.name}</Detail>
          <Detail label={t('Description')}>{template.description}</Detail>
          <Detail label={t('Job type')}>{template.job_type}</Detail>
          <Detail label={t('Organization')} isEmpty={!summaryFields.organization}>
            <Link
              to={RouteE.OrganizationDetails.replace(
                ':id',
                summaryFields.organization?.id.toString() ?? ''
              )}
            >
              {summaryFields.organization?.name}
            </Link>
          </Detail>
          <Detail label={t('Inventory')} isEmpty={!summaryFields.inventory}>
            <Link
              to={RouteE.InventoryDetails.replace(
                ':id',
                summaryFields.inventory?.id.toString() ?? ''
              )}
            >
              {summaryFields.inventory?.name}
            </Link>
          </Detail>
          <Detail label={t`Project`} isEmpty={!summaryFields.project}>
            <Link
              to={RouteE.ProjectDetails.replace(':id', summaryFields.project?.id.toString() ?? '')}
            >
              {summaryFields.project?.name}
            </Link>
          </Detail>
          {/* TODO: more flushed out ExecutionEnvironmentDetail ? */}
          <Detail label={t`Execution environment`} isEmpty={!summaryFields.resolved_environment}>
            <Link
              to={RouteE.ExecutionEnvironmentDetails.replace(
                ':id',
                summaryFields.resolved_environment?.id.toString() ?? ''
              )}
            >
              {summaryFields.resolved_environment?.name}
            </Link>
          </Detail>
          <Detail label={t('Source control branch')}>{template.scm_branch}</Detail>
          <Detail label={t('Playbook')}>{template.playbook}</Detail>
          <Detail label={t('Forks')}>{template.forks || 0}</Detail>
          <Detail label={t('Limit')}>{template.limit}</Detail>
          <Detail label={t('Verbosity')}>{VERBOSITY(t, template.verbosity)}</Detail>
          <Detail label={t('Timeout')}>{template.timeout || 0}</Detail>
          <Detail label={t('Show changes')}>{template.diff_mode ? t`On` : t`Off`}</Detail>
          <Detail label={t('Job slicing')}>{template.job_slice_count}</Detail>
          <Detail label={t('Host config key')}>{template.host_config_key}</Detail>
          <Detail label={t('Provisioning callback URL')} isEmpty={!template.host_config_key}>
            {`${window.location.origin} ${template.url}callback/`}
          </Detail>
          <Detail label={t('Webhook service')} isEmpty={!template.webhook_service}>
            {template.webhook_service === 'github' ? t('GitHub') : t('GitLab')}
          </Detail>
          <Detail label={t('Webhook credential')} isEmpty={!summaryFields.webhook_credential}>
            <Link
              to={RouteE.CredentialDetails.replace(
                ':id',
                summaryFields.webhook_credential?.id.toString()
              )}
            >
              {summaryFields.webhook_credential?.name}
            </Link>
          </Detail>
          <Detail label={t('Prevent instance group fallback')}>
            {template.prevent_instance_group_fallback ? t`On` : ''}
          </Detail>
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
          <Detail label={t('Enabled options')} isEmpty={!showOptionsField}>
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
                <TextListItem component={TextListItemVariants.li}>
                  {t`Concurrent Jobs`}
                </TextListItem>
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
          </Detail>
        </DetailsList>
      </PageSection>
    </Scrollable>
  );
}

function TemplateAccessTab(props: { template: Template }) {
  return <div>{props.template.name}</div>;
}
