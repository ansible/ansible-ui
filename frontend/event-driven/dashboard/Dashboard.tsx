/* eslint-disable i18next/no-literal-string */
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Gallery,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../framework'
import { RouteE } from '../../Routes'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Fragment>
      <PageHeader title="Welcome to Event Driven Automation" />
      <PageSection>
        <Gallery hasGutter minWidths={{ default: '300px' }}>
          <Card isRounded isFlat>
            <CardHeader>
              <CardTitle>Create a project</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>To get started, create a project.</StackItem>
                <StackItem>
                  <Button onClick={() => navigate(RouteE.CreateEdaProject)}>Create project</Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>

          <Card isRounded isFlat>
            <CardHeader>
              <CardTitle>Create a rulebook</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>To get started, create a rulebook.</StackItem>
                <StackItem>
                  <Button onClick={() => navigate(RouteE.CreateEdaRulebook)}>
                    Create rulebook
                  </Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>

          <Card isRounded isFlat>
            <CardHeader>
              <CardTitle>Create an inventory</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack hasGutter>
                <StackItem>To get started, create an inventory.</StackItem>
                <StackItem>
                  <Button onClick={() => navigate(RouteE.CreateEdaInventory)}>
                    Create inventory
                  </Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </Gallery>
      </PageSection>
    </Fragment>
  )
}
