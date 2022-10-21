// import '@patternfly/react-core/dist/styles/base.css'
import '@patternfly/patternfly/patternfly-base.css'
import '@patternfly/patternfly/patternfly-charts-theme-dark.css'

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { Suspense } from 'react'
import { render } from 'react-dom'
import { initReactI18next } from 'react-i18next'
import Main from './Main'

const container = document.createElement('div')
container.style.position = 'fixed'
container.style.width = '100%'
container.style.height = '100%'
container.style.overflow = 'hidden'
document.body.appendChild(container)

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .then(() => {
    render(
      <Suspense fallback={<div />}>
        <Main />
      </Suspense>,
      container
    )
  })

/* istanbul ignore next */
if (process.env.PWA === 'true' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      // .then((registration) => {
      //     console.log('SW registered: ', registration)
      // })
      .catch((registrationError) => {
        // eslint-disable-next-line no-console
        console.error('SW registration failed: ', registrationError)
      })
  })
}
