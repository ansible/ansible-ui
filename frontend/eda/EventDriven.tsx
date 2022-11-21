import { Page } from '@patternfly/react-core'
import { useState } from 'react'
import { AnsibleMasthead } from '../common/Masthead'
import { EventDrivenRouter } from './EventDrivenRouter'
import { EventDrivenSidebar } from './EventDrivenSidebar'

export function EventDriven() {
  const [isNavOpen, setNavOpen] = useState(() => window.innerWidth >= 1200)
  return (
    <Page
      header={<AnsibleMasthead isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
      sidebar={<EventDrivenSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
    >
      <EventDrivenRouter />
    </Page>
  )
}
