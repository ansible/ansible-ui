/* eslint-disable i18next/no-literal-string */
import { Card, CardBody, PageSection, Stack } from '@patternfly/react-core'
import { PageHeader, PageLayout } from '../../../framework'

export function HubDashboard() {
  return (
    <PageLayout>
      <PageHeader
        title="Welcome to Private Automation Hub"
        description="Find and use content that is supported by Redhat and out partners to devliver reassurance for the most demanding environments. Get started by exploring the options below."
      />
      <PageSection>
        <Stack hasGutter>
          <Card isRounded isFlat>
            <CardBody>Get started by... TODO</CardBody>
          </Card>
        </Stack>
      </PageSection>
    </PageLayout>
  )
}
