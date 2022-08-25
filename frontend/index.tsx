import '@patternfly/patternfly/patternfly-charts-theme-dark.css'
import '@patternfly/react-core/dist/styles/base.css'
import { render } from 'react-dom'
import { ThemeProvider } from './framework'
import { TranslationProvider } from './framework/components/useTranslation'
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
