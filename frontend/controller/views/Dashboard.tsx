/* eslint-disable i18next/no-literal-string */
import {
    Bullseye,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardTitle,
    Gallery,
    Grid,
    GridItem,
    PageSection,
    ProgressStep,
    ProgressStepper,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Text,
} from '@patternfly/react-core'
import { Fragment } from 'react'
import { Help, PageHeader } from '../../../framework'
import { Scrollable } from '../../../framework/components/Scrollable'

export default function Dashboard() {
    return (
        <Fragment>
            {/* <Banner variant="info">You are</Banner> */}
            <PageHeader
                title="Welcome to Automation Controller"
                description="Install and configure your Ansible Automation Controller clusters."
            />
            <Scrollable>
                <PageSection>
                    <Grid hasGutter span={12} sm={12} md={12} lg={6} xl={6} xl2={4}>
                        <GridItem span={12}>
                            <Card isRounded>
                                <CardTitle>Getting Started</CardTitle>
                                <CardBody>
                                    <ProgressStepper>
                                        <ProgressStep
                                            variant="success"
                                            id="basic-step1"
                                            titleId="basic-step1-title"
                                            aria-label="completed step, step with success"
                                        >
                                            <Button variant="link" isInline>
                                                Create
                                            </Button>
                                            &nbsp;or sync an execution environment.
                                        </ProgressStep>
                                        <ProgressStep
                                            variant="info"
                                            isCurrent
                                            id="basic-step2"
                                            titleId="basic-step2-title"
                                            aria-label="step with info"
                                        >
                                            <Button variant="link" isInline>
                                                Create
                                            </Button>
                                            &nbsp;an inventory.
                                        </ProgressStep>
                                        <ProgressStep
                                            variant="pending"
                                            id="basic-step3"
                                            titleId="basic-step3-title"
                                            aria-label="pending step"
                                        >
                                            <Button variant="link" isInline>
                                                Create
                                            </Button>
                                            &nbsp;your first job template.
                                        </ProgressStep>
                                    </ProgressStepper>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={12}>
                            <Card isRounded>
                                <CardTitle>
                                    <Split>
                                        <SplitItem>Execution environments</SplitItem>
                                        <SplitItem isFilled>
                                            <Help
                                                title="Execution environments"
                                                help="The ability to build and deploy Python virtual environments for automation has been replaced by
                                        Ansible execution environments. Unlike legacy virtual environments, execution environments are
                                        container images that make it possible to incorporate system-level dependencies and collection-based
                                        content. Each execution environment allows you to have a customized image to run jobs, and each of
                                        them contain only what you need when running the job, nothing more."
                                            />
                                        </SplitItem>
                                        <SplitItem>
                                            <Button variant="link" isInline>
                                                Browse all available execution environemnts
                                            </Button>
                                        </SplitItem>
                                    </Split>
                                </CardTitle>
                                <CardBody>
                                    <Stack hasGutter>
                                        <Text>
                                            Sync from the available execution environments below or
                                            create your own.
                                        </Text>
                                        <Split>
                                            <Button>Create execution environment</Button>
                                        </Split>
                                        <Gallery hasGutter>
                                            <Card isFlat>
                                                <CardTitle>
                                                    <Stack>
                                                        <StackItem>
                                                            <Button variant="link" isInline>
                                                                Execution environment 1
                                                            </Button>
                                                        </StackItem>
                                                        <StackItem>
                                                            <Text
                                                                component="small"
                                                                style={{
                                                                    fontWeight: 'normal',
                                                                    opacity: 0.7,
                                                                }}
                                                            >
                                                                Provided by Red Hat
                                                            </Text>
                                                        </StackItem>
                                                    </Stack>
                                                </CardTitle>
                                                <CardBody>
                                                    <Stack hasGutter>
                                                        <Text>This is the description.</Text>
                                                    </Stack>
                                                </CardBody>
                                                <CardFooter>
                                                    <Button variant="secondary">Sync</Button>
                                                </CardFooter>
                                            </Card>
                                            <Card isFlat>
                                                <CardTitle>
                                                    <Stack>
                                                        <StackItem>
                                                            <Button variant="link" isInline>
                                                                Execution environment 2
                                                            </Button>
                                                        </StackItem>
                                                        <StackItem>
                                                            <Text
                                                                component="small"
                                                                style={{
                                                                    fontWeight: 'normal',
                                                                    opacity: 0.7,
                                                                }}
                                                            >
                                                                Provided by Red Hat
                                                            </Text>
                                                        </StackItem>
                                                    </Stack>
                                                </CardTitle>
                                                <CardBody>
                                                    <Stack hasGutter>
                                                        <Text>
                                                            This is the description. This ia a very
                                                            long long long description. This ia a
                                                            very long long long description.
                                                        </Text>
                                                    </Stack>
                                                </CardBody>
                                                <CardFooter>
                                                    <Button variant="secondary">Sync</Button>
                                                </CardFooter>
                                            </Card>
                                        </Gallery>
                                    </Stack>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Card>
                                <CardTitle>
                                    <Split>
                                        <SplitItem>Inventory</SplitItem>
                                        <SplitItem isFilled>
                                            <Help help="TODO" />
                                        </SplitItem>
                                        <SplitItem>
                                            <Button variant="link" isInline>
                                                Go to Inventory List
                                            </Button>
                                        </SplitItem>
                                    </Split>
                                </CardTitle>
                                <CardBody>&nbsp;</CardBody>
                                <CardFooter>
                                    <Bullseye>
                                        <Button>Create inventory</Button>
                                    </Bullseye>
                                </CardFooter>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Card>
                                <CardTitle>
                                    <Split>
                                        <SplitItem>Topology</SplitItem>
                                        <SplitItem isFilled>
                                            <Help help="TODO" />
                                        </SplitItem>
                                        <SplitItem>
                                            <Button variant="link" isInline>
                                                Go to Topology View
                                            </Button>
                                        </SplitItem>
                                    </Split>
                                </CardTitle>
                                <CardBody>&nbsp;</CardBody>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Card>
                                <CardTitle>
                                    <Split>
                                        <SplitItem>Job Status</SplitItem>
                                        <SplitItem isFilled>
                                            <Help help="TODO" />
                                        </SplitItem>
                                        <SplitItem>
                                            <Button variant="link" isInline>
                                                Go to Jobs List
                                            </Button>
                                        </SplitItem>
                                    </Split>
                                </CardTitle>
                                <CardBody>&nbsp;</CardBody>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Card>
                                <CardTitle>
                                    <Split>
                                        <SplitItem>Top Job Templates</SplitItem>
                                        <SplitItem isFilled>
                                            <Help help="TODO" />
                                        </SplitItem>
                                    </Split>
                                </CardTitle>
                                <CardBody>&nbsp;</CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </PageSection>
            </Scrollable>
        </Fragment>
    )
}
