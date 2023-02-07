/* eslint-disable i18next/no-literal-string */
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../framework';
import { RouteE } from '../../Routes';
import ActionsChartCard from './ActionsChartCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Fragment>
      <PageHeader
        title={t('Welcome to Event Driven Automation')}
        description={t(
          'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
        )}
      />
      <PageSection>
        <Stack hasGutter>
          <StackItem>
            <ActionsChartCard />
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              <GridItem span={6}>
                <Card isRounded isFlat>
                  <CardHeader>
                    <CardTitle>Create a project</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Stack hasGutter>
                      <StackItem>To get started, create a project.</StackItem>
                      <StackItem>
                        <Button onClick={() => navigate(RouteE.CreateEdaProject)}>
                          Create project
                        </Button>
                      </StackItem>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={6}>
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
              </GridItem>
              <GridItem span={6}>
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
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </PageSection>
    </Fragment>
  );
}
