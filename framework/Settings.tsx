import { Button, Form, Modal, ModalVariant, SelectOption } from '@patternfly/react-core'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { usePageDialog } from './PageDialog'
import { FormGroupSelect } from './PageForm/Inputs/FormGroupSelect'
import { useFrameworkTranslations } from './useFrameworkTranslations'

export interface Settings {
  theme?: 'system' | 'light' | 'dark'
  tableLayout?: 'compact' | 'comfortable'
  formColumns?: 'single' | 'multiple'
  formLayout?: 'vertical' | 'horizontal'
  borders?: boolean
}

export const SettingsContext = createContext<[Settings, (settings: Settings) => void]>([
  {},
  () => null,
])

export function useSettings() {
  const [settings] = useContext(SettingsContext)
  return settings
}

export function SettingsProvider(props: { children?: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const settings: Settings = {
      theme: localStorage.getItem('theme') as 'system' | 'light' | 'dark',
      tableLayout: localStorage.getItem('tableLayout') as 'compact' | 'comfortable',
      formColumns: localStorage.getItem('formColumns') as 'single' | 'multiple',
      formLayout: localStorage.getItem('formLayout') as 'vertical' | 'horizontal',
      borders: localStorage.getItem('borders') !== 'false',
    }
    const activeTheme =
      settings.theme !== 'dark' && settings.theme !== 'light'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : settings.theme
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('pf-theme-dark')
    } else {
      document.documentElement.classList.remove('pf-theme-dark')
    }
    return settings
  })

  const setSettings = useCallback((settings: Settings) => {
    localStorage.setItem('theme', settings.theme ?? 'system')
    localStorage.setItem('tableLayout', settings.tableLayout ?? 'comfortable')
    localStorage.setItem('formColumns', settings.formColumns ?? 'multiple')
    localStorage.setItem('formLayout', settings.formLayout ?? 'vertical')
    localStorage.setItem('borders', settings.borders ? 'true' : 'false')
    setSettingsState(settings)
    const activeTheme =
      settings.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : settings.theme
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('pf-theme-dark')
    } else {
      document.documentElement.classList.remove('pf-theme-dark')
    }
  }, [])

  return (
    <SettingsContext.Provider value={[settings, setSettings]}>
      {props.children}
    </SettingsContext.Provider>
  )
}

export function useSettingsDialog(t: (t: string) => string) {
  const [open, setOpen] = useState(false)
  const openSetting = useCallback(() => setOpen(true), [])
  const [_, setDialog] = usePageDialog()
  useEffect(() => {
    if (open) {
      setDialog(<SettingsDialog open={open} setOpen={setOpen} />)
    } else {
      setDialog(undefined)
    }
  }, [open, setDialog, t])
  return openSetting
}

export function SettingsDialog(props: { open: boolean; setOpen: (open: boolean) => void }) {
  const onClose = () => props.setOpen(false)
  const [settings, setSettings] = useContext(SettingsContext)
  const [translations] = useFrameworkTranslations()
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
    >
      <Form isHorizontal={settings.formLayout === 'horizontal'}>
        <FormGroupSelect
          id="theme"
          label="Theme"
          value={settings.theme ?? 'system'}
          onSelect={(_, theme) =>
            setSettings({ ...settings, theme: theme as 'system' | 'light' | 'dark' })
          }
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
        >
          <SelectOption value="vertical">{'Vertical labels'}</SelectOption>
          <SelectOption value="horizontal">{'Horizontal labels'}</SelectOption>
        </FormGroupSelect>
        <FormGroupSelect
          id="borders"
          label="Borders"
          value={settings.borders ? 'true' : 'false'}
          onSelect={(_, value) => setSettings({ ...settings, borders: value === 'true' })}
        >
          <SelectOption value="true">{'Yes'}</SelectOption>
          <SelectOption value="false">{'No'}</SelectOption>
        </FormGroupSelect>
      </Form>
    </Modal>
  )
}
