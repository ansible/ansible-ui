/* eslint-disable i18next/no-literal-string */
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core'
import { ExternalLinkAltIcon } from '@patternfly/react-icons'
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
            <CardHeader>
              <CardTitle>Create a namespace</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>To get started, create a namespace for your organization.</StackItem>
                <StackItem>
                  <Button>Create namespace</Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardHeader>
              <CardTitle>Featured collections</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>Sync from the featured collections below or add you own.</StackItem>
                <StackItem>
                  <Button>Add your own collection</Button>
                </StackItem>
                <StackItem>
                  <Button
                    icon={
                      <span style={{ marginRight: 4 }}>
                        <ExternalLinkAltIcon />
                      </span>
                    }
                    variant="link"
                  >
                    Browse all certified collections
                  </Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </PageSection>
    </PageLayout>
  )
}
