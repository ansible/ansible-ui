/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  Tooltip,
} from '@patternfly/react-core';
import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { StandardPopover } from '../../../../../framework/components/StandardPopover';
import { formatDateString } from '../../../../../framework/utils/dateTimeHelpers';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { StatusLabel } from '../../../../common/Status';
import { useGetItem } from '../../../../common/crud/useGet';
import { useOptions } from '../../../../common/crud/useOptions';
import { AwxError } from '../../../common/AwxError';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../../common/ExecutionEnvironmentDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';
import { useVerbosityString } from '../../../common/useVerbosityString';
import { InventorySource } from '../../../interfaces/InventorySource';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ansibleDocUrls } from '../../../main/ansibleDocsUrls';

export type WebsocketInventorySource = {
  status: string;
} & InventorySource;

export function InventorySourceDetails(props: {
  inventorySourceId?: string;
  disableScroll?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ source_id: string; id: string }>();
  const urlId = props?.inventorySourceId ? props.inventorySourceId : params.source_id;

  const getPageUrl = useGetPageUrl();
  const {
    data: inventorySource,
    error,
    refresh,
  } = useGetItem<InventorySource>(awxAPI`/inventory_sources/`, urlId);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventory_sources/`);
  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
            case 'workflow_job':
            case 'project_update':
            case 'inventory_update':
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

  const sourceChoices: Record<string, string> | null = {};
  if (data?.actions?.GET?.source?.choices?.length) {
    const { actions } = data;
    actions?.GET?.source?.choices?.forEach(([key, val]) => (sourceChoices[`${key}`] = val));
  }

  const verbosityString = useVerbosityString(inventorySource?.verbosity);
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventorySource) return <LoadingPage breadcrumbs tabs />;
  const { summary_fields, overwrite, overwrite_vars, update_on_launch, source } = inventorySource;
  let optionsList = null;
  if (overwrite || overwrite_vars || update_on_launch) {
    optionsList = (
      <TextList component={TextListVariants.ul}>
        {overwrite && (
          <TextListItem component={TextListItemVariants.li}>
            {t`Overwrite`}
            <StandardPopover
              header=""
              content={t(
                'If checked, any hosts and groups that were previously present on the external source but are now removed will be removed from the inventory. Hosts and groups that were not managed by the inventory source will be promoted to the next manually created group or if there is no manually created group to promote them into, they will be left in the "all" default group for the inventory. \n \n When not checked, local child hosts and groups not found on the external source will remain untouched by the inventory update process.'
              )}
            />
          </TextListItem>
        )}
        {overwrite_vars && (
          <TextListItem component={TextListItemVariants.li}>
            {t`Overwrite variables`}
            <StandardPopover
              header=""
              content={
                'If checked, all variables for child groups and hosts will be removed and replaced by those found on the external source. \n \n When not checked, a merge will be performed, combining local variables with those found on the external source.'
              }
            />
          </TextListItem>
        )}
        {update_on_launch && (
          <TextListItem component={TextListItemVariants.li}>
            {t`Update on launch`}
            <StandardPopover
              header=""
              content={t(
                'Each time a job runs using this inventory, refresh the inventory from the selected source before executing job tasks. This will ensure the most up-to-date inventory information is used during the job run.'
              )}
            />
          </TextListItem>
        )}
      </TextList>
    );
  }

  const getSourceVarsHelpText = (source: string) => {
    let sourceType = '';
    if (source && source !== 'scm') {
      const type: string[] = ansibleDocUrls[source].split(/[/,.]/);
      sourceType = type[type.length - 2];
    }

    return (
      <>
        <Trans>
          Variables used to configure the inventory source. For a detailed description of how to
          configure this plugin, see{' '}
          <a
            href={
              'https://docs.ansible.com/ansible/latest/plugins/inventory.html#inventory-plugins'
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Inventory Plugins
          </a>{' '}
          in the documentation and the{' '}
          <a href={ansibleDocUrls[source]} target="_blank" rel="noopener noreferrer">
            {sourceType}
          </a>{' '}
          plugin configuration guide.
        </Trans>
        <br />
        <br />
      </>
    );
  };
  const lastJob: { id: number; status: string; finished: string } =
    summary_fields.current_job || summary_fields.last_job;

  return (
    <PageDetails disableScroll={props.disableScroll}>
      <PageDetail label={t`Name`}>
        {props.inventorySourceId ? (
          <Link
            to={getPageUrl(AwxRoute.InventorySourceDetail, {
              params: {
                source_id: inventorySource.id,
                id: inventorySource?.inventory,
                inventory_type:
                  inventorySource?.summary_fields?.inventory.kind === ''
                    ? 'inventory'
                    : inventorySource?.summary_fields?.inventory.kind,
              },
            })}
          >
            {inventorySource.name}
          </Link>
        ) : (
          inventorySource.name
        )}
      </PageDetail>
      {lastJob ? (
        <PageDetail label={t`Last job status`}>
          <Tooltip
            position="top"
            content={lastJob ? <LastJobTooltip job={lastJob} /> : undefined}
            key={lastJob.id}
          >
            <Link
              to={getPageUrl(AwxRoute.JobOutput, {
                params: { id: lastJob.id, job_type: 'inventory' },
              })}
            >
              <StatusLabel status={lastJob.status} />
            </Link>
          </Tooltip>
        </PageDetail>
      ) : null}
      <PageDetail label={t`Description`}>{inventorySource.description}</PageDetail>
      <PageDetail label={t`Source`}>{sourceChoices[source]}</PageDetail>
      <PageDetail isEmpty={!summary_fields.organization} label={t`Organization`}>
        <Link
          to={getPageUrl(AwxRoute.OrganizationDetails, {
            params: { id: summary_fields.organization.id },
          })}
        >
          {summary_fields.organization.name}
        </Link>
      </PageDetail>
      {summary_fields.execution_environment ? (
        <ExecutionEnvironmentDetail
          isDefaultEnvironment={false}
          virtualEnvironment={inventorySource.custom_virtualenv ?? undefined}
          executionEnvironment={summary_fields.execution_environment}
        />
      ) : null}
      <PageDetail isEmpty={!summary_fields.source_project} label={t`Project`}>
        <Link
          to={getPageUrl(AwxRoute.ProjectDetails, {
            params: { id: summary_fields.source_project?.id },
          })}
        >
          {summary_fields?.source_project?.name}
        </Link>
      </PageDetail>
      <PageDetail
        isEmpty={!inventorySource.source}
        label={t`Inventory file`}
        helpText={t(
          'The inventory file to be synced by this source. You can select from the dropdown or enter a file within the input.'
        )}
      >
        {inventorySource.source_path === '' ? t`/ (project root)` : inventorySource.source_path}
      </PageDetail>
      <PageDetail
        label={t`Verbosity`}
        helpText={t(t`Control the level of output Ansible
        will produce for inventory source update jobs.`)}
      >
        {verbosityString}
      </PageDetail>
      <PageDetail
        label={t`Source control branch`}
        helpText={t(
          'Branch to use on inventory sync. Project default used if blank. Only allowed if project allow_override field is set to true.'
        )}
      >
        {inventorySource.scm_branch}
      </PageDetail>
      <PageDetail
        label={t`Cache timeout`}
        helpText={t(
          'Time in seconds to consider an inventory sync to be current. During job runs and callbacks the task system will evaluate the timestamp of the latest sync. If it is older than Cache Timeout, it is not considered current, and a new inventory sync will be performed.'
        )}
      >
        {`${inventorySource.update_cache_timeout} ${t`seconds`}`}
      </PageDetail>
      <PageDetail
        label={t`Host filter`}
        helpText={t(
          'Regular expression where only matching host names will be imported. The filter is applied as a post-processing step after any inventory plugin filters are applied.'
        )}
      >
        {inventorySource.host_filter}
      </PageDetail>
      <PageDetail
        label={t`Enabled variable`}
        helpText={t(`Retrieve the enabled state from the given dict of host variables.
        The enabled variable may be specified using dot notation, e.g: 'foo.bar'`)}
      >
        {inventorySource.enabled_var}
      </PageDetail>
      <PageDetail
        label={t`Enabled value`}
        helpText={t(
          'This field is ignored unless an Enabled Variable is set. If the enabled variable matches this value, the host will be enabled on import.'
        )}
      >
        {inventorySource.enabled_value}
      </PageDetail>
      <PageDetail label={t`Credential`} isEmpty={!summary_fields.credential}>
        <CredentialLabel credential={summary_fields.credential} />
      </PageDetail>
      {optionsList && <PageDetail label={t`Enabled options`}>{optionsList}</PageDetail>}
      <PageDetailCodeEditor
        label={t`Source variables`}
        helpText={getSourceVarsHelpText(inventorySource.source)}
        showCopyToClipboard
        data-cy="inventory-source-detail-variables"
        value={inventorySource.source_vars || '---'}
      />
      <PageDetail label={t`Created`}>
        <DateTimeCell
          value={inventorySource.created}
          author={summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, { params: { id: summary_fields?.created_by?.id } })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        value={inventorySource.modified}
        author={summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, { params: { id: summary_fields?.modified_by?.id } })
        }
      />
    </PageDetails>
  );
}

export function LastJobTooltip(props: { job: { id: number; status: string; finished: string } }) {
  const job = props.job;
  const { t } = useTranslation();

  return (
    <>
      <div>{t`MOST RECENT SYNC`}</div>
      <div>
        {t`JOB ID:`} {job.id}
      </div>
      <div>
        {t`STATUS:`} {job.status.toUpperCase()}
      </div>
      {job.finished && (
        <div>
          {t`FINISHED:`} {formatDateString(job.finished)}
        </div>
      )}
    </>
  );
}
