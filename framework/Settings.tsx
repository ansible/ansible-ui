import { Button, Form, Modal, ModalVariant, SelectOption } from '@patternfly/react-core'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { SingleSelect } from './components/SingleSelect'
import { useDialog } from './DialogContext'

export interface Settings {
    theme?: 'light' | 'dark'
    tableLayout?: 'compact' | 'comfortable'
    formColumns?: 'single' | 'multiple'
    formLayout?: 'vertical' | 'horizontal'
    borders?: boolean
}

export const SettingsContext = createContext<[Settings, (settings?: Settings) => void]>([{}, () => null])

export function useSettings() {
    const [settings] = useContext(SettingsContext)
    return settings
}

export function SettingsProvider(props: { children?: ReactNode }) {
    const [settings, setSettingsState] = useState<Settings>(() => {
        const settings: Settings = {
            theme: localStorage.getItem('theme') as 'light' | 'dark',
            tableLayout: localStorage.getItem('tableLayout') as 'compact' | 'comfortable',
            formColumns: localStorage.getItem('formColumns') as 'single' | 'multiple',
            formLayout: localStorage.getItem('formLayout') as 'vertical' | 'horizontal',
            borders: localStorage.getItem('borders') === 'true',
        }
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('pf-theme-dark')
        } else {
            document.documentElement.classList.remove('pf-theme-dark')
        }
        return settings
    })

    const setSettings = useCallback((settings: Settings) => {
        localStorage.setItem('theme', settings.theme ?? 'light')
        localStorage.setItem('tableLayout', settings.tableLayout ?? 'comfortable')
        localStorage.setItem('formColumns', settings.formColumns ?? 'multiple')
        localStorage.setItem('formLayout', settings.formLayout ?? 'vertical')
        localStorage.setItem('borders', settings.borders ? 'true' : 'false')
        setSettingsState(settings)
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('pf-theme-dark')
        } else {
            document.documentElement.classList.remove('pf-theme-dark')
        }
    }, [])

    return <SettingsContext.Provider value={[settings, setSettings]}>{props.children}</SettingsContext.Provider>
}

export function useSettingsDialog() {
    const [open, setOpen] = useState(false)
    const openSetting = useCallback(() => setOpen(true), [])
    const [_, setDialog] = useDialog()
    useEffect(() => {
        if (open) {
            setDialog(<SettingsDialog open={open} setOpen={setOpen} />)
        } else {
            setDialog(undefined)
        }
    }, [open, setDialog])

    return openSetting
}

export function SettingsDialog(props: { open: boolean; setOpen: (open: boolean) => void }) {
    const onClose = () => props.setOpen(false)
    const [settings, setSettings] = useContext(SettingsContext)
    return (
        <Modal
            title="Settings"
            isOpen={props.open}
            onClose={onClose}
            variant={ModalVariant.medium}
            tabIndex={0}
            actions={[
                <Button key="close" variant="primary" onClick={onClose}>
                    Close
                </Button>,
            ]}
        >
            <Form isHorizontal={settings.formLayout === 'horizontal'}>
                <SingleSelect
                    label="Theme"
                    value={settings.theme ?? 'light'}
                    onChange={(theme: 'light' | 'dark') => setSettings({ ...settings, theme })}
                >
                    <SelectOption value="light">Light</SelectOption>
                    <SelectOption value="dark">Dark</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Table Layout"
                    value={settings.tableLayout ?? 'comfortable'}
                    onChange={(tableLayout: 'compact' | 'comfortable') => setSettings({ ...settings, tableLayout })}
                >
                    <SelectOption value="comfortable">Comfortable</SelectOption>
                    <SelectOption value="compact">Compact</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Form Columns"
                    value={settings.formColumns ?? 'multiple'}
                    onChange={(formColumns: 'multiple' | 'single') => setSettings({ ...settings, formColumns })}
                >
                    <SelectOption value="multiple">Multiple columns</SelectOption>
                    <SelectOption value="single">Single column</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Form Layout"
                    value={settings.formLayout ?? 'vertical'}
                    onChange={(formLayout: 'vertical' | 'horizontal') => setSettings({ ...settings, formLayout })}
                >
                    <SelectOption value="vertical">Vertical labels</SelectOption>
                    <SelectOption value="horizontal">Horizontal labels</SelectOption>
                </SingleSelect>
                <SingleSelect
                    label="Borders"
                    value={settings.borders ? 'true' : 'false'}
                    onChange={(value: 'true' | 'false') => setSettings({ ...settings, borders: value === 'true' })}
                    style={{ paddingBottom: 120 }}
                >
                    <SelectOption value="true">Yes</SelectOption>
                    <SelectOption value="false">No</SelectOption>
                </SingleSelect>
            </Form>
        </Modal>
    )
}
