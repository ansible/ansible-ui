/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useVerbosityString } from '../../../common/useVerbosityString';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetInventory } from './InventoryPage';
import { InventorySource } from '../../../interfaces/InventorySource';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Tooltip } from '@patternfly/react-core';
import { LastJobTooltip } from '../inventorySources/InventorySourceDetails';
import { StatusLabel } from '../../../../common/Status';
import { useInventoryFormDetailLabels } from '../InventoryForm';
import { LabelHelp } from '../components/LabelHelp';

function useInstanceGroups(inventoryId: string) {
  const { data } = useGet<{ results: InstanceGroup[] }>(
    awxAPI`/inventories/${inventoryId}/instance_groups/`
  );
  return data?.results ?? [];
}

export function InventoryDetails() {
  const params = useParams<{ id: string; inventory_type: string }>();
  const inventory = useGetInventory(params.id, params.inventory_type);

  if (!inventory) {
    return null;
  }

  return <InventoryDetailsInner inventory={inventory} />;
}

export function InventoryDetailsInner(props: { inventory: Inventory }) {
  const { t } = useTranslation();
  const { inventory } = props;
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const instanceGroups = useInstanceGroups(params.id || '0');
  const verbosityString = useVerbosityString(inventory.verbosity);
  const getPageUrl = useGetPageUrl();

  const { data: inputInventories, error: inputInventoriesError } = useGet<{ results: Inventory[] }>(
    inventory.kind === 'constructed'
      ? awxAPI`/inventories/${inventory.id.toString()}/input_inventories/`
      : ''
  );

  const inventoryTypes: { [key: string]: string } = {
    '': t('Inventory'),
    smart: t('Smart inventory'),
    constructed: t('Constructed inventory'),
  };

  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };

  const inventorySourceUrl =
    inventory.kind === 'constructed'
      ? awxAPI`/inventories/${params.id ?? ''}/inventory_sources/`
      : '';

  const inventoryFormDetailLables = useInventoryFormDetailLabels();
  const inventorySourceRequest = useGet<AwxItemsResponse<InventorySource>>(inventorySourceUrl);

  const inventorySourceData = inventorySourceRequest.data?.results[0];

  const inventorySourceSyncJob =
    inventorySourceData?.summary_fields?.current_job ||
    inventorySourceData?.summary_fields?.last_job ||
    undefined;

  if (inputInventoriesError) {
    return <AwxError error={inputInventoriesError} />;
  }

  if (inventorySourceRequest.error) {
    return <AwxError error={inventorySourceRequest.error} />;
  }

  if (inventory.kind === 'constructed' && !inventorySourceData && !inventorySourceRequest.data) {
    return <AwxError error={new Error(t('Inventory source not found'))} />;
  }

  if (
    inventory.kind === 'constructed' &&
    ((!inventorySourceRequest.data && !inventorySourceRequest.error) ||
      (!inputInventories && !inputInventoriesError))
  ) {
    return <LoadingPage />;
  }

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{inventory.name}</PageDetail>
      {inventory.kind === 'constructed' && <JobStatusLabel job={inventorySourceSyncJob} />}
      <PageDetail label={t('Description')}>{inventory.description}</PageDetail>
      <PageDetail label={t('Type')}>{inventoryTypes[inventory.kind]}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={inventory.summary_fields?.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationPage, {
            params: { id: inventory.summary_fields?.organization?.id },
          })}
        />
      </PageDetail>
      <PageDetail label={t('Smart host filter')} isEmpty={inventory.kind !== 'smart'}>
        <LabelGroup>
          <Label>{inventory.host_filter}</Label>
        </LabelGroup>
      </PageDetail>
      <PageDetail
        label={t('Total hosts')}
        helpText={t(
          `This field is deprecated and will be removed in a future release. Total number of hosts in this inventory.`
        )}
      >
        {inventory.total_hosts}
      </PageDetail>
      <PageDetail label={t('Hosts with active failures')}>
        {inventory.hosts_with_active_failures}
      </PageDetail>
      <PageDetail
        label={t('Total groups')}
        helpText={t(
          `This field is deprecated and will be removed in a future release. Total number of groups in this inventory.`
        )}
      >
        {inventory.total_groups}
      </PageDetail>
      <PageDetail
        label={t('Total inventory sources')}
        helpText={t(`Total number of external inventory sources configured within this inventory.`)}
      >
        {inventory.total_inventory_sources}
      </PageDetail>
      <PageDetail
        label={t('Inventory sources with active failures')}
        helpText={t(`Number of external inventory sources in this inventory with failures.`)}
      >
        {inventory.inventory_sources_with_failures}
      </PageDetail>
      {inventory.kind === 'constructed' && (
        <>
          <PageDetail label={t('Limit')} helpText={inventoryFormDetailLables.limit}>
            {inventory.limit}
          </PageDetail>
          <PageDetail label={t('Verbosity')} helpText={inventoryFormDetailLables.verbosity}>
            {verbosityString}
          </PageDetail>
          <PageDetail
            label={t('Update cache timeout')}
            helpText={inventoryFormDetailLables.cache_timeout}
          >
            {inventory.update_cache_timeout}
          </PageDetail>
        </>
      )}
      <PageDetail label={t`Instance groups`} isEmpty={instanceGroups.length === 0}>
        <LabelGroup>
          {instanceGroups.map((ig) => (
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
      <PageDetail
        label={t`Input inventories`}
        isEmpty={
          typeof inputInventoriesError === 'undefined' &&
          (!inputInventories || inputInventories?.results.length === 0)
        }
      >
        {inputInventoriesError ? (
          t`There was an error fetching the input inventories`
        ) : (
          <LabelGroup>
            {inputInventories?.results.map((inventory) => (
              <Label color="blue" key={inventory.id}>
                <Link
                  to={getPageUrl(AwxRoute.InventoryDetails, {
                    params: {
                      inventory_type: inventoryUrlPaths[inventory.kind],
                      id: inventory.id,
                    },
                  })}
                >
                  {inventory.name}
                </Link>
              </Label>
            ))}
          </LabelGroup>
        )}
      </PageDetail>
      <PageDetail
        label={t`Labels`}
        isEmpty={inventory.summary_fields.labels.results.length === 0}
        helpText={inventoryFormDetailLables.labels}
      >
        <LabelGroup>
          {inventory.summary_fields.labels.results.map((label) => (
            <Label color="blue" key={label.id}>
              {label.name}
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell
          value={inventory.created}
          author={inventory.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: inventory.summary_fields?.created_by?.id },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        value={inventory.modified}
        author={inventory.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: inventory.summary_fields?.modified_by?.id },
          })
        }
      />
      <PageDetail label={t('Enabled options')} isEmpty={!inventory.prevent_instance_group_fallback}>
        <TextList component={TextListVariants.ul}>
          {inventory.prevent_instance_group_fallback && (
            <TextListItem component={TextListItemVariants.li}>
              {t`Prevent instance group fallback`}
            </TextListItem>
          )}
        </TextList>
      </PageDetail>
      <PageDetailCodeEditor
        helpText={<LabelHelp inventoryKind={inventory.kind} />}
        label={t('Variables')}
        showCopyToClipboard
        value={inventory.variables || '---'}
      />
    </PageDetails>
  );
}

function JobStatusLabel(props: {
  job:
    | {
        description: string;
        failed: boolean;
        finished: string;
        id: number;
        license_error: boolean;
        name: string;
        status: string;
      }
    | undefined;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const lastJob = props.job;
  if (!lastJob) {
    return null;
  }

  return (
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
  );
}
