import { Fragment, useMemo } from 'react'
import { PageHeader } from '../../../framework'
import { RouteE } from '../../route'

export default function Settings() {
    const breadcrumbs = useMemo(() => [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'Settings' }], [])
    return (
        <Fragment>
            <PageHeader title="Settings" breadcrumbs={breadcrumbs} />
        </Fragment>
    )
}
