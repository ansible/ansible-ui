import { ITableColumn, useGetPageUrl, ColumnTableOption } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '@ansible/common-ui/columns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { ContentType } from './ContentType';
import { useContentTypeComponentNames } from './useContentTypeComponentNames';
import { useGetResourceTypes } from './useResourceType';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';

export function usePlatformRoleColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  disableExtraColumns?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const getDisplayName = useMapContentTypeToDisplayName();

  const nameColumn = useNameColumn<PlatformRole>({
    to: (role) => getPageUrl(PlatformRoute.RoleDetails, { params: { id: role.id } }),
    disableSort: options?.disableSort,
    disableLinks: options?.disableLinks,
  });

  const descriptionBaseColumn = useDescriptionColumn<PlatformRole>({
    disableSort: options?.disableSort,
  });
  const descriptionColumn = useMemo(
    () => ({ ...descriptionBaseColumn, table: undefined }),
    [descriptionBaseColumn]
  );

  const createdColumn = useCreatedColumn({
    disableSort: options?.disableSort,
    disableLinks: options?.disableLinks,
  });
  const modifiedColumn = useModifiedColumn({
    disableSort: options?.disableSort,
    disableLinks: options?.disableLinks,
  });

  const getContentTypeComponentNames = useContentTypeComponentNames();

  const { data: resourceTypeResponse } = useGetResourceTypes();

  const resourceModelMap = useMemo(
    () =>
      Object.fromEntries(
        resourceTypeResponse?.results?.map((rt) => [rt.api_slug, rt.model]) ?? []
      ) as Record<string, string>,
    [resourceTypeResponse]
  );

  return useMemo<ITableColumn<PlatformRole>[]>(
    () => [
      nameColumn,
      descriptionColumn,
      {
        header: t('Components'),
        type: 'labels',
        value: (role) => getContentTypeComponentNames((role.content_type ?? '') as ContentType),
        modal: 'hidden',
      },
      {
        header: t('Resource type'),
        type: 'text',
        value: (role) =>
          getDisplayName(resourceModelMap[role.content_type ?? ''], { isTitleCase: true }) ??
          getDisplayName(role.content_type ?? '', { isTitleCase: true }),
        modal: 'hidden',
        table: options?.disableExtraColumns ? 'hidden' : undefined,
      },
      {
        header: t('Role creation'),
        type: 'text',
        value: (role) => (role.managed ? 'Default' : 'Custom'),
        modal: options?.disableExtraColumns ? 'hidden' : undefined,
        table: options?.disableExtraColumns ? 'hidden' : undefined,
      },
      {
        header: t('Permissions'),
        type: 'labels',
        value: (role) => role.permissions,
        sort: options?.disableSort ? undefined : 'permissions',
        modal: 'hidden',
        table: options?.disableExtraColumns ? 'hidden' : ColumnTableOption.expanded,
        detailsFullWidth: true,
      },
      createdColumn,
      modifiedColumn,
    ],
    [
      nameColumn,
      descriptionColumn,
      t,
      options?.disableSort,
      options?.disableExtraColumns,
      createdColumn,
      modifiedColumn,
      getContentTypeComponentNames,
      resourceModelMap,
      getDisplayName,
    ]
  );
}
