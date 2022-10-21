import { Page } from '@patternfly/react-core'
import { useState } from 'react'
import { AnsibleMasthead } from '../common/Masthead'
import { ControllerRouter } from './ControllerRouter'
import { ControllerSidebar } from './ControllerSidebar'

export function Controller() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth > 1600)
  return (
    <Page
      header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
      sidebar={<ControllerSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
    >
      <ControllerRouter />
    </Page>
  )
}
