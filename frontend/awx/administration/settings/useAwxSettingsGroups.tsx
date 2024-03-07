import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsOptionsResponse } from './AwxSettingsActionsForm';

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
];

export function useAwxSettingsGroups() {
  const { t } = useTranslation();
  const groupsBase = useMemo(() => {
    const awxGroups: IAwxSettingsGroup[] = [
      {
        id: 'system',
        name: t('System'),
        description: t('System settings plus analytics.'),
        defaultSlugs: ['system'],
        categories: [],
      },
      {
        id: 'jobs',
        name: t('Job settings'),
        description: t('Job settings and limits.'),
        defaultSlugs: ['jobs'],
        categories: [],
      },
      {
        id: 'logging',
        name: t('Logging'),
        description: t('Controller logging settings.'),
        defaultSlugs: ['logging'],
        categories: [],
      },
      {
        id: 'ui',
        name: t('Customize Login'),
        description: t('Customize the login page and logo.'),
        defaultSlugs: ['ui'],
        categories: [],
      },
      {
        id: 'debug',
        name: t('Troubleshooting'),
        description: t('Debugging and troubleshooting settings.'),
        defaultSlugs: ['debug'],
        categories: [],
      },
      {
        id: 'authentication',
        name: t('Authentication'),
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

  const options = useOptions<AwxSettingsOptionsResponse>(awxAPI`/settings/all/`);

  const groups = useMemo(() => {
    let groups: IAwxSettingsGroup[] = JSON.parse(JSON.stringify(groupsBase)) as IAwxSettingsGroup[];
    if (options.isLoading) return groupsBase;
    if (options.error) return groupsBase;
    if (!options.data) return groupsBase;
    for (const [key, value] of Object.entries(options.data.actions.PUT)) {
      if (awxSettingsExcludeKeys.includes(key)) continue;

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
        // return a.name.localeCompare(b.name);
      })
    );
    return groups;
  }, [groupsBase, options.data, options.error, options.isLoading]);

  return useMemo(
    () => ({
      isLoading: options.isLoading,
      error: options.error,
      groups,
      options: options.data?.actions.PUT,
    }),
    [groups, options.data?.actions.PUT, options.error, options.isLoading]
  );
}
