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
import { LoadingPage } from '../../../framework/components/LoadingPage'
import { useNamespaces } from '../automation-content/namespaces/hooks/useNamespaces'

export function HubDashboard() {
  const namespaces = useNamespaces()

  if (!namespaces) {
    return <LoadingPage />
  }

  return (
    <PageLayout>
      <PageHeader
        title="Welcome to Private Automation Hub"
        description="Find and use content that is supported by Redhat and out partners to devliver reassurance for the most demanding environments. Get started by exploring the options below."
      />
      <PageSection>
        <Stack hasGutter>
          {namespaces.length === 0 && (
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
          )}
          <Card isRounded isFlat>
            <CardHeader>
              <CardTitle>Featured collections</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>Sync from the featured collections below or add your own.</StackItem>
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
