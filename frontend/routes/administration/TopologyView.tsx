import { Fragment, useMemo } from 'react'
import { PageHeader } from '../../../framework'
import { RouteE } from '../../route'

export default function TopologyView() {
    const breadcrumbs = useMemo(() => [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'Topology view' }], [])
    return (
        <Fragment>
            <PageHeader title="Topology view" breadcrumbs={breadcrumbs} />
        </Fragment>
    )
}
