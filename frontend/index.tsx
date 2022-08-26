import '@patternfly/patternfly/patternfly-charts-theme-dark.css'
import '@patternfly/react-core/dist/styles/base.css'
import { render } from 'react-dom'
import { ThemeProvider } from '../framework'
import { TranslationProvider } from '../framework/components/useTranslation'
import Demo from './Main'

const container = document.createElement('div')
container.style.position = 'fixed'
container.style.width = '100%'
container.style.height = '100%'
container.style.overflow = 'hidden'
document.body.appendChild(container)

render(
    <ThemeProvider>
        <TranslationProvider>
            <Demo />
        </TranslationProvider>
    </ThemeProvider>,
    container
)

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration)
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError)
            })
    })
}
