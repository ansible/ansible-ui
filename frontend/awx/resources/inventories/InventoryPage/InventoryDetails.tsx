/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Label,
  LabelGroup,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { PageDetail, PageDetails, SinceCell, TextCell } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { RouteObj } from '../../../../Routes';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Inventory } from '../../../interfaces/Inventory';
import { useVerbosityString } from '../../../common/useVerbosityString';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { useEffect, useState } from 'react';

function useInstanceGroups(inventoryId: string) {
  const { data } = useGet<{ results: InstanceGroup[] }>(
    `/api/v2/inventories/${inventoryId}/instance_groups/`
  );
  return data?.results ?? [];
}

export function InventoryDetails(props: { inventory: Inventory }) {
  const { t } = useTranslation();
  const { inventory } = props;
  const history = useNavigate();
  const params = useParams<{ id: string }>();
  const [inputInventories, setInputInventories] = useState<Inventory[]>([]);
  const [inputInventoriesError, setInputInventoriesError] = useState<string>();
  const instanceGroups = useInstanceGroups(params.id || '0');

  useEffect(() => {
    async function handleFetchInputInventories() {
      if (inventory.kind === 'constructed') {
        const inputInventories = await requestGet<ItemsResponse<Inventory>>(
          `/api/v2/inventories/${inventory.id}/input_inventories/`
        );
        return setInputInventories(inputInventories.results);
      }
    }
    handleFetchInputInventories().catch(() =>
      setInputInventoriesError(t('There was an error fetching the input inventories'))
    );
  }, [inventory.id, inventory.kind, t]);

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
          to={RouteObj.OrganizationDetails.replace(
            ':id',
            (inventory.summary_fields?.organization?.id ?? '').toString()
          )}
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
      <PageDetail label={t('Limit')}>{inventory.limit}</PageDetail>
      <PageDetail label={t('Verbosity')}>{useVerbosityString(inventory.verbosity)}</PageDetail>
      <PageDetail label={t('Update cache timeout')}>{inventory.update_cache_timeout}</PageDetail>
      <PageDetail label={t`Instance groups`} isEmpty={instanceGroups.length === 0}>
        <LabelGroup>
          {instanceGroups.map((ig) => (
            <Label color="blue" key={ig.id}>
              <Link to={RouteObj.InstanceGroupDetails.replace(':id', (ig.id ?? 0).toString())}>
                {ig.name}
              </Link>
            </Label>
          ))}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t`Input inventories`} isEmpty={inputInventories.length === 0}>
        {inputInventoriesError ? (
          inputInventoriesError
        ) : (
          <LabelGroup>
            {inputInventories.map((inventory) => (
              <Label color="blue" key={inventory.id}>
                <Link
                  to={RouteObj.InventoryDetails.replace(
                    ':inventory_type',
                    inventoryUrlPaths[inventory.kind]
                  ).replace(':id', (inventory.id ?? 0).toString())}
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
        <SinceCell
          value={inventory.created}
          author={inventory.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (inventory.summary_fields?.created_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <SinceCell
          value={inventory.modified}
          author={inventory.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              RouteObj.UserDetails.replace(
                ':id',
                (inventory.summary_fields?.modified_by?.id ?? 0).toString()
              )
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Enabled options')} isEmpty={!inventory.prevent_instance_group_fallback}>
        <TextList component={TextListVariants.ul}>
          {inventory.prevent_instance_group_fallback && (
            <TextListItem component={TextListItemVariants.li}>
              {t`Prevent instance group fallback`}
            </TextListItem>
          )}
        </TextList>
      </PageDetail>
    </PageDetails>
  );
}
