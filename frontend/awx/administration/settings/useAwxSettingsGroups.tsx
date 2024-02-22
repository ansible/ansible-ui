import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsOptionsResponse } from './AwxSettingsActionsForm';

interface IAwxSettingsGroup {
  name: string;
  description?: string;
  defaultSlugs?: string[];
  categories: {
    id: string;
    name: string;
    slugs: string[];
  }[];
}

export function useAwxSettingsGroups() {
  const { t } = useTranslation();
  const groupsBase = useMemo(() => {
    const awxGroups: IAwxSettingsGroup[] = [
      {
        name: t('Authentication'),
        defaultSlugs: [
          'authentication',
          'ldap',
          'radius',
          'tacacsplus',
          'github',
          'github-org',
          'github-team',
          'google-oauth2',
          'github-enterprise',
          'github-enterprise-org',
          'github-enterprise-team',
          'oidc',
          'azuread-oauth2',
          'saml',
        ],
        categories: [],
      },
      {
        name: t('Jobs'),
        defaultSlugs: ['jobs'],
        categories: [],
      },
      {
        name: t('System'),
        defaultSlugs: ['authentication', 'system', 'logging', 'bulk'],
        categories: [],
      },
      {
        name: t('User Interface'),
        defaultSlugs: ['ui'],
        categories: [],
      },
      {
        name: t('Troubleshooting'),
        defaultSlugs: ['debug'],
        categories: [],
      },
      {
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
    for (const [, value] of Object.entries(options.data.actions.PUT)) {
      const categoryName = value.category;
      const slug = value.category_slug;

      let group = groups.find((group) => group.defaultSlugs?.includes(slug));
      if (!group) {
        group = groups.find((group) => group.name === 'Other');
        if (!group) {
          group = { name: 'Other', categories: [] };
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
    groups.forEach((group) => group.categories.sort((a, b) => a.name.localeCompare(b.name)));
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
