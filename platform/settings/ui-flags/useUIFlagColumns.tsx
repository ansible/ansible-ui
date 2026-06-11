import { ITableColumn } from '@ansible/ansible-ui-framework';
import { Label, Tooltip } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IUIFlag } from './IUIFlag';

export function useUIFlagColumns(): ITableColumn<IUIFlag>[] {
  const { t } = useTranslation();
  const columns: ITableColumn<IUIFlag>[] = useMemo(() => {
    const columns: ITableColumn<IUIFlag>[] = [
      {
        id: 'name',
        header: t('Name'),
        type: 'text',
        value: (flag) => flag.name,
        sort: 'name',
      },
      {
        id: 'description',
        header: t('Description'),
        type: 'text',
        value: (flag) => flag.description,
        table: 'description',
      },
      {
        id: 'status',
        header: t('Status'),
        sort: 'status',
        value: (flag) => {
          switch (flag.status) {
            case 'alpha':
              return [t('Alpha')];
            case 'beta':
              return [t('Beta')];
            case 'production':
              return [t('Production')];
            default:
              return [];
          }
        },
        cell: (flag: IUIFlag) => {
          switch (flag.status) {
            case 'alpha':
              return (
                <Tooltip
                  content={t(
                    'Alpha features are experimental and may change or be removed at any time.'
                  )}
                >
                  <Label color="red">{t('Alpha')}</Label>
                </Tooltip>
              );
            case 'beta':
              return (
                <Tooltip
                  content={t(
                    'Beta features are in development and may change before being promoted to production.'
                  )}
                >
                  <Label color="orange">{t('Beta')}</Label>
                </Tooltip>
              );
            case 'production':
              return (
                <Tooltip content={t('Production features are stable and supported.')}>
                  <Label color="green">{t('Production')}</Label>
                </Tooltip>
              );
            default:
              return null;
          }
        },
      },
    ];
    return columns;
  }, [t]);
  return columns;
}
