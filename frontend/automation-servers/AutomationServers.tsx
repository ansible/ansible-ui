import { Page } from '@patternfly/react-core'
import { useState } from 'react'
import { AnsibleMasthead } from '../common/Masthead'
import { AutomationServersRouter } from './AutomationServersRouter'
import { AutomationServersSidebar } from './AutomationServersSidebar'

export function AutomationServers() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth > 1200)
  return (
    <Page
      header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
      sidebar={<AutomationServersSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
    >
      <AutomationServersRouter />
    </Page>
  )
}
