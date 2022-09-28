import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useBreakpoint } from '.'
import ErrorBoundary from './components/ErrorBoundary'
import { useSettings } from './Settings'

export function PageBody(props: { children: ReactNode }) {
    const lg = useBreakpoint('lg')
    const xl = useBreakpoint('xl')
    const settings = useSettings()
    const { t } = useTranslation()
    return (
        <ErrorBoundary message={t('Error')}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    maxHeight: '100%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--pf-c-page__main-section--BackgroundColor)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        maxHeight: '100%',
                        margin: xl ? 24 : lg ? 16 : 0,
                        overflow: 'hidden',
                        border: settings.borders && lg ? 'thin solid var(--pf-global--BorderColor--100)' : undefined,
                        backgroundColor: 'var(--pf-global--BackgroundColor--100)',
                    }}
                >
                    {props.children}
                </div>
            </div>
        </ErrorBoundary>
    )
}
