/* eslint-disable i18next/no-literal-string */
import { Button, Form, Modal, ModalVariant } from '@patternfly/react-core';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { usePageDialog } from './PageDialogs/PageDialog';
import { PageSingleSelect } from './PageInputs/PageSingleSelect';
import { useFrameworkTranslations } from './useFrameworkTranslations';

const FormDiv = styled.div`
  padding: var(--pf-v5-global--spacer--lg);
`;

export interface Settings {
  theme?: 'system' | 'light' | 'dark';
  activeTheme?: 'light' | 'dark';
  tableLayout?: 'compact' | 'comfortable';
  formColumns?: 'single' | 'multiple';
  formLayout?: 'vertical' | 'horizontal';
}

export const SettingsContext = createContext<[Settings, (settings: Settings) => void]>([
  {},
  () => null,
]);

export function useSettings() {
  const [settings] = useContext(SettingsContext);
  return settings;
}

export function SettingsProvider(props: { children?: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const theme = localStorage.getItem('theme') as 'system' | 'light' | 'dark';
    const activeTheme =
      theme !== 'dark' && theme !== 'light'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    let tableLayout: 'comfortable' | 'compact' = 'comfortable';
    switch (localStorage.getItem('tableLayout')) {
      case 'compact':
        tableLayout = 'compact';
        break;
      case 'comfortable':
        tableLayout = 'comfortable';
        break;
    }

    let formColumns: 'single' | 'multiple' = 'multiple';
    switch (localStorage.getItem('formColumns')) {
      case 'single':
        formColumns = 'single';
        break;
      case 'multiple':
        formColumns = 'multiple';
        break;
    }

    let formLayout: 'vertical' | 'horizontal' = 'vertical';
    switch (localStorage.getItem('formLayout')) {
      case 'vertical':
        formLayout = 'vertical';
        break;
      case 'horizontal':
        formLayout = 'horizontal';
        break;
    }

    const settings: Settings = {
      theme,
      activeTheme,
      tableLayout,
      formColumns,
      formLayout,
    };

    if (activeTheme === 'dark') {
      document.documentElement.classList.add('pf-v5-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-v5-theme-dark');
    }
    return settings;
  });

  const setSettings = useCallback((settings: Settings) => {
    localStorage.setItem('theme', settings.theme ?? 'system');
    localStorage.setItem('tableLayout', settings.tableLayout ?? 'comfortable');
    localStorage.setItem('formColumns', settings.formColumns ?? 'multiple');
    localStorage.setItem('formLayout', settings.formLayout ?? 'vertical');
    const activeTheme =
      settings.theme !== 'light' && settings.theme !== 'dark'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : settings.theme;
    settings.activeTheme = activeTheme;
    setSettingsState(settings);

    if (activeTheme === 'dark') {
      document.documentElement.classList.add('pf-v5-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-v5-theme-dark');
    }
  }, []);

  return (
    <SettingsContext.Provider value={[settings, setSettings]}>
      {props.children}
    </SettingsContext.Provider>
  );
}

export function useSettingsDialog(t: (t: string) => string) {
  const [open, setOpen] = useState(false);
  const openSetting = useCallback(() => setOpen(true), []);
  const [_, setDialog] = usePageDialog();
  useEffect(() => {
    if (open) {
      setDialog(<SettingsDialog open={open} setOpen={setOpen} />);
    } else {
      setDialog(undefined);
    }
  }, [open, setDialog, t]);
  return openSetting;
}

export function SettingsDialog(props: { open: boolean; setOpen: (open: boolean) => void }) {
  const onClose = () => props.setOpen(false);
  const [settings, setSettings] = useContext(SettingsContext);
  const [translations] = useFrameworkTranslations();
  return (
    <Modal
      title="Settings"
      ouiaId={'Settings'}
      aria-label="Settings"
      isOpen={props.open}
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button key="close" variant="primary" onClick={onClose}>
          {translations.closeText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <FormDiv>
        <Form isHorizontal={settings.formLayout === 'horizontal'} autoComplete="off">
          <PageSingleSelect
            id="theme"
            label="Theme"
            value={settings.theme ?? 'system'}
            onSelect={(theme) =>
              setSettings({ ...settings, theme: theme as 'system' | 'light' | 'dark' })
            }
            placeholder="Select theme"
            options={[
              { label: 'System default', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
          />
          <PageSingleSelect
            id="table-layout"
            label="Table Layout"
            value={settings.tableLayout ?? 'comfortable'}
            onSelect={(tableLayout) =>
              setSettings({
                ...settings,
                tableLayout: tableLayout as 'compact' | 'comfortable',
              })
            }
            placeholder="Select table layout"
            options={[
              { label: 'Comfortable', value: 'comfortable' },
              { label: 'Compact', value: 'compact' },
            ]}
          />
          <PageSingleSelect
            id="form-columns"
            label="Form Columns"
            value={settings.formColumns ?? 'multiple'}
            onSelect={(formColumns) =>
              setSettings({
                ...settings,
                formColumns: formColumns as 'multiple' | 'single',
              })
            }
            placeholder="Select form columns"
            options={[
              { label: 'Multiple columns', value: 'multiple' },
              { label: 'Single column', value: 'single' },
            ]}
          />
          <PageSingleSelect
            id="form-layout"
            label="Form Layout"
            value={settings.formLayout ?? 'vertical'}
            onSelect={(formLayout) =>
              setSettings({
                ...settings,
                formLayout: formLayout as 'vertical' | 'horizontal',
              })
            }
            placeholder="Select form layout"
            options={[
              { label: 'Vertical labels', value: 'vertical' },
              { label: 'Horizontal labels', value: 'horizontal' },
            ]}
          />
        </Form>
      </FormDiv>
    </Modal>
  );
}
