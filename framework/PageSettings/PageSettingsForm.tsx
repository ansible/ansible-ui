import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageFormSelect } from '../PageForm/Inputs/PageFormSelect';
import { PageForm } from '../PageForm/PageForm';
import { PageHeader } from '../PageHeader';
import { PageLayout } from '../PageLayout';
import { IPageSettings, PageSettingsContext } from './PageSettingsProvider';
import { usePageSettingsOptions } from './usePageSettingOptions';

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
  const options = usePageSettingsOptions();
  return (
    <PageLayout>
      <PageHeader title={t('User Preferences')} titleHelp={t('Per user preferences.')} />
      <PageForm<IPageSettings>
        defaultValue={{
          ...options.reduce((acc, option) => ({ ...acc, [option.name]: option.defaultValue }), {}),
          ...settings,
        }}
        submitText={t('Save user preferences')}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        {options.map((option) => (
          <PageFormSelect
            name={option.name}
            key={option.name}
            label={option.label}
            placeholderText={t('Select {{label}}', { label: option.label })}
            options={option.options}
            labelHelp={option.helpText}
            isRequired
            enableUndo
            enableReset
            defaultValue={option.defaultValue}
          />
        ))}
      </PageForm>
    </PageLayout>
  );
}
