/* eslint-disable i18next/no-literal-string */
import { Button, Form, Modal, ModalVariant, SelectOption } from '@patternfly/react-core';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePageDialog } from './PageDialogs/PageDialog';
import { FormGroupSelect } from './PageForm/Inputs/FormGroupSelect';
import { useFrameworkTranslations } from './useFrameworkTranslations';
import styled from 'styled-components';

const FormDiv = styled.div`
  padding: var(--pf-global--spacer--lg);
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
      document.documentElement.classList.add('pf-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-theme-dark');
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
      document.documentElement.classList.add('pf-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-theme-dark');
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
        <Form isHorizontal={settings.formLayout === 'horizontal'}>
          <FormGroupSelect
            id="theme"
            label="Theme"
            value={settings.theme ?? 'system'}
            onSelect={(_, theme) =>
              setSettings({ ...settings, theme: theme as 'system' | 'light' | 'dark' })
            }
            placeholderText="Select theme"
          >
            <SelectOption value="system">{'System default'}</SelectOption>
            <SelectOption value="light">{'Light'}</SelectOption>
            <SelectOption value="dark">{'Dark'}</SelectOption>
          </FormGroupSelect>
          <FormGroupSelect
            id="table-layout"
            label="Table Layout"
            value={settings.tableLayout ?? 'comfortable'}
            onSelect={(_, tableLayout) =>
              setSettings({
                ...settings,
                tableLayout: tableLayout as 'compact' | 'comfortable',
              })
            }
            placeholderText="Select table layout"
          >
            <SelectOption value="comfortable">{'Comfortable'}</SelectOption>
            <SelectOption value="compact">{'Compact'}</SelectOption>
          </FormGroupSelect>
          <FormGroupSelect
            id="form-columns"
            label="Form Columns"
            value={settings.formColumns ?? 'multiple'}
            onSelect={(_, formColumns) =>
              setSettings({
                ...settings,
                formColumns: formColumns as 'multiple' | 'single',
              })
            }
            placeholderText="Select form columns"
          >
            <SelectOption value="multiple">{'Multiple columns'}</SelectOption>
            <SelectOption value="single">{'Single column'}</SelectOption>
          </FormGroupSelect>
          <FormGroupSelect
            id="form-layout"
            label="Form Layout"
            value={settings.formLayout ?? 'vertical'}
            onSelect={(_, formLayout) =>
              setSettings({
                ...settings,
                formLayout: formLayout as 'vertical' | 'horizontal',
              })
            }
            placeholderText="Select form layout"
          >
            <SelectOption value="vertical">{'Vertical labels'}</SelectOption>
            <SelectOption value="horizontal">{'Horizontal labels'}</SelectOption>
          </FormGroupSelect>
        </Form>
      </FormDiv>
    </Modal>
  );
}
