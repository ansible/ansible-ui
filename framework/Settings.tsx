/* eslint-disable i18next/no-literal-string */
import { Button, Flex, Form, Modal, ModalVariant, Radio } from '@patternfly/react-core';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { RefreshIntervalSelect } from '../frontend/common/components/RefreshInterval';
import { usePageDialog } from './PageDialogs/PageDialog';
import { PageFormGroup } from './PageForm/Inputs/PageFormGroup';
import { PageSingleSelect, PageSingleSelectProps } from './PageInputs/PageSingleSelect';
import { Scrollable } from './components/Scrollable';
import { useID } from './hooks/useID';
import { useFrameworkTranslations } from './useFrameworkTranslations';

export interface Settings {
  refreshInterval?: 60;
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
      variant={ModalVariant.small}
      tabIndex={0}
      actions={[
        <Button key="close" variant="primary" onClick={onClose}>
          {translations.closeText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <Scrollable>
        <FormDiv>
          <Form isHorizontal={settings.formLayout === 'horizontal'} autoComplete="off">
            <PageFormGroup label="Refresh interval" fieldId="form-columns">
              <RefreshIntervalSelect />
            </PageFormGroup>

            <PageFormGroup label="Color Theme" fieldId="theme">
              <PageSingleSelect
                id="theme"
                value={settings.theme ?? 'system'}
                onSelect={(theme) =>
                  setSettings({ ...settings, theme: theme as 'system' | 'light' | 'dark' })
                }
                placeholder="Select theme"
                options={[
                  {
                    label: 'System default',
                    value: 'system',
                    description: 'Use system default color theme',
                  },
                  { label: 'Light', value: 'light', description: 'Enable light theme' },
                  { label: 'Dark', value: 'dark', description: 'Enable dark theme' },
                ]}
              />
            </PageFormGroup>

            <PageFormGroup label="Table Layout" fieldId="table-layout">
              <PageSingleSelect
                id="table-layout"
                value={settings.tableLayout ?? 'comfortable'}
                onSelect={(tableLayout) =>
                  setSettings({
                    ...settings,
                    tableLayout: tableLayout as 'compact' | 'comfortable',
                  })
                }
                placeholder="Select table layout"
                options={[
                  {
                    label: 'Comfortable',
                    value: 'comfortable',
                    description: 'Increase vertical spacing and makes the table more comfortable.',
                  },
                  {
                    label: 'Compact',
                    value: 'compact',
                    description: 'Reduce vertical spacing and makes the table more compact.',
                  },
                ]}
              />
            </PageFormGroup>

            <PageFormGroup label="Form Columns" fieldId="form-columns">
              <PageSingleSelect
                id="form-columns"
                value={settings.formColumns ?? 'multiple'}
                onSelect={(formColumns) =>
                  setSettings({
                    ...settings,
                    formColumns: formColumns as 'multiple' | 'single',
                  })
                }
                placeholder="Select form columns"
                options={[
                  {
                    label: 'Multiple',
                    value: 'multiple',
                    description: 'Multiple columns are used to display form fields.',
                  },
                  {
                    label: 'Single',
                    value: 'single',
                    description: 'Single column is used to display form fields.',
                  },
                ]}
              />
            </PageFormGroup>

            <PageFormGroup label="Form Labels" fieldId="form-layout">
              <PageSingleSelect
                id="form-layout"
                value={settings.formLayout ?? 'vertical'}
                onSelect={(formLayout) =>
                  setSettings({
                    ...settings,
                    formLayout: formLayout as 'vertical' | 'horizontal',
                  })
                }
                placeholder="Select form layout"
                options={[
                  {
                    label: 'Vertical',
                    value: 'vertical',
                    description: 'Labels for form fields are displayed above the fields.',
                  },
                  {
                    label: 'Horizontal',
                    value: 'horizontal',
                    description: 'Labels for form fields are displayed to the left of the fields.',
                  },
                ]}
              />
            </PageFormGroup>
          </Form>
        </FormDiv>
      </Scrollable>
    </Modal>
  );
}

const FormDiv = styled.div`
  padding: var(--pf-v5-global--spacer--lg);
`;

function PageRadio<T extends string | number>(props: PageSingleSelectProps<T>) {
  const id = useID(props);
  return (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
      {props.options.map((option) => (
        <Radio
          id={id + '-' + option.value}
          key={option.value}
          name={id}
          label={option.label}
          description={option.description}
          isChecked={props.value === option.value}
          onChange={(_event, isChecked) => {
            props.onSelect(isChecked ? option.value : undefined);
          }}
        />
      ))}
    </Flex>
  );
}
