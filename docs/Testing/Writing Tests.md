### testing

There are 2 kinds of tests here - cypress component tests, and cypress e2e tests.


#### component

Lives side by side with code, `frontend/**/Thing.cy.tsx` tests `frontend/**/Thing.tsx`.
Uses mock data, no real APIs.
Can be run in parallel, random order, fast.

Use for testing any component-specific logic. (Pagination paginates, filter sets triggers queries, etc.)

Run with `npm run cypress:run:component`.

Example: [Jobs.cy.tsx](https://github.com/ansible/ansible-ui/blob/main/frontend/awx/views/jobs/Jobs.cy.tsx)

#### e2e

Lives in `cypress/`, uses real APIs,
shared servers run somewhere in cloud.

Run with `npm run cypress:run:e2e`? TODO: auth?

Tests are expected to run in a shared environment - need to create a unique item, search for it, test any actions, and clean up.
(Automatic cleanup should happen automatically that cleans old items ..overnight?)

TODO: there's a naming convention for the new items, what is it?  
TODO: not available for hub yet  
prefix names with e2e  
aap-dev