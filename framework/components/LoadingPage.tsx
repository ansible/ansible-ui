import { PageSection, Skeleton } from '@patternfly/react-core'
import { Fragment } from 'react'
import { ICatalogBreadcrumb, PageHeader } from '../PageHeader'

export function LoadingPage(props: { title?: string; breadcrumbs?: ICatalogBreadcrumb[] }) {
    return (
        <Fragment>
            <PageHeader
                breadcrumbs={props.breadcrumbs}
                title={props.title ?? ((<Skeleton width="200px" />) as unknown as string)}
            />
            <PageSection
            // variant={theme === ThemeE.Dark ? undefined : 'light'}
            >
                {/* <Bullseye style={{ paddingTop: 32 }}>
                    <Spinner />
                </Bullseye> */}
            </PageSection>
        </Fragment>
    )
}
