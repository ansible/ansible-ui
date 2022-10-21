import { Button, Form, Modal, ModalVariant, SelectOption } from '@patternfly/react-core'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { SingleSelect } from './components/SingleSelect'
import { usePageDialog } from './PageDialog'

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
            setDialog(<SettingsDialog open={open} setOpen={setOpen} t={t} />)
        } else {
            setDialog(undefined)
        }
    }, [open, setDialog, t])
    return openSetting
}

export function SettingsDialog(props: {
    open: boolean
    setOpen: (open: boolean) => void
    t: (t: string) => string
}) {
    const onClose = () => props.setOpen(false)
    const [settings, setSettings] = useContext(SettingsContext)
    const { t } = props
    return (
        <Modal
            title="Settings"
            isOpen={props.open}
            onClose={onClose}
            variant={ModalVariant.medium}
            tabIndex={0}
            actions={[
                <Button key="close" variant="primary" onClick={onClose}>
                    {t('Close')}
                </Button>,
            ]}
        >
            <Form isHorizontal={settings.formLayout === 'horizontal'}>
                <SingleSelect
                    label="Theme"
                    value={settings.theme ?? 'system'}
                    onChange={(theme) =>
                        setSettings({ ...settings, theme: theme as 'system' | 'light' | 'dark' })
                    }
                >
                    <SelectOption value="system">{t('System default')}</SelectOption>
                    <SelectOption value="light">{t('Light')}</SelectOption>
                    <SelectOption value="dark">{t('Dark')}</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Table Layout"
                    value={settings.tableLayout ?? 'comfortable'}
                    onChange={(tableLayout) =>
                        setSettings({
                            ...settings,
                            tableLayout: tableLayout as 'compact' | 'comfortable',
                        })
                    }
                >
                    <SelectOption value="comfortable">{t('Comfortable')}</SelectOption>
                    <SelectOption value="compact">{t('Compact')}</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Form Columns"
                    value={settings.formColumns ?? 'multiple'}
                    onChange={(formColumns) =>
                        setSettings({
                            ...settings,
                            formColumns: formColumns as 'multiple' | 'single',
                        })
                    }
                >
                    <SelectOption value="multiple">{t('Multiple columns')}</SelectOption>
                    <SelectOption value="single">{t('Single column')}</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Form Layout"
                    value={settings.formLayout ?? 'vertical'}
                    onChange={(formLayout) =>
                        setSettings({
                            ...settings,
                            formLayout: formLayout as 'vertical' | 'horizontal',
                        })
                    }
                >
                    <SelectOption value="vertical">{t('Vertical labels')}</SelectOption>
                    <SelectOption value="horizontal">{t('Horizontal labels')}</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Borders"
                    value={settings.borders ? 'true' : 'false'}
                    onChange={(value) => setSettings({ ...settings, borders: value === 'true' })}
                    style={{ paddingBottom: 120 }}
                >
                    <SelectOption value="true">{t('Yes')}</SelectOption>
                    <SelectOption value="false">{t('No')}</SelectOption>
                </SingleSelect>
            </Form>
        </Modal>
    )
}
