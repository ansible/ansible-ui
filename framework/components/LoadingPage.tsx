import { PageSection, Skeleton } from '@patternfly/react-core'
import { Fragment } from 'react'
import { ICatalogBreadcrumb, PageHeader } from '../PageHeader'
import { ThemeE, useTheme } from '../Theme'
import { useTranslation } from './useTranslation'

export function LoadingPage(props: { title?: string; breadcrumbs?: ICatalogBreadcrumb[] }) {
    const { t } = useTranslation()
    const [theme] = useTheme()
    return (
        <Fragment>
            <PageHeader breadcrumbs={props.breadcrumbs} title={props.title ?? <Skeleton width="200px" />} />
            <PageSection variant={theme === ThemeE.Dark ? undefined : 'light'}>
                {/* <Bullseye style={{ paddingTop: 32 }}>
                    <Spinner />
                </Bullseye> */}
            </PageSection>
        </Fragment>
    )
}
