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
import { ConstructedInventory, Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InventorySource } from '../../../interfaces/InventorySource';
import { AwxError } from '../../../common/AwxError';
import { Tooltip } from '@patternfly/react-core';
import { LastJobTooltip } from '../inventorySources/InventorySourceDetails';
import { StatusLabel } from '../../../../common/Status';
import { useInventoryFormDetailLabels } from '../InventoryForm';
import { LabelHelp } from '../components/LabelHelp';
import { useOutletContext } from 'react-router-dom';
import { useInventoryTypes } from '../hooks/useInventoryTypes';
import { INVENTORYURLPATHS } from '../constants';

function useInstanceGroups(inventoryId: string) {
  const { data } = useGet<{ results: InstanceGroup[] }>(
    awxAPI`/inventories/${inventoryId}/instance_groups/`
  );
  return data?.results ?? [];
}

export function InventoryDetails() {
  const { inventory } = useOutletContext<{ inventory: InventoryWithSource }>();

  if (!inventory) {
    return null;
  }

  return <InventoryDetailsInner inventory={inventory} />;
}

export type InventoryWithSource = Inventory & { source?: InventorySource };

export function InventoryDetailsInner(props: { inventory: InventoryWithSource }) {
  const { t } = useTranslation();
  const inventoryTypes = useInventoryTypes();
  const inventory = props.inventory;
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();
  const instanceGroups = useInstanceGroups(params.id || '0');
  const verbosityString = useVerbosityString(inventory.verbosity);
  const getPageUrl = useGetPageUrl();

  const { data: inputInventories, error: inputInventoriesError } = useGet<{ results: Inventory[] }>(
    inventory.kind === 'constructed'
      ? awxAPI`/inventories/${inventory.id.toString()}/input_inventories/`
      : ''
  );

  const inventorySourceData = inventory.source;

  const inventoryFormDetailLables = useInventoryFormDetailLabels();

  const inventorySourceSyncJob =
    inventorySourceData?.summary_fields?.current_job ||
    inventorySourceData?.summary_fields?.last_job ||
    undefined;

  if (inputInventoriesError) {
    return <AwxError error={inputInventoriesError} />;
  }

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{inventory.name}</PageDetail>
      <PageDetailJobStatus
        job={inventorySourceSyncJob}
        isEmpty={inventory.kind !== 'constructed'}
      />
      <PageDetail label={t('Description')}>{inventory.description}</PageDetail>
      <PageDetail label={t('Type')}>{inventoryTypes[inventory.kind]}</PageDetail>
      <PageDetail label={t('Organization')}>
        <TextCell
          text={inventory.summary_fields?.organization?.name}
          to={getPageUrl(AwxRoute.OrganizationDetails, {
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
      <PageDetail
        label={t('Hosts with active failures')}
        isEmpty={inventory.kind !== 'constructed' || inventory.hosts_with_active_failures === 0}
      >
        {inventory.hosts_with_active_failures}
      </PageDetail>
      <PageDetail
        label={t('Total groups')}
        helpText={t(
          `This field is deprecated and will be removed in a future release. Total number of groups in this inventory.`
        )}
        isEmpty={inventory.kind !== 'constructed'}
      >
        {inventory.total_groups}
      </PageDetail>
      <PageDetail
        label={t('Total inventory sources')}
        helpText={t(`Total number of external inventory sources configured within this inventory.`)}
        isEmpty={inventory.kind !== 'constructed'}
      >
        {inventory.total_inventory_sources}
      </PageDetail>
      <PageDetail
        label={t('Inventory sources with active failures')}
        helpText={t(`Number of external inventory sources in this inventory with failures.`)}
        isEmpty={inventory.kind !== 'constructed'}
      >
        {inventory.inventory_sources_with_failures}
      </PageDetail>
      <PageDetail
        label={t('Limit')}
        helpText={inventoryFormDetailLables.limit}
        isEmpty={inventory.kind !== 'constructed'}
      >
        {(inventory as ConstructedInventory).limit}
      </PageDetail>
      <PageDetail
        label={t('Verbosity')}
        helpText={inventoryFormDetailLables.verbosity}
        isEmpty={inventory.kind !== 'constructed'}
      >
        {verbosityString}
      </PageDetail>
      <PageDetail
        label={t('Update cache timeout')}
        helpText={inventoryFormDetailLables.cache_timeout}
        isEmpty={inventory.kind !== 'constructed'}
      >
        {(inventory as ConstructedInventory).update_cache_timeout}
      </PageDetail>
      <PageDetail label={t`Instance groups`} isEmpty={instanceGroups.length === 0}>
        <LabelGroup>
          {instanceGroups.map((ig) => (
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
        label={t`Input inventories`}
        helpText={inventoryFormDetailLables.input_inventories}
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
                      inventory_type: INVENTORYURLPATHS[inventory.kind],
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
      <PageDetail
        label={t('Enabled options')}
        isEmpty={!inventory.prevent_instance_group_fallback}
        helpText={inventoryFormDetailLables.prevent_instance_group_fallback}
      >
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
        label={inventory.kind === 'constructed' ? t('Source variables') : t('Variables')}
        showCopyToClipboard
        value={
          inventory.kind === 'constructed'
            ? inventory.source_vars || '---'
            : inventory.variables || '---'
        }
      />
    </PageDetails>
  );
}

function PageDetailJobStatus(props: {
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
  isEmpty?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const lastJob = props.job;
  if (!lastJob) {
    return null;
  }

  return (
    <PageDetail label={t`Last job status`} isEmpty={props.isEmpty}>
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
