import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../Routes'

export function HubRouter() {
    return (
        <Routes>
            <Route path={'/'} element={<div>TODO</div>} />
            <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
        </Routes>
    )
}
