import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DateTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';

export function useMappingColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  return useMemo<ITableColumn<AuthenticatorMap>[]>(
    () => [
      {
        header: t('Order'),
        type: 'text',
        value: (map) => map.order.toString(),
        sort: 'order',
        defaultSort: true,
      },
      {
        header: t('Rule name'),
        cell: (map) => (
          <TextCell
            text={map?.name}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.AuthenticatorMappingDetails, {
                    params: { id: map?.authenticator, map_id: map?.id },
                  })
            }
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
      {
        header: t('Type'),
        type: 'text',
        value: (map) => map?.ui_summary ?? t('{{mapType}} map', { mapType: map?.map_type }),
        sort: 'map_type',
      },
      {
        header: t('When to run the rule'),
        type: 'text',
        value: (map) => {
          if ('always' in map.triggers) {
            return t('Always');
          }
          if ('never' in map.triggers) {
            return t('Never');
          }
          if ('groups' in map.triggers) {
            return t('Based on groups');
          }
          if ('attributes' in map.triggers) {
            return t('Based on attributes');
          }
        },
        sort: 'triggers',
        table: 'hidden',
      },
      {
        header: t('Organization'),
        type: 'text',
        value: (map) => map?.organization,
        sort: 'organization',
      },
      {
        header: t('Team'),
        type: 'text',
        value: (map) => map?.team,
        sort: 'team',
      },
      {
        header: t('Role'),
        type: 'text',
        value: (map) => map?.role,
        sort: 'role',
      },
      {
        header: t('Enabled options'),
        type: 'text',
        value: (map) => {
          if (map.revoke === true) {
            return t('Revoke');
          } else {
            return '';
          }
        },
        sort: 'revoke',
        table: 'hidden',
      },
      {
        header: t('Created'),
        cell: (map) => {
          return (
            <DateTimeCell
              value={map.created}
              author={map.summary_fields?.created_by?.username}
              onClick={() =>
                pageNavigate(PlatformRoute.UserDetails, {
                  params: { id: map.created_by },
                })
              }
            />
          );
        },
        sort: 'created',
        table: 'hidden',
      },
      {
        header: t('Last modified'),
        cell: (map) => {
          return (
            <DateTimeCell
              value={map.modified}
              author={map.summary_fields?.modified_by?.username}
              onClick={() =>
                pageNavigate(PlatformRoute.UserDetails, {
                  params: { id: map.modified_by },
                })
              }
            />
          );
        },
        sort: 'created',
        table: 'hidden',
      },
    ],
    [t, options?.disableLinks, getPageUrl, pageNavigate]
  );
}
