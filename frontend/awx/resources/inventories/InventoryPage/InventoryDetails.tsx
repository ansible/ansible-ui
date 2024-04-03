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
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetInventory } from './InventoryPage';

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

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{inventory.name}</PageDetail>
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
      <PageDetail label={t('Total hosts')}>{inventory.total_hosts}</PageDetail>
      <PageDetail label={t('Hosts with active failures')}>
        {inventory.hosts_with_active_failures}
      </PageDetail>
      <PageDetail label={t('Total groups')}>{inventory.total_groups}</PageDetail>
      <PageDetail label={t('Total inventory sources')}>
        {inventory.total_inventory_sources}
      </PageDetail>
      <PageDetail label={t('Inventory sources with active failures')}>
        {inventory.inventory_sources_with_failures}
      </PageDetail>
      {inventory.kind === 'constructed' && (
        <>
          <PageDetail label={t('Limit')}>{inventory.limit}</PageDetail>
          <PageDetail label={t('Verbosity')}>{verbosityString}</PageDetail>
          <PageDetail label={t('Update cache timeout')}>
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
      <PageDetail label={t`Labels`} isEmpty={inventory.summary_fields.labels.results.length === 0}>
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
        label={t('Variables')}
        showCopyToClipboard
        value={inventory.variables || '---'}
      />
    </PageDetails>
  );
}
