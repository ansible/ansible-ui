import {
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
    Stack,
    Text,
} from '@patternfly/react-core'
import { Fragment } from 'react'
import { PageHeader } from '../../../framework'
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
                    <Grid hasGutter>
                        <GridItem>
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
                        <GridItem>
                            <Card isRounded>
                                <CardTitle>Execution Environments</CardTitle>
                                <CardBody>
                                    <Text>
                                        The ability to build and deploy Python virtual environments for automation has been replaced by
                                        Ansible execution environments. Unlike legacy virtual environments, execution environments are
                                        container images that make it possible to incorporate system-level dependencies and collection-based
                                        content. Each execution environment allows you to have a customized image to run jobs, and each of
                                        them contain only what you need when running the job, nothing more.
                                    </Text>
                                </CardBody>
                                <CardBody>
                                    <Stack hasGutter>
                                        <Text>Sync from the available execution environments below or create your own.</Text>
                                        <Split>
                                            <Button>Create execution environment</Button>
                                        </Split>
                                        <Gallery hasGutter>
                                            <Card isFlat>
                                                <CardTitle>Execution environment 1</CardTitle>
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
                                                <CardTitle>Execution environment 2</CardTitle>
                                                <CardBody>
                                                    <Stack hasGutter>
                                                        <Text>This is the description. This ia a very long long long description.</Text>
                                                    </Stack>
                                                </CardBody>
                                                <CardFooter>
                                                    <Button variant="secondary">Sync</Button>
                                                </CardFooter>
                                            </Card>
                                            <Card isFlat>
                                                <CardTitle>Execution environment 3</CardTitle>
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
                                                <CardTitle>Execution environment 4</CardTitle>
                                                <CardBody>
                                                    <Stack hasGutter>
                                                        <Text>This is the description.</Text>
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
                    </Grid>
                </PageSection>
            </Scrollable>
        </Fragment>
    )
}
