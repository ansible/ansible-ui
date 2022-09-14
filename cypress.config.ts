import codeCoverage from '@cypress/code-coverage/task'
import { defineConfig } from 'cypress'

export default defineConfig({
    viewportWidth: 1600,
    viewportHeight: 1120,
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 30000,
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
            codeCoverage(on, config)
            return config
        },
        baseUrl: 'https://localhost:3002/',
    },
})
