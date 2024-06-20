![20230613131933](https://github.com/ansible/ansible-ui/assets/289743/f7f02c47-adba-4a34-9567-343e520c4abb)

Code is ordered by component (`awx`, `eda`, `hub`),  
sources live in `frontend/$component/`,  
common ui in the rest of `frontend/`,  
with shared components in `framework/`.

Component tests are also in `frontend/$component`, except as `*.cy.tsx`.  
e2e tests in `cypress/e2e/$component/`.

Under `frontend/$component`, things are ordered by topic (eg. `approvals`, `namespaces`),  
files use named exports, with the filename the same as the export name (`Approvals.tsx` & `export function Approvals(){...}`), with no index files.

`npm run start` runs the whole UI, including API selector, while `npm run awx|eda|hub` allows running a single component.

TODO: add corresponding example for a detail screen with/without tabs, link code examples

#### See also

   * https://github.com/ansible/ansible-ui/wiki/Differences-from-ansible-hub-ui
   * https://github.com/ansible/ansible-ui/wiki/Overview,-structure
   * https://github.com/ansible/ansible-ui/wiki/Talking-to-APIs
   * https://github.com/ansible/ansible-ui/wiki/Handling-user-actions
   * https://github.com/ansible/ansible-ui/wiki/Writing-tests
   * https://github.com/ansible/ansible-ui/wiki/Hub-Overview