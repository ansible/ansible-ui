import { useTranslation } from 'react-i18next';
import { PageSelectOption } from '../PageInputs/PageSelectOption';

export interface IPageSettingsOption {
  name: string;
  label: string;
  helpText: string;
  options: PageSelectOption<string | number>[];
  defaultValue: string | number;
}

export function usePageSettingsOptions(): IPageSettingsOption[] {
  const { t } = useTranslation();
  return [
    {
      name: 'refreshInterval',
      label: t('Refresh interval'),
      helpText: t(
        'The refresh interval is the time in seconds between automatic refreshes of the data on the page.'
      ),
      options: [
        { label: t('5 seconds'), value: 5 },
        { label: t('10 seconds'), value: 10 },
        { label: t('30 seconds'), value: 30 },
        { label: t('1 minute'), value: 60 },
        { label: t('5 minutes'), value: 300 },
        { label: t('Never'), value: 0 },
      ],
      defaultValue: 30,
    },
    {
      name: 'theme',
      label: t('Color theme'),
      helpText: t('Select the color theme.'),
      options: [
        { label: t('System'), value: 'system', description: t('Use the system color theme.') },
        { label: t('Light'), value: 'light', description: t('Use the light color theme.') },
        { label: t('Dark'), value: 'dark', description: t('Use the dark color theme.') },
      ],
      defaultValue: 'system',
    },
    {
      name: 'tableLayout',
      label: t('Table layout'),
      helpText: t('The preferred layout for tables.'),
      options: [
        {
          label: t('Compact'),
          value: 'compact',
          description: t('Reduce spacing and make the table more compact.'),
        },
        {
          label: t('Comfortable'),
          value: 'comfortable',
          description: t('Increase spacing and make the table more comfortable.'),
        },
      ],
      defaultValue: 'comfortable',
    },
    {
      name: 'formColumns',
      label: t('Form columns'),
      helpText: t('Allows diplaying forms and details in a single or multiple columns.'),
      options: [
        {
          label: t('Single'),
          value: 'single',
          description: 'Display forms and details using a single column.',
        },
        {
          label: t('Multiple'),
          value: 'multiple',
          description: 'Display forms and details using multiple columns.',
        },
      ],
      defaultValue: 'multiple',
    },

    {
      name: 'dateFormat',
      label: t('Date format'),
      helpText: t('The preferred date format to display in tables and details.'),
      options: [
        {
          label: t('Relative'),
          value: 'since',
          description: t('Show dates as a relative to the current time.'),
        },
        {
          label: t('Date and time'),
          value: 'date-time',
          description: 'Show dates as date and time.',
        },
      ],
      defaultValue: 'date-time',
    },
    {
      name: 'dataEditorFormat',
      label: t('Preferred data format'),
      helpText: t('The preferred data format for editing and displaying data.'),
      options: [
        { label: t('YAML'), value: 'yaml' },
        { label: t('JSON'), value: 'json' },
      ],
      defaultValue: 'yaml',
    },
  ];
}
