import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsOptionsAction, AwxSettingsOptionsResponse } from './AwxSettingsForm';

export interface IAwxSettingsGroup {
  id: string;
  name?: string;
  description?: string;
  defaultSlugs?: string[];
  categories: {
    id: string;
    name: string;
    slugs: string[];
  }[];
}

export const awxSettingsExcludeKeys: string[] = [
  'UI_NEXT',
  'MAX_UI_JOB_EVENTS',
  'UI_LIVE_UPDATES_ENABLED',
  'BULK_JOB_MAX_LAUNCH',
  'BULK_HOST_MAX_CREATE',
  'BULK_HOST_MAX_DELETE',
  'CUSTOM_LOGIN_INFO',
  'CUSTOM_LOGO',
];

export function useAwxSettingsGroupsBase() {
  const { t } = useTranslation();
  const groupsBase = useMemo(() => {
    const awxGroups: IAwxSettingsGroup[] = [
      {
        id: 'system',
        name: t('System Settings'),
        description: t('System settings plus analytics.'),
        defaultSlugs: ['system'],
        categories: [],
      },
      {
        id: 'jobs',
        name: t('Job Settings'),
        description: t('Job settings and limits.'),
        defaultSlugs: ['jobs'],
        categories: [],
      },
      {
        id: 'logging',
        name: t('Logging Settings'),
        description: t('Controller logging settings.'),
        defaultSlugs: ['logging'],
        categories: [],
      },
      {
        id: 'debug',
        name: t('Troubleshooting Settings'),
        description: t('Debugging and troubleshooting settings.'),
        defaultSlugs: ['debug'],
        categories: [],
      },
      {
        id: 'authentication',
        name: t('Authentication Providers'),
        defaultSlugs: [
          'authentication',
          'azuread-oauth2',
          'github',
          'github-org',
          'github-team',
          'google-oauth2',
          'github-enterprise',
          'github-enterprise-org',
          'github-enterprise-team',
          'ldap',
          'oidc',
          'radius',
          'saml',
          'tacacsplus',
        ],
        categories: [],
      },
      {
        id: 'other',
        name: t('Other'),
        categories: [],
      },
    ];
    return awxGroups;
  }, [t]);
  return groupsBase;
}

export function useAwxSettingsGroups() {
  const groupsBase = useAwxSettingsGroupsBase();

  const optionsResponse = useOptions<AwxSettingsOptionsResponse>(awxAPI`/settings/all/`);

  const options = useMemo(() => {
    if (!optionsResponse.data?.actions.PUT) return undefined;
    if (!optionsResponse.data?.actions.GET) return undefined;

    const { actions } = optionsResponse.data;
    const getKeys = Object.keys(actions.GET);
    const putKeys = Object.keys(actions.PUT);

    // Settings marked as 'defined_in_file' are read-only in the API
    // and won't be included in the OPTIONS PUT response,
    // as they are defined in a deployment file and cannot be modified.
    // These settings do appear in the GET response.
    const awxSettingsDefinedInFile = getKeys.filter(
      (x) => !putKeys.includes(x) && actions.GET[x].defined_in_file
    );

    return [...putKeys, ...awxSettingsDefinedInFile].reduce<
      Record<string, AwxSettingsOptionsAction>
    >((acc, key) => {
      if (awxSettingsExcludeKeys.includes(key)) return acc;
      const value = awxSettingsDefinedInFile.includes(key) ? actions.GET[key] : actions.PUT[key];
      acc[key] = value;
      return acc;
    }, {});
  }, [optionsResponse.data]);

  const groups = useMemo(() => {
    let groups: IAwxSettingsGroup[] = JSON.parse(JSON.stringify(groupsBase)) as IAwxSettingsGroup[];
    if (optionsResponse.isLoading) return groupsBase;
    if (optionsResponse.error) return groupsBase;
    if (!options) return groupsBase;
    for (const value of Object.values(options)) {
      const categoryName = value.category;
      const slug = value.category_slug;

      let group = groups.find((group) => group.defaultSlugs?.includes(slug));
      if (!group) {
        group = groups.find((group) => group.name === 'Other');
        if (!group) {
          group = { id: 'other', name: 'Other', categories: [] };
          groups.push(group);
        }
      }

      let category = group.categories.find((category) => category.name === categoryName);
      if (!category) {
        category = {
          id: categoryName.toLowerCase().replace(/ /g, '-'),
          name: categoryName,
          slugs: [],
        };
        group.categories.push(category);
      }
      category.slugs.push(slug);
    }
    groups = groups.filter((group) => group.categories.length > 0);
    groups.forEach((group) =>
      group.categories.sort((a, b) => {
        const indexA = group.defaultSlugs?.indexOf(a.slugs[0]) ?? -1;
        const indexB = group.defaultSlugs?.indexOf(b.slugs[0]) ?? -1;
        return indexA - indexB;
      })
    );
    return groups;
  }, [groupsBase, options, optionsResponse.error, optionsResponse.isLoading]);

  return useMemo(
    () => ({
      isLoading: optionsResponse.isLoading,
      error: optionsResponse.error,
      groups,
      options: options,
    }),
    [groups, optionsResponse.error, optionsResponse.isLoading, options]
  );
}
