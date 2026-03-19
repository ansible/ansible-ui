import { ITableColumn } from '@ansible/ansible-ui-framework';
import { Label, LabelGroup } from '@patternfly/react-core';
import { BanIcon, CheckCircleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IFeatureFlag } from './IFeatureFlag';

export function useFeatureFlagColumns(options?: {
  isReadOnly?: boolean;
}): ITableColumn<IFeatureFlag>[] {
  const { t } = useTranslation();
  const isReadOnly = options?.isReadOnly ?? false;

  return useMemo(() => {
    const columns: ITableColumn<IFeatureFlag>[] = [
      {
        id: 'name',
        header: t('Name'),
        sort: 'ui_name',
        value: (flag) => flag.ui_name,
        cell: (flag) => (
          <span>
            {!flag.visibility && (
              <Label color="grey" style={{ marginRight: 'var(--pf-t--global--spacer--sm)' }}>
                {t('Private')}
              </Label>
            )}
            {flag.ui_name}
          </span>
        ),
        card: 'name',
      },
      {
        id: 'description',
        header: t('Description'),
        type: 'description',
        value: (flag) => flag.description,
        table: 'description',
        card: 'description',
      },
      {
        id: 'support_level',
        header: t('Support level'),
        sort: 'support_level',
        value: (flag) => {
          switch (flag.support_level) {
            case 'TECHNOLOGY_PREVIEW':
              return t('Technology preview');
            case 'DEVELOPER_PREVIEW':
              return t('Developer preview');
            default:
              return '';
          }
        },
        cell: (flag) => {
          switch (flag.support_level) {
            case 'TECHNOLOGY_PREVIEW':
              return <Label color="orange">{t('Technology preview')}</Label>;
            case 'DEVELOPER_PREVIEW':
              return <Label color="red">{t('Developer preview')}</Label>;
            default:
              return null;
          }
        },
      },
      {
        id: 'labels',
        header: t('Labels'),
        value: (flag) => flag.labels.join(', '),
        cell: (flag) =>
          flag.labels.length > 0 ? (
            <LabelGroup>
              {flag.labels.map((label) => (
                <Label key={label}>{label}</Label>
              ))}
            </LabelGroup>
          ) : null,
        card: 'hidden',
      },
    ];

    if (isReadOnly) {
      columns.push({
        id: 'state',
        header: t('State'),
        sort: 'state',
        value: (flag) => (flag.state ? t('Enabled') : t('Disabled')),
        cell: (flag) =>
          flag.state ? (
            <Label color="green" icon={<CheckCircleIcon />}>
              {t('Enabled')}
            </Label>
          ) : (
            <Label icon={<BanIcon />}>{t('Disabled')}</Label>
          ),
      });
    }

    columns.push({
      id: 'support_url',
      header: t('Support'),
      value: (flag) => flag.support_url,
      cell: (flag) =>
        flag.support_url ? (
          <a href={flag.support_url} target="_blank" rel="noopener noreferrer">
            {t('Support')} <ExternalLinkAltIcon />
          </a>
        ) : null,
    });

    return columns;
  }, [t, isReadOnly]);
}
