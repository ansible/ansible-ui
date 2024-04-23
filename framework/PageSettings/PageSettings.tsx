import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageFormSingleSelect } from '../PageForm/Inputs/PageFormSingleSelect';
import { PageForm } from '../PageForm/PageForm';
import { PageHeader } from '../PageHeader';
import { PageLayout } from '../PageLayout';
import { IPageSettings, PageSettingsContext } from './PageSettingsProvider';

export function PageSettings() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('User Preferences')}
        titleHelp={t('Per user preferences for the user interface.')}
      />
      <PageSettingsForm />
    </PageLayout>
  );
}
export function PageSettingsForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useContext(PageSettingsContext);

  const onSubmit = useCallback(
    (settings: IPageSettings) => {
      setSettings(settings);
      navigate('..');
      return Promise.resolve();
    },
    [navigate, setSettings]
  );
  const onCancel = useCallback(() => navigate('..'), [navigate]);

  return (
    <PageForm<IPageSettings>
      defaultValue={{
        refreshInterval: 30,
        theme: 'system',
        tableLayout: 'comfortable',
        formColumns: 'multiple',
        formLayout: 'vertical',
        dateFormat: 'date-time',
        dataEditorFormat: 'yaml',
        ...settings,
      }}
      submitText={t('Save')}
      onCancel={onCancel}
      onSubmit={onSubmit}
    >
      <PageFormSingleSelect<IPageSettings>
        label={t('Refresh interval')}
        name="refreshInterval"
        placeholder={t('Select refresh interval')}
        options={[
          { label: t('5 seconds'), value: 5 },
          { label: t('10 seconds'), value: 10 },
          { label: t('30 seconds'), value: 30 },
          { label: t('1 minute'), value: 60 },
          { label: t('5 minutes'), value: 300 },
          { label: t('Never'), value: 0 },
        ]}
        labelHelp={[
          t('Select the refresh interval for the page.'),
          t('This refreshes the data on the page at the selected interval.'),
          t('The refresh happens in the background and does not reload the page.'),
        ]}
        isRequired
      />
      <PageFormSingleSelect<IPageSettings>
        name="theme"
        label={t('Color Theme')}
        options={[
          { label: t('System default'), value: 'system' },
          { label: t('Light theme'), value: 'light' },
          { label: t('Dark theme'), value: 'dark' },
        ]}
        placeholder={t('Select theme')}
        isRequired
      />
      <PageFormSingleSelect<IPageSettings>
        name="tableLayout"
        label={t('Table Layout')}
        options={[
          {
            label: t('Comfortable'),
            description: t('More space between rows'),
            value: 'comfortable',
          },
          { label: t('Compact'), description: t('Less space between rows'), value: 'compact' },
        ]}
        placeholder={t('Select table layout')}
        isRequired
      />
      <PageFormSingleSelect<IPageSettings>
        name="formColumns"
        label={t('Form Columns')}
        options={[
          { label: t('Multiple columns of inputs'), value: 'multiple' },
          { label: t('Single column of inputs'), value: 'single' },
        ]}
        placeholder={t('Select form columns')}
        isRequired
      />
      <PageFormSingleSelect<IPageSettings>
        name="formLayout"
        label={t('Form Labels')}
        options={[
          { label: t('Labels above inputs'), value: 'vertical' },
          { label: t('Labels beside inputs'), value: 'horizontal' },
        ]}
        placeholder={t('Select form layout')}
        isRequired
      />
      <PageFormSingleSelect<IPageSettings>
        name="dateFormat"
        label={t('Date Format')}
        options={[
          { label: t('Show dates as a relative to the current time'), value: 'since' },
          { label: t('Show dates as date and time'), value: 'date-time' },
        ]}
        placeholder={t('Select date format')}
        isRequired
      />
      <PageFormSingleSelect<IPageSettings>
        name="dataEditorFormat"
        label={t('Preferred Data Format')}
        options={[
          { label: t('YAML'), value: 'yaml' },
          { label: t('JSON'), value: 'json' },
        ]}
        placeholder={t('Select date format')}
        labelHelp={t('Sets the default format for when editing data fields.')}
        isRequired
      />
    </PageForm>
  );
}
