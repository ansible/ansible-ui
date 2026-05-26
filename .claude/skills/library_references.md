# Library References

Before writing code that uses any library listed below, fetch its `llms.txt` (if
available) and use it as your primary reference. Do not rely on training-data
knowledge alone — libraries evolve across major versions.

## Libraries with llms.txt

Fetch the URL before writing code against that library.

| Library  | Role in this project       | llms.txt URL                            |
| -------- | -------------------------- | --------------------------------------- |
| React    | UI rendering, hooks        | https://react.dev/llms.txt              |
| Vitest   | Unit and component testing | https://vitest.dev/llms.txt             |
| Vite     | Dev server and build tool  | https://vite.dev/llms.txt               |
| Zustand  | Global state management    | https://zustand.docs.pmnd.rs/llms.txt   |

## Libraries without llms.txt — use official docs

| Library           | Role in this project              | Docs URL                                                  |
| ----------------- | --------------------------------- | --------------------------------------------------------- |
| TypeScript 5.7+   | Type system                       | https://www.typescriptlang.org/docs/                      |
| PatternFly 6      | UI component library              | https://www.patternfly.org/components/all-components/     |
| React Hook Form   | Form state management             | https://react-hook-form.com/docs                          |
| SWR               | Data fetching and caching         | https://swr.vercel.app/docs/getting-started               |
| MSW               | API mocking in tests              | https://mswjs.io/docs                                     |
| Testing Library   | Component test utilities          | https://testing-library.com/docs/                         |
| Playwright        | E2E browser testing               | https://playwright.dev/docs/intro                         |
| i18next           | Internationalization              | https://www.i18next.com/overview/getting-started          |
| React Router 7    | Client-side routing               | https://reactrouter.com/                                  |
| Luxon             | Date and time handling            | https://moment.github.io/luxon/                           |
| styled-components | CSS-in-JS styling                 | https://styled-components.com/docs                        |

## When to fetch

- **Always** when writing new code that imports from one of the llms.txt libraries
- **Always** when debugging unexpected behavior from a library
- **Skip** if you are only reading existing code and not modifying library usage
